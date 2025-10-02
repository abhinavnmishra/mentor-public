package org.cortex.backend.security.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthRequest {
    private String email;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private String role;
    private String organisationId;
}