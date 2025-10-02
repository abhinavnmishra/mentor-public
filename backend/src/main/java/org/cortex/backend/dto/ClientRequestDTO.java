package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientRequestDTO {
    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String gender;
    private String designation;
    private String clientOrganisationId;
    private String coachingProgramId;
} 