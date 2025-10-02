package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "client_organisation")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientOrganisation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String domain;

    private String size;

    private String email;

    private String logoImageUrl;

    @ManyToOne
    private TrainerOrganisation trainerOrganisation;

    @Transient
    private Long menteeCount;

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
                    "domain": "%s",
                    "size": "%s",
                    "email": "%s",
                    "menteeCount": %d,
                    "trainerOrganisation": %s
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : "",
                domain != null ? domain.replace("\"", "\\\"") : "",
                size != null ? size.replace("\"", "\\\"") : "",
                email != null ? email.replace("\"", "\\\"") : "",
                menteeCount != null ? menteeCount : 0,
                trainerOrganisation != null ? trainerOrganisation.getContext() : "null"
        );
    }

    @JsonIgnore
    public String getIndexData() {
        return String.format("""
                {
                    "id": "%s",
                    "name": "%s",
                    "domain": "%s",
                    "size": "%s"
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : "",
                domain != null ? domain.replace("\"", "\\\"") : "",
                size != null ? size.replace("\"", "\\\"") : ""
        );
    }
}
