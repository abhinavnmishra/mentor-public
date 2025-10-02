package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.cortex.backend.model.FocusArea;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateFocusAreaRequest {
    private String id;
    private String parentId;
    private String name;
    private String objective;
    private String description;
    private String criteria;
    private String coachingProgram;
    private Double minScore;
    private Double maxScore;
    private Double threshold1;
    private Double threshold2;
    private Double threshold3;

    @JsonIgnore
    public FocusArea.Eval eval(){
        return new FocusArea.Eval(minScore,maxScore,threshold1,threshold2,threshold3);
    }

} 