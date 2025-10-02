package org.cortex.backend.llm.Evaluations.pojo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ExerciseEvaluationResponseFormat {

    private String title;
    private String content;

    public static ArrayList<ExerciseEvaluationResponseFormat> getItemsByContent(String content){
        ObjectMapper mapper = new ObjectMapper();
        try {
            HashMap<String, Object> parentObject = mapper.readValue(content, HashMap.class);
            List<HashMap<String,Object>> items = (List<HashMap<String,Object>>) parentObject.get("items");
            ArrayList<ExerciseEvaluationResponseFormat> evaluation = new ArrayList<>();
            for(HashMap<String,Object> item : items){
                evaluation.add(mapper.convertValue(item, ExerciseEvaluationResponseFormat.class));
            }
            return evaluation;
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

}
