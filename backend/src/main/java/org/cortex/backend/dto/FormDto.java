package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.*;
import org.cortex.backend.model.Survey;
import org.cortex.backend.model.SurveyResponse;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FormDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerItem {

        @JsonProperty("questionId")
        private String questionId;

        @JsonProperty("responseId")
        private String responseId;
        
        @JsonProperty("question")
        private String question;

        @JsonProperty("answer")
        private String answer;

        @JsonProperty("rating")
        private Integer rating;

        @JsonProperty("version")
        private int version;
        
        @JsonProperty("index")
        private Integer index;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("options")
        private String[] options;

        @JsonProperty("optionsSelected")
        private String[] optionsSelected;
        
        @JsonProperty("mentees")
        private String[] mentees;

        private SurveyWizardDto.Eval eval;
    }

    private SurveyResponse surveyResponse;
    private ArrayList<ArrayList<AnswerItem>> responses;
    private String logoImageUrl;
    private String headerImageUrl;
    private String footerImageUrl;

    public static String getAllAnswerItemContext(List<AnswerItem> answerItems) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            ArrayNode responseArray = objectMapper.createArrayNode();
            
            for (AnswerItem item : answerItems) {
                if (item == null) continue;
                
                ObjectNode responseNode = objectMapper.createObjectNode();
                
                // Add required fields
                responseNode.put("responseId", item.getResponseId());
                responseNode.put("question", item.getQuestion());
                responseNode.put("response", item.getAnswer()); // answer renamed to response
                
                // Add eval-related fields
                if (item.getEval() != null) {
                    // Focus areas
                    if (item.getEval().getFocusAreas() != null) {
                        ArrayNode focusAreasNode = objectMapper.createArrayNode();
                        for (String focusArea : item.getEval().getFocusAreas()) {
                            focusAreasNode.add(focusArea);
                        }
                        responseNode.set("focusAreaIds", focusAreasNode); // renamed to focusAreaIds
                    }
                    
                    // High score criteria
                    if (item.getEval().getQuestion_eval_score_criteria_high() != null) {
                        responseNode.put("highScoreCriteria", item.getEval().getQuestion_eval_score_criteria_high());
                    }
                    
                    // Low score criteria
                    if (item.getEval().getQuestion_eval_score_criteria_low() != null) {
                        responseNode.put("lowScoreCriteria", item.getEval().getQuestion_eval_score_criteria_low());
                    }
                }
                
                // Add fixed score range
                responseNode.put("maxScore", 10.0);
                responseNode.put("minScore", 0.0);
                
                responseArray.add(responseNode);
            }
            
            return objectMapper.writeValueAsString(responseArray);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return "[]";
        }
    }
}
