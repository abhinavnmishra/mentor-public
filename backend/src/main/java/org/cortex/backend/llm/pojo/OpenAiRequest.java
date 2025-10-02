package org.cortex.backend.llm.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public abstract class OpenAiRequest {

    private String model;

    private List<Message> messages;

    @JsonProperty("temperature")
    private Double temperature = 0.7;

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

}
