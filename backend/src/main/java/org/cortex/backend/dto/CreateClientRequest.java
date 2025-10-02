package org.cortex.backend.dto;

import lombok.Data;

@Data
public class CreateClientRequest {
    private String email;
    private String firstName;
    private String lastName;
    private String gender;
    private String designation;
    private String clientOrganisationId;
    private String coachingProgramId;
} 