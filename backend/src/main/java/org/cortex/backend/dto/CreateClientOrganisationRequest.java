package org.cortex.backend.dto;

import lombok.Data;

@Data
public class CreateClientOrganisationRequest {
    private String name;
    private String domain;
    private String size;
    private String email;
} 