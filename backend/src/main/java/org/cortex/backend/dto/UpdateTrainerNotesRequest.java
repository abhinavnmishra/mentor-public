package org.cortex.backend.dto;

import lombok.Data;

@Data
public class UpdateTrainerNotesRequest {
    private String trainerNotes;
    private Boolean isTrainerNotesVisible;
} 