package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.constant.Status;
import org.cortex.backend.dto.FocusAreaDto;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "program_milestone")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ProgramMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private CoachingProgram coachingProgram;

    @Enumerated(EnumType.STRING) // Store enum as STRING in DB
    @Column(nullable = false)
    private MilestoneType type;

    @Enumerated(EnumType.STRING) // Store enum as STRING in DB
    @Column(nullable = false)
    private Status status = Status.PAUSED;

    private String title;

    private Integer index;

    private LocalDate startDate;

    private LocalDate dueDate;

    @Column(length=5000)
    private String description;

    @ManyToMany
    @JsonIgnore
    private List<FocusArea> focusAreas;

    @OneToOne
    private Survey survey;

    @OneToOne
    private Activity activity;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
                    "type": "%s",
                    "status": "%s",
                    "title": "%s",
                    "index": %d,
                    "startDate": "%s",
                    "dueDate": "%s",
                    "description": "%s",
                    "coachingProgram": %s,
                    "survey": %s,
                    "activity": %s,
                    "focusAreas": %s
                }""",
                id,
                type != null ? type.toString() : "",
                status != null ? status.toString() : "",
                title != null ? title.replace("\"", "\\\"") : "",
                index != null ? index : 0,
                startDate != null ? startDate.toString() : "",
                dueDate != null ? dueDate.toString() : "",
                description != null ? description.replace("\"", "\\\"") : "",
                coachingProgram != null ? coachingProgram.getContext() : "null",
                survey != null ? survey.getIndexData() : "null",
                activity != null ? activity.getContext() : "null",
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
                    "type": "%s",
                    "status": "%s",
                    "title": "%s",
                    "index": %d,
                    "startDate": "%s",
                    "dueDate": "%s",
                    "coachingProgram": %s,
                    "survey": %s,
                    "activity": %s,
                    "focusAreas": %s
                }""",
                id,
                type != null ? type.toString() : "",
                status != null ? status.toString() : "",
                title != null ? title.replace("\"", "\\\"") : "",
                index != null ? index : 0,
                startDate != null ? startDate.toString() : "",
                dueDate != null ? dueDate.toString() : "",
                coachingProgram != null ? coachingProgram.getTitle() : "null",
                survey != null ? survey.getIndexData() : "null",
                activity != null ? activity.getIndexData() : "null",
                focusAreasJson.toString()
        );
    }

}
