package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.dto.MilestoneStatusDTO;
import org.cortex.backend.security.model.User;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "client")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    private User user;

    @ManyToOne
    private ClientOrganisation clientOrganisation;

    private String gender;

    private String firstName;

    private String lastName;

    private String email;

    private String designation;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private String sessionId;

    @Transient
    private List<MilestoneStatusDTO> milestoneStatusList;

    public String fullName() {
        return firstName + " " + lastName;
    }

    @JsonIgnore
    public String getContext() {
        return String.format("""
                {
                    "id": "%s",
                    "firstName": "%s",
                    "lastName": "%s",
                    "email": "%s",
                    "designation": "%s",
                    "gender": "%s",
                    "organisation": %s
                }""",
                id,
                firstName != null ? firstName.replace("\"", "\\\"") : "",
                lastName != null ? lastName.replace("\"", "\\\"") : "",
                email != null ? email.replace("\"", "\\\"") : "",
                designation != null ? designation.replace("\"", "\\\"") : "",
                gender != null ? gender.replace("\"", "\\\"") : "",
                clientOrganisation != null ? clientOrganisation.getContext() : "null"
        );
    }

    @JsonIgnore
    public String getIndexData() {
        return String.format("""
                {
                    "id": "%s",
                    "firstName": "%s",
                    "lastName": "%s",
                    "email": "%s",
                    "designation": "%s",
                    "gender": "%s",
                    "organisation": %s
                }""",
                id,
                firstName != null ? firstName.replace("\"", "\\\"") : "",
                lastName != null ? lastName.replace("\"", "\\\"") : "",
                email != null ? email.replace("\"", "\\\"") : "",
                designation != null ? designation.replace("\"", "\\\"") : "",
                gender != null ? gender.replace("\"", "\\\"") : "",
                clientOrganisation != null ? clientOrganisation.getName() : "null"
        );
    }
}
