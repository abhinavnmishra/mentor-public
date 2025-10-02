package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.constant.Status;
import org.cortex.backend.model.Activity;
import org.cortex.backend.model.PeerReview;
import org.cortex.backend.model.Survey;
import org.cortex.backend.model.SurveyResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MilestoneStatusDTO {
    private UUID milestoneId;
    private UUID trackerId;
    private String title;
    private String description;
    private String exerciseId;
    private String exerciseResponseId;
    private MilestoneType type;
    private Integer index;
    private LocalDate startDate;
    private LocalDate dueDate;
    private Status status;
    private String trainerNotes;
    private Boolean isTrainerNotesVisible;
    private Survey survey;
    private PeerReview peerReview;
    private Activity activity;
    private List<SurveyResponse> surveyResponseList;
} 