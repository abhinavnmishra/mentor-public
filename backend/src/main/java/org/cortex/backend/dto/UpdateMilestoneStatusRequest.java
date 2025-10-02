package org.cortex.backend.dto;

import lombok.Data;
import org.cortex.backend.constant.Status;

@Data
public class UpdateMilestoneStatusRequest {
    private Status status;
} 