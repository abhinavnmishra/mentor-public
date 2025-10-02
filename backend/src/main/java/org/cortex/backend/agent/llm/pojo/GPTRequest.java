package org.cortex.backend.agent.llm.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.cortex.backend.agent.chat.constant.MessageType;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.agent.utility.Converter;
import org.cortex.backend.exception.ValidationException;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
public class GPTRequest {

    String model;
    List<RequestMessage> input = new ArrayList<>();
    Boolean stream = false;
    Double temperature = 0.2;
    String user = "userId";
    ObjectFormat text = new ObjectFormat();
    Long max_output_tokens = 100000L;

    public GPTRequest(String model) {
        this.model = model;
    }

    @Data
    public static class RequestMessage {
        String role;
        String content;

        public static RequestMessage convert (MessageItem messageItem) throws ValidationException {
            RequestMessage requestMessage = new RequestMessage();

            switch (messageItem.getType()) {
                case MessageType.USER:
                    requestMessage.setRole("user");
                    requestMessage.setContent(messageItem.getMessage());
                    return requestMessage;
                case MessageType.USER_INTERNAL:
                    requestMessage.setRole("system");
                    requestMessage.setContent(messageItem.getMessage() + " ");
                    return requestMessage;
                case MessageType.SYSTEM:
                    requestMessage.setRole("system");
                    requestMessage.setContent("System Message : " + messageItem.getMessage() + " ");
                    return requestMessage;
                case MessageType.AGENT:
                    requestMessage.setRole("assistant");
                    requestMessage.setContent(messageItem.getMessage());
                    return requestMessage;
                case MessageType.AGENT_INTERNAL:
                    requestMessage.setRole("assistant");
                    try {
                        requestMessage.setContent("Assistant Thought : " + messageItem.getMessage() + "; \n " + Converter.objectToXml(messageItem.getPlan()));
                    } catch (Exception e) {
                        throw new ValidationException(e.getMessage());
                    }
                    return requestMessage;
                case MessageType.TOOL_EXECUTE:
                    requestMessage.setRole("assistant");
                    String text = "Tool Execution Initiated : " + messageItem.getMessage();
                    if (messageItem.getApprovalRequired()) {
                        if (messageItem.getApproved()){
                            text += "; \n Usage is approved by user.";
                        } else {
                            text += "; \n Usage is not yet approved by user.";
                        }
                    }
                    requestMessage.setContent(text);
                    return requestMessage;
                case MessageType.TOOL_RESULT:
                    requestMessage.setRole("system");
                    requestMessage.setContent("Tool Execution Completed. Results : " + messageItem.getMessage() + " ");
                    return requestMessage;
                default:
                    return null;
            }

        }

    }

    @Data
    public static class ObjectFormat {
        JsonSchema format = new JsonSchema();

        @Data
        public static class JsonSchema {

            String type = "json_schema";
            String name = "agent_response_schema";
            Boolean strict = true;
            Map<String, Object> schema;

            @JsonIgnore
            ObjectMapper mapper = new ObjectMapper();

            @JsonIgnore
            String schemaString;
            {
                try {
                    ClassPathResource resource = new ClassPathResource("agent/GPT/openai_api_json_schema.json");
                    schemaString = new String(Files.readAllBytes(resource.getFile().toPath()), StandardCharsets.UTF_8);
                    schema = mapper.readValue(schemaString, Map.class);
                } catch (IOException e) {
                    e.printStackTrace();
                    schema = new HashMap<>();
                    schemaString = "{}";
                }
            }
        }
    }



}
