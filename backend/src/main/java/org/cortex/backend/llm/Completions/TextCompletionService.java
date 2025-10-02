package org.cortex.backend.llm.Completions;

import org.cortex.backend.llm.pojo.GPTResponse;
import org.cortex.backend.llm.Completions.pojo.OpenAIRequestTextCompletion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.function.Function;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

@Service
public class TextCompletionService {

    private static final Logger logger = LoggerFactory.getLogger(TextCompletionService.class);
    private static final String REQUEST_LOG_DIR = "logs/openai_requests";

    @Autowired
    private TextCompletionContext completionContext;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.url}")
    private String openAiUrl;

    @Value("${spring.ai.openai.model}")
    private String defaultModel;

    private final Map<String, Function<String, List<String>>> contextMethodMap = new HashMap<>();

    @PostConstruct
    public void init() {
        // Create logs directory if it doesn't exist
        new File(REQUEST_LOG_DIR).mkdirs();
        // Initialize the map with all available context methods
        contextMethodMap.put("program_description", completionContext::programDescriptionContext);
        contextMethodMap.put("focus_area_objective", completionContext::focusAreaObjectiveContext);
        contextMethodMap.put("focus_area_description", completionContext::focusAreaDescriptionContext);
        contextMethodMap.put("focus_area_criteria", completionContext::focusAreaCriteriaContext);
        contextMethodMap.put("trainer_notes_client_survey", completionContext::trainerNotesOnClientSurveyContext);
        contextMethodMap.put("trainer_notes_client_activity", completionContext::trainerNotesOnClientActivityContext);
        contextMethodMap.put("trainer_notes_client_peer_review", completionContext::trainerNotesOnClientPeerReviewContext);
        contextMethodMap.put("email_body_client", completionContext::emailBodyToClientContext);
        contextMethodMap.put("email_body_client_org", completionContext::emailBodyToClientOrganisationContext);
        contextMethodMap.put("email_body_trainer", completionContext::emailBodyToTrainerContext);
        contextMethodMap.put("milestone_details", completionContext::milestoneDetailsContext);
        contextMethodMap.put("activity_outline", completionContext::activityOutlineContext);
        contextMethodMap.put("activity_trainer_notes", completionContext::activityTrainerNotesContext);
        contextMethodMap.put("survey_objective", completionContext::surveyObjectiveContext);
        contextMethodMap.put("ask_wizard_chat", completionContext::askWizardChatContext);
        contextMethodMap.put("trainer_short_overview", completionContext::trainerShortOverviewContext);
        contextMethodMap.put("trainer_complete_qualification", completionContext::trainerCompleteQualificationContext);
        contextMethodMap.put("trainer_org_email_header", completionContext::trainerOrganisationProfileEmailHeaderContext);
        contextMethodMap.put("trainer_org_email_footer", completionContext::trainerOrganisationProfileEmailFooterContext);
    }

    private void saveRequestToFile(OpenAIRequestTextCompletion request) {
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

    public String generateText(String keyword, String id, String currentText) {
        // Prepare headers
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Get the appropriate context method based on the keyword
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }

        // Get the context list using the selected method
        List<String> contextList = contextMethod.apply(id);
        
        // Extract model from the last element of contextList, or use default if not available
        String modelToUse = defaultModel;
        if (!contextList.isEmpty()) {
            modelToUse = contextList.remove(contextList.size() - 1);
        }

        // Create request using POJO with the extracted model
        OpenAIRequestTextCompletion request = OpenAIRequestTextCompletion.create(modelToUse, contextList, currentText);

        // Save request to file
        saveRequestToFile(request);

        // Prepare the request entity
        HttpEntity<OpenAIRequestTextCompletion> requestEntity = new HttpEntity<>(request, headers);

        // Call the API
        GPTResponse gptResponse = restTemplate.postForObject(openAiUrl, requestEntity, GPTResponse.class);
        String refusal = gptResponse.getChoices().get(0).getMessage().getRefusal();
        if(refusal == null || "".equals(refusal)){
            String response = gptResponse.getChoices().get(0).getMessage().getContent();
            // Remove consecutive asterisks or hash characters (2 or more)
            response = response.replaceAll("\\*{2,}", "");
            response = response.replaceAll("#{2,}", "");
            return response;
        } else {
            return gptResponse.getChoices().get(0).getMessage().getRefusal();
        }
    }
}
