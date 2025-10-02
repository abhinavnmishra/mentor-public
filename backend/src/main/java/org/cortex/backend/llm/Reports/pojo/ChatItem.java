package org.cortex.backend.llm.Reports.pojo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.cortex.backend.llm.Surveys.pojo.OpenAIRequest;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatItem {

    private String type;
    private String message;
    private String path;
    private String value;

    public ChatItem(String type, String message) {
        this.type = type;
        this.message = message;
    }

    public OpenAIRequestReport.Message toMessage(){
        OpenAIRequestReport.Message message = new OpenAIRequestReport.Message();

        if("message".equals(this.type)){
            message.setRole("assistant");

        } else if("user".equals(this.type)){
            message.setRole("user");

        } else if(this.type.contains("operation")){
            message.setRole("assistant");

        }
        message.setContent(this.message);
        return message;
    }

    public static ArrayList<ChatItem> getItemsByContent(String content){
        ObjectMapper mapper = new ObjectMapper();
        try {
            HashMap<String, Object> parentObject = mapper.readValue(content, HashMap.class);
            List<HashMap<String,Object>> items = (List<HashMap<String,Object>>) parentObject.get("items");
            ArrayList<ChatItem> chatItems = new ArrayList<>();
            for(HashMap<String,Object> item : items){
                chatItems.add(mapper.convertValue(item, ChatItem.class));
            }
            return chatItems;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

}
