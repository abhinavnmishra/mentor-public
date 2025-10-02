package org.cortex.backend.llm.Completions.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OpenAIRequestTextCompletion {
    private String model;

    private List<Message> messages;

    private Double temperature = 0.9;

    @JsonProperty("max_tokens")
    private Integer maxTokens = 1500;

    @JsonProperty("top_p")
    private Integer topP = 1;

    @JsonProperty("frequency_penalty")
    private Integer frequencyPenalty = 0;

    @JsonProperty("presence_penalty")
    private Integer presencePenalty = 0;

    @Data
    public static class Message {
        private String role;
        private String content;
    }

    public static OpenAIRequestTextCompletion create(String model, List<String> contextList, String currentText) {
        OpenAIRequestTextCompletion request = new OpenAIRequestTextCompletion();
        request.setModel(model);

        List<Message> messages = new ArrayList<>();
        for(int i = 0; i<contextList.size(); i++) {
            Message message = new Message();
            message.setRole((i != (contextList.size()-1)) ? "system" : "user");
            message.setContent(contextList.get(i).replace("<<text_box>>", (currentText == null ? "" : currentText)));
            messages.add(message);
        }
        request.setMessages(messages);
        
        return request;
    }
} 