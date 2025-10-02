package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "activity")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    @Column(length=5000)
    private String notes;

    @Column(length=5000)
    private String description;

    private UUID exerciseId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<ActivityFile> files;

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
                    "name": "%s",
                    "notes": "%s",
                    "description": "%s"
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : "",
                notes != null ? notes.replace("\"", "\\\"") : "",
                description != null ? description.replace("\"", "\\\"") : ""
        );
    }

    @JsonIgnore
    public String getIndexData() {

        return String.format("""
                {
                    "id": "%s",
                    "name": "%s"
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : ""
        );
    }

    @Data
    public static class ActivityFile {
        private String fileName;
        private String contentType;
        private String entityId;
    }
}
