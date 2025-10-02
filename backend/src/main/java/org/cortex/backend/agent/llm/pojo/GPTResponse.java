package org.cortex.backend.agent.llm.pojo;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GPTResponse {
    private String id;
    private String object;
    private long created_at;
    private String status;
    private boolean background;
    private Object error;
    private Object incomplete_details;
    private Object instructions;
    private int max_output_tokens;
    private String model;
    private List<Output> output;
    private boolean parallel_tool_calls;
    private Object previous_response_id;
    private Reasoning reasoning;
    private String service_tier;
    private boolean store;
    private double temperature;
    private String tool_choice;
    private List<Object> tools;
    private double top_p;
    private String truncation;
    private Usage usage;
    private Object user;
    private Map<String, Object> metadata;

    @Data
    public static class Output {
        private String id;
        private String type;
        private String status;
        private List<Content> content;
        private String role;
    }

    @Data
    public static class Content {
        private String type;
        private List<Object> annotations;
        private String text;
    }

    @Data
    public static class Reasoning {
        private Object effort;
        private Object summary;
    }

    @Data
    public static class Usage {
        private int input_tokens;
        private InputTokensDetails input_tokens_details;
        private int output_tokens;
        private OutputTokensDetails output_tokens_details;
        private int total_tokens;
    }

    @Data
    public static class InputTokensDetails {
        private int cached_tokens;
    }

    @Data
    public static class OutputTokensDetails {
        private int reasoning_tokens;
    }

}
