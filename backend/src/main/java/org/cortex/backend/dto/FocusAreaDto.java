package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.model.FocusArea;

import java.util.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FocusAreaDto {

    private UUID id;

    private Boolean isParent;

    private String name;

    private String description;

    private String objective;

    private String criteria;

    private List<FocusAreaDto> children;

    private FocusArea.Eval eval;

    private UUID coachingProgramId;

    public static FocusAreaDto convertFocusArea(FocusArea focusArea) {
        FocusAreaDto focusAreaDto = new FocusAreaDto();
        focusAreaDto.setId(focusArea.getId());
        focusAreaDto.setName(focusArea.getName());
        focusAreaDto.setDescription(focusArea.getDescription());
        focusAreaDto.setObjective(focusArea.getObjective());
        focusAreaDto.setCriteria(focusArea.getCriteria());
        focusAreaDto.setIsParent(false);
        focusAreaDto.setEval(focusArea.getEval());
        focusAreaDto.setChildren(new ArrayList<>());
        if(focusArea.getIsParent()){
            focusAreaDto.setIsParent(true);
        }
        return focusAreaDto;
    }

}
