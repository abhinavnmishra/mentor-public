package org.cortex.backend.security.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.security.dto.AuthRequest;
import org.cortex.backend.security.dto.AuthResponse;
import org.cortex.backend.security.dto.ForgotPasswordRequest;
import org.cortex.backend.security.dto.ResetPasswordRequest;
import org.cortex.backend.security.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest authRequest) {
        try {
            return new ResponseEntity<>(authService.register(authRequest), HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest authRequest) {
        try {
            return new ResponseEntity<>(authService.login(authRequest), HttpStatus.OK);
        } catch (Exception e){
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> profile() {
        try {
            AuthResponse authResponse = new AuthResponse();

            Claims claims = (Claims) SecurityContextHolder.getContext()
                    .getAuthentication()
                    .getPrincipal();

            authResponse.setUser(authService.getUserByUserName((String) claims.get("username")));

            return new ResponseEntity<>(authResponse, HttpStatus.OK);
        } catch (Exception e){
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.initiatePasswordReset(request.getUsername());
        return ResponseEntity.ok("Password reset instructions sent to your email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Password reset successful");
    }
}