package org.cortex.backend.security.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import org.cortex.backend.security.config.JwtUtil;
import org.cortex.backend.security.dto.AuthRequest;
import org.cortex.backend.security.dto.AuthResponse;
import org.cortex.backend.security.dto.ResetPasswordRequest;
import org.cortex.backend.security.model.User;
import org.cortex.backend.security.repository.UserRepository;
import org.cortex.backend.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    @Value("${frontend-base-url}")
    private String frontendBaseUrl;

    public AuthResponse login(AuthRequest authRequest) {
        logger.debug("Inside login");
        // Find user by username
        User user = userRepository.findByUserName(authRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        logger.debug("Found user with username : " + user.getUserName());

        // Validate password
        if (!passwordEncoder.matches(authRequest.getPassword(), user.getPassword())) {
            logger.debug("Invalid credentials : " + authRequest.getPassword());
            throw new RuntimeException("Invalid credentials");
        }

        // Generate JWT
        String token = jwtUtil.generateToken(user.getUserName(), user.getEmail(), user.getOrganisationId(), user.getId().toString(), user.getRole());
        return new AuthResponse(token, user);
    }

    /**
     * Simple registration - saves user with encoded password
     */
    public AuthResponse register(AuthRequest authRequest) {
        // Check if user already exists
        userRepository.findByUserName(authRequest.getUsername()).ifPresent(u -> {
            throw new RuntimeException("Username already in use");
        });
        // Save new user
        User newUser = new User(
                authRequest.getEmail(),
                authRequest.getUsername(),
                passwordEncoder.encode(authRequest.getPassword()),
                authRequest.getFirstName(),
                authRequest.getLastName(),
                authRequest.getRole(),
                authRequest.getOrganisationId()
        );
        userRepository.save(newUser);

        return login(authRequest);

    }

    /**
     * Retrieve user by username from the repository
     */
    public User getUserByUserName(String username) {
        return userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found with username: " + username));
    }

    public void initiatePasswordReset(String username) {
        User user = userRepository.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        userRepository.save(user);

        // Send reset password email
        String resetLink = frontendBaseUrl + "/session/reset-password/" + token;
        String emailContent = createResetPasswordEmailContent(user.getFirstName(), resetLink);
        
        try {
            emailService.sendEmail(user.getEmail(), "Mentivo AI : Reset Your Password", emailContent, null);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send reset password email", e);
        }
    }

    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token has expired");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    private String createResetPasswordEmailContent(String userName, String resetLink) {
        return """
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2854fd;">Password Reset Request</h2>
                <p>Hello %s,</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s" style="background-color: #2854fd; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                        Reset Password
                    </a>
                </div>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>Your Application Team</p>
            </div>
        """.formatted(userName, resetLink);
    }

}