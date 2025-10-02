package org.cortex.backend.llm.Surveys.pojo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Data
@AllArgsConstructor
public class ChatItem {

    private String type;
    private String content;
    private ArrayList<String> options;
    private String highScoreCriteria;
    private String lowScoreCriteria;
    private ArrayList<Integer> optionScores;

    public ChatItem () {
        this.options = new ArrayList<>();
        this.optionScores = new ArrayList<>();
    }

    public OpenAIRequest.Message toMessage(){
        OpenAIRequest.Message message = new OpenAIRequest.Message();
        String context = "<<message>> <<options>> <<scoring>>";
        if("message".equals(this.type)){
            message.setRole("assistant");
            context = context.replace("<<message>>", this.content);
            context = context.replace("<<options>>", "");
            context = context.replace("<<scoring>>", "");
        } else if("user".equals(this.type)){
            message.setRole("user");
            context = context.replace("<<message>>", this.content);
            context = context.replace("<<options>>", "");
            context = context.replace("<<scoring>>", "");
        } else if(this.type.contains("question")){
            message.setRole("assistant");
            context = context.replace("<<message>>", this.content + "; Question Type = " + this.type.replace("question-", ""));
            if(this.type.contains("mcq")){
                context = context.replace("<<options>>","Options : " + String.join(", ", this.options));
                if (optionScores != null && !optionScores.isEmpty()) {
                    context = context.replace("<<scoring>>", "; Scores : " + optionScores.toString() +
                            "; High Score Criteria: " + (highScoreCriteria != null ? highScoreCriteria : "") +
                            "; Low Score Criteria: " + (lowScoreCriteria != null ? lowScoreCriteria : ""));
                } else {
                    context = context.replace("<<scoring>>", "");
                }
            } else {
                context = context.replace("<<scoring>>", "");
            }
        }
        message.setContent(context);
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
