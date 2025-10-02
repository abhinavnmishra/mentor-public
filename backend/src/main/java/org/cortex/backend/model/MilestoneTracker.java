package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.constant.Status;
import org.cortex.backend.constant.SurveyType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "milestone_tracker")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MilestoneTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private ProgramMilestone programMilestone;

    @ManyToOne
    private CoachingSession coachingSession;

    @Enumerated(EnumType.STRING) // Store enum as STRING in DB
    @Column(nullable = false)
    private Status status;

    @Column(length=5000)
    private String trainerNotes;

    private Boolean trainerNotesIsVisible = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    public String getContext() {
        return String.format("""
                {
                    "id": "%s",
                    "status": "%s",
                    "trainerNotes": "%s",
                    "programMilestone": %s,
                    "coachingSession": %s
                }""",
                id,
                status != null ? status.toString() : "",
                trainerNotes != null ? trainerNotes.replace("\"", "\\\"") : "",
                programMilestone != null ? programMilestone.getContext() : "null",
                coachingSession != null ? coachingSession.getContext() : "null"
        );
    }

    @Data
    public static class ClientMilestoneView {
        private UUID trackerId;
        private UUID clientId;
        private Status trackerStatus;
        private String trainerNotes;
        private LocalDate startDate;
        private LocalDate dueDate;
        private UUID milestoneId;
        private MilestoneType type;
        private Status milestoneStatus;
        private String title;
        private Integer index;
        private String description;
        private Boolean isTrainerNotesVisible;

        // Additional fields for survey/peer review and activity details
        private UUID surveyId;
        private UUID surveyResponseId;
        private String surveyTitle;
        private String objective;
        private Integer peerReviewCount;
        private UUID peerReviewId;
        private SurveyType surveyType;

        private String activityId;
        private String activityName;
        private String activityNotes;
        private List<Activity.ActivityFile> files;
        private String activityDescription;
        private String exerciseResponseId;
        private String reportUrl;

        public ClientMilestoneView(MilestoneTracker milestoneTracker) {
            this.trackerId = milestoneTracker.getId();
            this.clientId = milestoneTracker.getCoachingSession().getClient().getId();
            this.trackerStatus = milestoneTracker.getStatus();
            this.trainerNotes = milestoneTracker.getTrainerNotes();
            this.isTrainerNotesVisible = milestoneTracker.getTrainerNotesIsVisible();
            this.startDate = milestoneTracker.getProgramMilestone().getStartDate();
            this.dueDate = milestoneTracker.getProgramMilestone().getDueDate();
            this.milestoneId = milestoneTracker.getProgramMilestone().getId();
            this.type = milestoneTracker.getProgramMilestone().getType();
            this.milestoneStatus = milestoneTracker.getStatus();
            this.title = milestoneTracker.getProgramMilestone().getTitle();
            this.index = milestoneTracker.getProgramMilestone().getIndex();
            this.description = milestoneTracker.getProgramMilestone().getDescription();

            if (milestoneTracker.getProgramMilestone().getSurvey() != null) {
                this.surveyId = milestoneTracker.getProgramMilestone().getSurvey().getId();
                this.surveyTitle = milestoneTracker.getProgramMilestone().getSurvey().getTitle();
                this.objective = milestoneTracker.getProgramMilestone().getSurvey().getObjective();
                this.peerReviewCount = milestoneTracker.getProgramMilestone().getSurvey().getPeerReviewCount();
                this.surveyType = milestoneTracker.getProgramMilestone().getSurvey().getType();
            }

            if (milestoneTracker.getProgramMilestone().getActivity() != null) {
                this.activityId = milestoneTracker.getProgramMilestone().getActivity().getId().toString();
                this.activityName = milestoneTracker.getProgramMilestone().getActivity().getName();
                this.activityNotes = milestoneTracker.getProgramMilestone().getActivity().getNotes();
                this.activityDescription = milestoneTracker.getProgramMilestone().getActivity().getDescription();
                this.files = milestoneTracker.getProgramMilestone().getActivity().getFiles();
            }
        }
    }

    @Data
    public static class MilestoneDropDownView {
        private UUID id;
        private String title;
        private MilestoneType type;
        private Status status;

        public MilestoneDropDownView(MilestoneTracker milestoneTracker) {
            this.id = milestoneTracker.getId();
            this.title = milestoneTracker.getProgramMilestone().getTitle();
            this.type = milestoneTracker.getProgramMilestone().getType();
            this.status = milestoneTracker.getStatus();
        }
    }
}
