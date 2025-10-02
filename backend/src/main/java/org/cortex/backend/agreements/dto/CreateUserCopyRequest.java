package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserCopyRequest {

    @NotNull(message = "Agreement version ID is required")
    private String agreementVersionId;

    @NotNull(message = "User ID is required")
    private String userId;

    @NotBlank(message = "User name is required")
    private String userName;

    @NotBlank(message = "User email is required")
    @Email(message = "Valid email address is required")
    private String userEmail;

    private String userOrganisation; // Optional
}
