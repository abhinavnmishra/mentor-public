package org.cortex.backend.llm.Reports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.cortex.backend.dto.ReportDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.llm.Reports.pojo.ChatItem;
import org.cortex.backend.llm.Reports.pojo.OpenAIRequestReport;
import org.cortex.backend.llm.Reports.model.ReportWizardChat;
import org.cortex.backend.llm.Reports.repository.ReportWizardChatRepository;
import org.cortex.backend.llm.pojo.GPTResponse;
import org.cortex.backend.model.Report;
import org.cortex.backend.repository.ReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import jakarta.annotation.PostConstruct;

/**
 * Service to handle interactions with the Report AI Agent
 */
@Service
public class AskReportWizardService {

    private static final Logger logger = LoggerFactory.getLogger(AskReportWizardService.class);
    private static final String REQUEST_LOG_DIR = "logs/openai_requests";
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private ReportAgentHelper reportAgentHelper;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ReportWizardChatRepository reportWizardChatRepository;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.url}")
    private String openAiUrl;

    @Value("${spring.ai.openai.model}")
    private String model;

    // Inject the template JSON file
    @Value("classpath:templates/report_wizard_template.json")
    private Resource templateResource;

    private Object responseFormat;

    @PostConstruct
    public void init() throws IOException {
        // Create logs directory if it doesn't exist
        File logDir = new File(REQUEST_LOG_DIR);
        if (!logDir.exists()) {
            logDir.mkdirs();
        }

        // Load the JSON content from the resource and extract response_format
        JsonNode rootNode = objectMapper.readTree(templateResource.getInputStream());
        responseFormat = objectMapper.treeToValue(rootNode.get("response_format"), Object.class);
    }

    /**
     * Retrieve the chat history for a report
     *
     * @param reportId UUID of the report
     * @param count Number of messages to retrieve
     * @return List of chat messages
     */
    public List<ChatItem> retrieveReportChat(UUID reportId, int count) {
        Report report = reportRepository.findById(reportId)
            .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        if (report.getReportWizardChat() == null) {
            // Create a new chat for this report if it doesn't exist
            ReportWizardChat chat = new ReportWizardChat();
            report.setReportWizardChat(reportWizardChatRepository.save(chat));
            reportRepository.save(report);
        }

        return report.getReportWizardChat().getChats(count);
    }

    public ReportDto processUserQuery(Report report, String userPrompt, int count){
        // Get the report
        Report persistedReport = reportRepository.findById(report.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with given id"));

        // Initialize chat if needed
        if (persistedReport.getReportWizardChat() == null) {
            ReportWizardChat chat = new ReportWizardChat();
            chat = reportWizardChatRepository.save(chat);
            persistedReport.setReportWizardChat(chat);
            report = reportRepository.save(persistedReport);
        }

        ReportWizardChat reportWizardChat = persistedReport.getReportWizardChat();

        // Get chat context
        List<OpenAIRequestReport.Message> chatContext = reportWizardChat.getChatContext(Report.chatCount + 10);

        // Get the report schema and examples
        String reportSchema = "\n--- CURRENT REPORT SCHEMA ---\n" +
                ReportAgentPrompts.getReportSchema() +
                "\n\n";

        // Get program context (milestones, focus areas, clients)
        String programContext = reportAgentHelper.getCompleteProgramContext(persistedReport);

        // Add report data
        String reportContext = "\n--- CURRENT REPORT DATA ---\n" +
                report.toPrettyJson() +
                "\n\n";

        List<ChatItem> response = promptAgent(programContext, reportContext, reportSchema, userPrompt, chatContext);

        // Add user message to chat history
        ChatItem chatItem = new ChatItem();
        chatItem.setType("user");
        chatItem.setMessage(userPrompt);
        reportWizardChat.addChat(chatItem);

        for (ChatItem item : response) {
            if ("write-operation".equals(item.getType()) && item.getPath() != null && item.getValue() != null) {
                try {
                    // Execute the write operation
                    logger.info("Executing write operation: {}", item.getMessage());
                    report = reportAgentHelper.executeWriteOperation(report, item.getPath(), item.getValue());
                } catch (Exception e) {
                    logger.error("Error executing write operation: {}", e.getMessage());
                    // Add an error message to the response
                    ChatItem errorItem = new ChatItem();
                    errorItem.setType("message");
                    errorItem.setMessage("Error executing update: " + e.getMessage());
                    response.add(errorItem);
                }
            }
        }
        
        // Add all responses to chat history
        reportWizardChat.addChats(response);
        count += response.size();

        // Save the chat history
        reportWizardChat = reportWizardChatRepository.save(reportWizardChat);

        ReportDto responseDto = ReportDto.fromEntity(report);
        responseDto.setChatItems(reportWizardChat.getChats(count));
        // Return updated chat history
        return responseDto;
    }

    public List<ChatItem> promptAgent(String programContext, String reportContext, String reportSchema, String userPrompt, List<OpenAIRequestReport.Message> chatContext) {
        try {
            // Create request using POJO
            OpenAIRequestReport request = OpenAIRequestReport.create(
                model,
                programContext,
                reportContext,
                reportSchema,
                userPrompt,
                chatContext
            );
            request.setResponseFormat(responseFormat);

            saveRequestToFile(request);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create the request entity
            HttpEntity<OpenAIRequestReport> requestEntity = new HttpEntity<>(request, headers);

            // Call the API
            GPTResponse gptResponse = restTemplate.postForObject(openAiUrl, requestEntity, GPTResponse.class);

            saveResponseToFile(gptResponse);

            String refusal = gptResponse.getChoices().get(0).getMessage().getRefusal();
            if(refusal == null || "".equals(refusal)){
                return ChatItem.getItemsByContent(gptResponse.getChoices().get(0).getMessage().getContent());
            } else {
                throw new RuntimeException("Failed to generate response.");
            }

        } catch (Exception e) {
            logger.error("Error processing user query", e);
            List<ChatItem> errorResult = new ArrayList<>();
            ChatItem error = new ChatItem();
            error.setType("message");
            error.setMessage("I'm sorry, I encountered an error while processing your request");
            errorResult.add(error);
            return errorResult;
        }
    }

    /**
     * Save the OpenAI request to a file for logging/debugging
     */
    private void saveRequestToFile(OpenAIRequestReport request) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/report_agent_request_%s.json", REQUEST_LOG_DIR, timestamp);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), request);

            logger.info("Saved OpenAI request to file: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to save request to file", e);
        }
    }

    /**
     * Save the OpenAI response to a file for logging/debugging
     */
    private void saveResponseToFile(GPTResponse response) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/report_agent_response_%s.json", REQUEST_LOG_DIR, timestamp);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), response);

            logger.info("Saved OpenAI response to file: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to save response to file", e);
        }
    }

}