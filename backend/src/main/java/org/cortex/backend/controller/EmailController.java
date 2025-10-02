package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import jakarta.mail.MessagingException;
import org.cortex.backend.dto.SendEmailRequest;
import org.cortex.backend.model.TrainerOrganisation;
import org.cortex.backend.repository.TrainerOrganisationRepository;
import org.cortex.backend.service.EmailService;
import org.cortex.backend.service.InlineImageEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private InlineImageEmailService inlineImageEmailService;

    @GetMapping("/template")
    public ResponseEntity<String> getEmailTemplate(@AuthenticationPrincipal Claims claims) throws MessagingException {
        return new ResponseEntity<>(emailService.getEmailTemplate(claims), HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Void> sendEmail(@RequestBody SendEmailRequest request, @AuthenticationPrincipal Claims claims) throws MessagingException {
        emailService.sendEmail(request.getTo(), request.getSubject(), request.getHtmlBody(), claims);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/with-attachments")
    public ResponseEntity<Void> sendEmailWithAttachments(
        @RequestParam String to,
        @RequestParam String subject,
        @RequestParam String htmlBody,
        @RequestParam(required = false) List<MultipartFile> attachments,
        @AuthenticationPrincipal Claims claims
    ) throws MessagingException, IOException {
        inlineImageEmailService.sendEmailWithAttachments(to, subject, htmlBody, attachments, claims);
        return ResponseEntity.ok().build();
    }
} 