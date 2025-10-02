package org.cortex.backend.llm.Evaluations.pojo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.cortex.backend.llm.Surveys.pojo.ChatItem;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EvaluationResponseFormat {

    private String responseId;
    private Double score;

    public static ArrayList<EvaluationResponseFormat> getItemsByContent(String content){
        ObjectMapper mapper = new ObjectMapper();
        try {
            HashMap<String, Object> parentObject = mapper.readValue(content, HashMap.class);
            List<HashMap<String,Object>> items = (List<HashMap<String,Object>>) parentObject.get("items");
            ArrayList<EvaluationResponseFormat> evaluation = new ArrayList<>();
            for(HashMap<String,Object> item : items){
                evaluation.add(mapper.convertValue(item, EvaluationResponseFormat.class));
            }
            return evaluation;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

}
