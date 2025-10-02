package org.cortex.backend.agent.chat.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.cortex.backend.agent.chat.constant.MessageType;

import java.util.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageItem {

    private String messageId;
    private MessageType type;
    private String message;
    private String tool;
    private List<Map<String, Object>> inputs;
    private List<PlanItem> plan;
    private Boolean approvalRequired;
    private Boolean approved;
    private String error_code;
    private String error_message;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PlanItem {
        private String step;
        private String tool;
        private List<Map<String, Object>> inputs;
    }

    public static ArrayList<MessageItem> getItemsByContent(String content){
        ObjectMapper mapper = new ObjectMapper();
        ArrayList<MessageItem> messages = new ArrayList<>();
        try {
            HashMap<String, Object> parentObject = mapper.readValue(content, HashMap.class);
            List<HashMap<String,Object>> items = (List<HashMap<String,Object>>) parentObject.get("actions");
            for(HashMap<String,Object> item : items){
                if (Arrays.stream(MessageType.values()).noneMatch(messageType -> messageType.toString().equalsIgnoreCase(item.get("type").toString())))
                    continue;
                MessageItem messageItem = mapper.convertValue(item, MessageItem.class);
                messageItem.setMessageId(UUID.randomUUID().toString());
                if (messageItem.getType().toString().equalsIgnoreCase(MessageType.TOOL_EXECUTE.toString())){
                    messageItem.setApproved(null);
                }
                messages.add(messageItem);
            }
            return messages;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            MessageItem messageItem = new MessageItem();
            messageItem.setType(MessageType.SYSTEM);
            messageItem.setMessage("Some error occurred while parsing response from GPT API.");
            messages.add(messageItem);
            return messages;
        }
    }

    public Map<String, Object> getInputsForToolCall(Claims claims) {
        Map<String, Object> input = new HashMap<>();
        input.put("claims", claims);
        this.inputs.forEach(parameter -> input.put(parameter.get("name").toString(), parameter.get("value").toString()));
        return input;
    }

}
