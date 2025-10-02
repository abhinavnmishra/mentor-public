package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "coaching_session")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CoachingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private CoachingProgram coachingProgram;

    @ManyToOne
    private Client client;

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
                    "coachingProgram": %s,
                    "client": %s
                }""",
                id,
                coachingProgram != null ? coachingProgram.getContext() : "null",
                client != null ? client.getContext() : "null"
        );
    }

    public ClientProgramView getClientProgramView() {
        ClientProgramView view = new ClientProgramView();
        view.setTitle(coachingProgram.getTitle());
        view.setDescription(coachingProgram.getDescription());
        view.setStartDate(coachingProgram.getStartDate() == null ? null : coachingProgram.getStartDate().toString());
        view.setEndDate(coachingProgram.getEndDate() == null ? null : coachingProgram.getEndDate().toString());
        view.setStatus(coachingProgram.getStatus().name());
        view.setCoachingSessionId(this.id);
        view.setProgramId(this.coachingProgram.getId());
        if (coachingProgram.getTrainer() != null) {
            view.setTrainer(coachingProgram.getTrainer().getView());
        }
        view.setCalendlyEventTypeUrl(coachingProgram.getCalendlyEventTypeSchedulingUrl());
        return view;
    }

    @Data
    public class ClientProgramView {
        private UUID coachingSessionId;
        private UUID programId;
        private String title;
        private String description;
        private String startDate;
        private String endDate;
        private String status;
        private Integer milestoneCount;
        private Trainer.TrainerView trainer;
        private String calendlyEventTypeUrl;
    }
}
