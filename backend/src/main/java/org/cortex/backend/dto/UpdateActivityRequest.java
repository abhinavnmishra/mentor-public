package org.cortex.backend.dto;

import lombok.Data;
import org.cortex.backend.model.Activity;

import java.util.List;

@Data
public class UpdateActivityRequest {
    private String name;
    private String notes;
    private String description;
    private List<Activity.ActivityFile> files;
} 