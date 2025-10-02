package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrainerResponseDTO {

    private UUID id;
    private String userName;
    private String firstName;
    private String userRole;
    private String profileImageUrl;
    private String lastName;
    private String email;
    private String shortDescription;
    private String longDescription;
    private String signature;
    private String signatureImageId;
    private UUID trainerOrganisationId;
    private UUID userId;
    private int programCount;
    private int clientCount;
    private String location;
    private String linkedinUrl;
    private String timeZone;

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }
}