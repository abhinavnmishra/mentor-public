package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.constant.Status;
import org.cortex.backend.dto.FocusAreaDto;
import org.cortex.backend.dto.TrainerResponseDTO;
import org.cortex.backend.events.service.EventListener;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "coaching_program")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(EventListener.class)
public class CoachingProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Column(length=5000)
    private String description;

    @ManyToOne
    private ClientOrganisation clientOrganisation;

    @ManyToOne
    private Trainer trainer;

    private LocalDate startDate;

    private LocalDate endDate;

    @OneToOne
    @JsonIgnore
    private Report report;

    @OneToMany
    @JsonIgnore
    private List<FocusArea> focusAreas;

    @Enumerated(EnumType.STRING) // Store enum as STRING in DB
    @Column(nullable = false)
    private Status status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    private String calendlyEventType;
    private String calendlyEventTypeSchedulingUrl;

    @Transient
    private TrainerResponseDTO trainerResponseDTO;

    @Transient
    @JsonProperty("focusAreas")
    private List<FocusAreaDto> focusAreaDtoList;

    @JsonIgnore
    public String getContext() {
        StringBuilder focusAreasJson = new StringBuilder("[");
        if (focusAreas != null && !focusAreas.isEmpty()) {
            for (FocusArea area : focusAreas) {
                if (area != null) {
                    focusAreasJson.append(area.getContext()).append(",");
                }
            }
            focusAreasJson.setLength(focusAreasJson.length() - 1); // Remove last comma
        }
        focusAreasJson.append("]");

        return String.format("""
                {
                    "id": "%s",
                    "title": "%s",
                    "description": "%s",
                    "startDate": "%s",
                    "endDate": "%s",
                    "status": "%s",
                    "clientOrganisation": %s,
                    "trainer": %s,
                    "focusAreas": %s
                }""",
                id,
                title != null ? title.replace("\"", "\\\"") : "",
                description != null ? description.replace("\"", "\\\"") : "",
                startDate != null ? startDate.toString() : "",
                endDate != null ? endDate.toString() : "",
                status != null ? status.toString() : "",
                clientOrganisation != null ? clientOrganisation.getContext() : "null",
                trainer != null ? trainer.getContext() : "null",
                focusAreasJson.toString()
        );
    }

    @JsonIgnore
    public String getIndexData() {
        StringBuilder focusAreasJson = new StringBuilder("[");
        if (focusAreas != null && !focusAreas.isEmpty()) {
            for (FocusArea area : focusAreas) {
                if (area != null) {
                    focusAreasJson.append(area.getIndexData()).append(",");
                }
            }
            focusAreasJson.setLength(focusAreasJson.length() - 1); // Remove last comma
        }
        focusAreasJson.append("]");

        return String.format("""
                {
                    "id": "%s",
                    "title": "%s",
                    "startDate": "%s",
                    "endDate": "%s",
                    "status": "%s",
                    "clientOrganisation": %s,
                    "trainer": %s,
                    "focusAreas": %s
                }""",
                id,
                title != null ? title.replace("\"", "\\\"") : "",
                startDate != null ? startDate.toString() : "",
                endDate != null ? endDate.toString() : "",
                status != null ? status.toString() : "",
                clientOrganisation != null ? clientOrganisation.getContext() : "null",
                trainer != null ? trainer.getIndexData() : "null",
                focusAreasJson.toString()
        );
    }

}
