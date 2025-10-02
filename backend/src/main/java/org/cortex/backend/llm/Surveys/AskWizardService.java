package org.cortex.backend.llm.Surveys;

import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.llm.Surveys.model.AskWizardChat;
import org.cortex.backend.llm.Surveys.pojo.ChatItem;
import org.cortex.backend.llm.Surveys.repository.AskWizardChatRepository;
import org.cortex.backend.llm.pojo.GPTResponse;
import org.cortex.backend.llm.Surveys.pojo.OpenAIRequest;
import org.cortex.backend.llm.utilities.ContextEngine;
import org.cortex.backend.model.Client;
import org.cortex.backend.model.CoachingProgram;
import org.cortex.backend.model.FocusArea;
import org.cortex.backend.model.ProgramMilestone;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AskWizardService {

    private static final Logger logger = LoggerFactory.getLogger(AskWizardService.class);
    private static final String REQUEST_LOG_DIR = "logs/openai_requests";

    @Autowired
    private AskWizardChatRepository repository;

    @Autowired
    private ContextEngine contextEngine;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.url}")
    private String openAiUrl;

    @Value("${spring.ai.openai.model}")
    private String model;

    // Inject the JSON template as a Resource
    @Value("classpath:templates/ask_wizard_questions_template_v3.json")
    private Resource askWizardTemplateResource;

    private Object responseFormat;

    // Initialize and load the JSON content after construction
    @PostConstruct
    public void init() throws IOException {
        // Read the JSON content from the resource and extract response_format
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode rootNode = objectMapper.readTree(askWizardTemplateResource.getInputStream());
        responseFormat = objectMapper.treeToValue(rootNode.get("response_format"), Object.class);
    }

    private void saveRequestToFile(OpenAIRequest request) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/request_%s.json", REQUEST_LOG_DIR, timestamp);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), request);

            logger.info("Saved OpenAI request to file: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to save request to file", e);
        }
    }

    public List<ChatItem> retrieveSurveyWizardChat(String uuid, int count) {
        AskWizardChat askWizardChat = repository.findById(UUID.fromString(uuid)).orElseThrow(() -> new ResourceNotFoundException("Invalid Id"));
        return askWizardChat.getChats(count);
    }

    public List<ChatItem> askSurveyWizard(String uuid, String prompt, int count) {
        AskWizardChat askWizardChat = repository.findById(UUID.fromString(uuid)).orElseThrow(() -> new ResourceNotFoundException("Invalid Id"));

        List<ChatItem> response = askSurveyWizardLLM(prompt, askWizardChat.getChatContext(100), getAllClientContextByChatId(askWizardChat.getId()), getAllFocusAreasContextByChatId(askWizardChat.getId()));

        ChatItem chatItem = new ChatItem();
        chatItem.setType("user");
        chatItem.setContent(prompt);
        askWizardChat.addChat(chatItem);
        askWizardChat.addChats(response);
        count += response.size();

        askWizardChat = repository.save(askWizardChat);

        return askWizardChat.getChats(count);
    }

    public List<ChatItem> askSurveyWizardLLM(String prompt, List<OpenAIRequest.Message> chatContext, String clientContext, String focusAreaContext) {
        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request using POJO
        OpenAIRequest request = OpenAIRequest.create(model, prompt, chatContext, clientContext, focusAreaContext);
        request.setResponseFormat(responseFormat);

        saveRequestToFile(request);

        // Prepare the request entity
        HttpEntity<OpenAIRequest> requestEntity = new HttpEntity<>(request, headers);

        // Call the API
        GPTResponse gptResponse = restTemplate.postForObject(openAiUrl, requestEntity, GPTResponse.class);
        String refusal = gptResponse.getChoices().get(0).getMessage().getRefusal();
        if(refusal == null || "".equals(refusal)){
            return ChatItem.getItemsByContent(gptResponse.getChoices().get(0).getMessage().getContent());
        } else {
            ChatItem chatItem = new ChatItem();
            chatItem.setType("message");
            chatItem.setContent(gptResponse.getChoices().get(0).getMessage().getRefusal());
            return List.of(chatItem);
        }
    }

    public String getAllClientContextByChatId(UUID chatId){
        List<Client> clients = repository.findAllClientsByChatId(chatId);

        if (clients.isEmpty()) return "";
        String clientContext = """
                [
                <<ITEMS>>
                ]
                """;
        for (Client client : clients){
            String context = contextEngine.getClientContext(client.getId().toString());
            clientContext = clientContext.replace("<<ITEMS>>", context + """
                    ,<<ITEMS>>
                    """);
        }
        clientContext = clientContext.replaceAll(",<<ITEMS>>", "");
        return clientContext;
    }

    public String getAllFocusAreasContextByChatId(UUID chatId){
        List<ProgramMilestone> programMilestones = repository.findMilestoneByChatId(chatId);

        if (programMilestones.isEmpty()) return "";

        return contextEngine.getAllFocusAreasByMilestoneContext(programMilestones.getFirst().getId().toString());
    }

}
