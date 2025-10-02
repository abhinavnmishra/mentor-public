package org.cortex.backend.dto;

import lombok.Data;

@Data
public class CreateMilestoneRequest {
    private String type;
    private String title;
} 