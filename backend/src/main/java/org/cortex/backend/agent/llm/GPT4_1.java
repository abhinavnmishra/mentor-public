package org.cortex.backend.agent.llm;

import org.cortex.backend.agent.chat.constant.MessageType;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.agent.chat.model.AgentChat;
import org.cortex.backend.agent.llm.pojo.GPTRequest;
import org.cortex.backend.agent.llm.pojo.GPTResponse;
import org.cortex.backend.agent.service.UsageTrackerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service("GPT4_1")
public class GPT4_1 extends AbstractLLM {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Autowired
    private UsageTrackerService usageTrackerService;
    private static final Logger logger = LoggerFactory.getLogger(GPT4_1.class);
    private final String MODEL = "gpt-4.1-2025-04-14";
    private final String API_URL = "https://api.openai.com/v1/responses";
    private final Integer LAST_CHATS = 30;
    private GPTRequest gptRequest = new GPTRequest(MODEL);
    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public List<MessageItem> call(AgentChat agentChat){

        try {
            gptRequest.setInput(agentChat.getLastMessages(LAST_CHATS).stream().map(GPTRequest.RequestMessage::convert).collect(Collectors.toList()));
            saveRequestToFile(gptRequest);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Create the request entity
            HttpEntity<GPTRequest> requestEntity = new HttpEntity<>(gptRequest, headers);

            // Call the API
            GPTResponse gptResponse = restTemplate.postForObject(API_URL, requestEntity, GPTResponse.class);

            usageTrackerService.updateUsage(gptResponse.getUsage(), agentChat.getTrainer().getUser());

            // Save the response for logging/debugging
            saveResponseToFile(gptResponse);

            return MessageItem.getItemsByContent(gptResponse.getOutput().getFirst().getContent().getFirst().getText());

        } catch (Exception e) {
            logger.error("Error processing user query", e);
            List<MessageItem> errorResult = new ArrayList<>();
            MessageItem error = new MessageItem();
            error.setType(MessageType.AGENT);
            error.setMessage("I'm sorry, I encountered an error while processing your request");
            errorResult.add(error);
            return errorResult;
        }

    }

}
