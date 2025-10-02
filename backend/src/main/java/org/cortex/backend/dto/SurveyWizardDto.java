package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SurveyWizardDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItem {
        @JsonProperty("id")
        private String id;

        @JsonProperty("version")
        private int version;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("index")
        private Integer index;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("options")
        private String[] options;
        
        @JsonProperty("mentees")
        private String[] mentees;

        @JsonProperty("eval")
        private Eval eval;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Eval {

        @JsonProperty("numericScoring")
        private Boolean numericScoring;

        @JsonProperty("reverseScoring")
        private Boolean reverseScoring;

        @JsonProperty("question_eval_score_criteria_high")
        private String question_eval_score_criteria_high;

        @JsonProperty("question_eval_score_criteria_low")
        private String question_eval_score_criteria_low;

        @JsonProperty("weight")
        private Integer weight;

        @JsonProperty("options")
        private List<Integer> options;

        @JsonProperty("focusAreas")
        private List<String> focusAreas;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusArea {

        @JsonProperty("id")
        private String id;

        @JsonProperty("name")
        private String name;
    }

    public void setFocusAreas(List<org.cortex.backend.model.FocusArea> focusAreaList) {
        // Add logger
        Logger logger = LoggerFactory.getLogger(SurveyWizardDto.class);
        
        logger.info("Setting focus areas with {} input items", focusAreaList != null ? focusAreaList.size() : 0);
        
        if (focusAreaList == null || focusAreaList.isEmpty()) {
            logger.info("Focus area list is null or empty, setting empty list");
            this.focusAreas = new ArrayList<>();
            return;
        }
        
        this.focusAreas = focusAreaList.stream()
                .map(fa -> {
                    boolean isParent = fa.getIsParent() != null && fa.getIsParent();
                    String name;
                    
                    if (isParent) {
                        name = fa.getName();
                        logger.debug("Processing parent focus area: {} (ID: {})", name, fa.getId());
                    } else {
                        String parentName = fa.getParent() != null ? fa.getParent().getName() : "Unknown Parent";
                        name = parentName + " - " + fa.getName();
                        logger.debug("Processing child focus area: {} (ID: {}), parent: {}", 
                                fa.getName(), fa.getId(), parentName);
                    }
                    
                    return new FocusArea(fa.getId().toString(), name);
                })
                .toList();
        
        logger.info("Finished setting focus areas, transformed {} items", this.focusAreas.size());
    }

    private String surveyId;
    private String milestoneId;
    private String chatId;
    private String surveyType;
    private String title;
    private String objective;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Boolean published;
    private Integer peerReviewCount;
    private List<FocusArea> focusAreas;
    private ArrayList<ArrayList<QuestionItem>> questions;

}
