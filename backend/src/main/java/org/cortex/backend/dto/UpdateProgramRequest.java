package org.cortex.backend.dto;

import lombok.Data;
import org.cortex.backend.constant.Status;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateProgramRequest {
    private String description;
    private Status status;
}