package org.cortex.backend.security.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.cortex.backend.security.constant.Role;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(unique = true)
    private String userName;

    private String firstName;

    private String lastName;

    private String organisationId;

    private String profileImageUrl;

    private String timezone;

    @JsonIgnore
    private String password;

    @Column(name = "reset_token")
    private String resetToken;

    @Column(name = "reset_token_expiry")
    private LocalDateTime resetTokenExpiry;

    public User(String email, String userName, String password, String firstName, String lastName, String role, String organisationId) {
        this.email = email;
        this.userName = userName;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.organisationId = organisationId;
        this.role = Role.valueOf(role);
    }

}