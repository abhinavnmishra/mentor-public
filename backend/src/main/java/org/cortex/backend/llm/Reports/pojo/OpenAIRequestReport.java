package org.cortex.backend.llm.Reports.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.cortex.backend.llm.Reports.ReportAgentPrompts;

import java.util.ArrayList;
import java.util.List;

@Data
public class OpenAIRequestReport {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    private String model;
    private List<OpenAIRequestReport.Message> messages;

    @JsonProperty("response_format")
    private Object responseFormat; // This will be populated from the JSON template

    @Data
    public static class Message {
        private String role;
        private String content;
    }
    
    /**
     * Creates a new Message with the specified role and content
     * 
     * @param role The role (system, user, assistant)
     * @param content The message content
     * @return A new Message instance
     */
    private static Message createMessage(String role, String content) {
        Message message = new Message();
        message.setRole(role);
        message.setContent(content);
        return message;
    }

    public static OpenAIRequestReport create(String model, String programContext, String reportContext, String reportSchema, String userPrompt, List<OpenAIRequestReport.Message> chatContext) {

        List<String> systemPrompts = List.of(ReportAgentPrompts.getAboutTheToolContext(), ReportAgentPrompts.getSystemPrompts(), ReportAgentPrompts.getAiAgentGuidance(), ReportAgentPrompts.getAiAgentProcessingGuidance(), ReportAgentPrompts.getJsonPathExamples(), programContext, reportSchema, reportContext);

        OpenAIRequestReport request = new OpenAIRequestReport();
        request.setModel(model);

        ArrayList<OpenAIRequestReport.Message> messageList = new ArrayList<>();
        
        // Add all system prompts as separate system messages
        for (String promptContent : systemPrompts) {
            messageList.add(createMessage("system", promptContent));
        }
        
        // Add chat context if it exists
        if (chatContext != null && !chatContext.isEmpty()) {
            messageList.addAll(chatContext);
        }
        
        // Add user message
        messageList.add(createMessage("user", userPrompt));

        request.setMessages(messageList);

        return request;
    }

}
