package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PublishVersionRequest {

    @NotNull(message = "Version ID is required")
    private String versionId;

    private LocalDateTime effectiveAt; // When this version becomes effective (optional, defaults to now)
}
