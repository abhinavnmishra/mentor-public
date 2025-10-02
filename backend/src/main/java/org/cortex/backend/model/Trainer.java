package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.cortex.backend.security.model.User;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trainer")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Trainer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    private User user;

    @ManyToOne
    private TrainerOrganisation trainerOrganisation;

    private String firstName;

    private String lastName;

    @Column(length=5000)
    private String shortDescription;

    @Column(length=5000)
    private String longDescription;

    private String email;

    private String linkedinUrl;

    private String location;

    @Column(length=5000)
    private String signature;

    private String signatureImageId;

    private String profileImageUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public String generateSignature(String backendBaseUrl){
        return  """
                <table style="font-family: Arial, sans-serif; font-size: 14px; color: #333;" cellspacing="0" cellpadding="0">
                <tbody>
                <tr>
                <<profile_image>>
                <td><strong style="font-size: 16px; color: #1a1a1a;"><<name>></strong><br><<trainer_organisation>><br><a style="color: #1a73e8; text-decoration: none;" href="mailto:<<email>>"><<email>></a><<location>><<linkedin>></td>
                </tr>
                </tbody>
                </table>
                """
                .replaceAll("<<profile_image>>",
                        (this.profileImageUrl == null || this.profileImageUrl.isEmpty()) ? "" : "<td style=\"padding-right: 15px;\"><img style=\"border-radius: 50%; width: 84px; height: 84px;\" src=\"<<profile_image>>\" alt=\"<<name>>\"></td>".replaceAll("<<profile_image>>", backendBaseUrl + this.profileImageUrl))
                .replaceAll("<<name>>", this.firstName + " " + this.lastName)
                .replaceAll("<<email>>", this.email)
                .replaceAll("<<linkedin>>", (this.linkedinUrl == null || this.linkedinUrl.isEmpty()) ? "" : "<br><a style=\"color: #1a73e8; text-decoration: none;\" href=\"<<linkedin_url>>\">LinkedIn</a>".replaceAll("<<linkedin_url>>", this.linkedinUrl))
                .replaceAll("<<location>>", (this.location == null || this.location.isEmpty()) ? "" : "<br><span style=\"color: #555;\"><<location>></span>".replaceAll("<<location>>", this.location))
                .replaceAll("<<trainer_organisation>>", this.trainerOrganisation.getName());
    }

    @JsonIgnore
    public String getContext() {
        return String.format("""
                {
                    "id": "%s",
                    "firstName": "%s",
                    "lastName": "%s",
                    "email": "%s",
                    "shortDescription": "%s",
                    "longDescription": "%s",
                }""",
                id,
                firstName != null ? firstName.replace("\"", "\\\"") : "",
                lastName != null ? lastName.replace("\"", "\\\"") : "",
                email != null ? email.replace("\"", "\\\"") : "",
                shortDescription != null ? shortDescription.replace("\"", "\\\"") : "",
                longDescription != null ? longDescription.replace("\"", "\\\"") : "",
                signature != null ? signature.replace("\"", "\\\"") : "",
                trainerOrganisation != null ? trainerOrganisation.getContext() : "null"
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
                    "organisation": %s
                }""",
                id,
                firstName != null ? firstName.replace("\"", "\\\"") : "",
                lastName != null ? lastName.replace("\"", "\\\"") : "",
                email != null ? email.replace("\"", "\\\"") : "",
                trainerOrganisation != null ? trainerOrganisation.getIndexData() : "null"
        );
    }

    public TrainerView getView(){
        TrainerView trainerView = new TrainerView();
        trainerView.setId(this.getId().toString());
        trainerView.setFirstName(this.getFirstName());
        trainerView.setLastName(this.getLastName());
        trainerView.setShortDescription(this.getShortDescription());
        trainerView.setLongDescription(this.getLongDescription());
        trainerView.setEmail(this.getEmail());
        trainerView.setLinkedinUrl(this.getLinkedinUrl());
        trainerView.setLocation(this.getLocation());
        trainerView.setProfileImageUrl(this.getProfileImageUrl());
        return trainerView;
    }

    @Data
    public class TrainerView {
        private String id;
        private String firstName;
        private String lastName;
        private String shortDescription;
        private String longDescription;
        private String email;
        private String linkedinUrl;
        private String location;
        private String profileImageUrl;
    }
}
