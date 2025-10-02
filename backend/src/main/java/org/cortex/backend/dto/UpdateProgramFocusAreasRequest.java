package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.cortex.backend.constant.Status;

import java.util.List;
import java.util.UUID;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateProgramFocusAreasRequest {
    private List<UUID> focusAreaIds;
}