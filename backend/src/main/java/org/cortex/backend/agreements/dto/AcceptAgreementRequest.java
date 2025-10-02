package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AcceptAgreementRequest {

    @NotNull(message = "Agreement version ID is required")
    private String agreementVersionUserCopyId;

    private String userId;

}
