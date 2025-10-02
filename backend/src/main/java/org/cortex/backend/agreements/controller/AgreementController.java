package org.cortex.backend.agreements.controller;

import io.jsonwebtoken.Claims;
import lombok.Getter;
import org.cortex.backend.agreements.dto.*;
import org.cortex.backend.agreements.service.AgreementService;
import org.cortex.backend.model.PublicAsset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/agreements")
@Validated
public class AgreementController {

    private static final Logger logger = LoggerFactory.getLogger(AgreementController.class);

    @Autowired
    private AgreementService agreementService;

    /**
     * Get all agreements for the authenticated user (coaches/admins)
     */
    @GetMapping
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<AgreementResponse>> getAllAgreements(
            @AuthenticationPrincipal Claims claims) {
        
        String organisationId = (String) claims.get("organisationId");
        List<AgreementResponse> agreements = agreementService.getAllAgreements(organisationId);
        return ResponseEntity.ok(agreements);
    }

    /**
     * Get a specific agreement by ID with all versions
     */
    @GetMapping("/{agreementId}")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementResponse> getAgreementById(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String agreementId) {
        
        AgreementResponse agreement = agreementService.getAgreementById(agreementId);
        return ResponseEntity.ok(agreement);
    }

    /**
     * Create a new agreement
     */
    @PostMapping
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementResponse> createAgreement(
            @AuthenticationPrincipal Claims claims,
            @Valid @RequestBody CreateAgreementRequest request) {

        String userId = (String) claims.get("userId");
        String organisationId = (String) claims.get("organisationId");
        AgreementResponse agreement = agreementService.createAgreement(request, userId, organisationId);
        
        logger.info("Agreement created successfully with ID: {} by user: {}", 
                agreement.getId(), userId);
        
        return new ResponseEntity<>(agreement, HttpStatus.OK);
    }

    /**
     * Create a new version of an existing agreement
     */
    @PostMapping("/{agreementId}/versions")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementVersionResponse> createNewVersion(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String agreementId,
            @Valid @RequestBody CreateVersionRequest request) {
        
        request.setAgreementId(agreementId); // Ensure consistency
        String userId = (String) claims.get("userId");
        String organisationId = (String) claims.get("organisationId");
        
        AgreementVersionResponse version = agreementService.createNewVersion(request, userId, organisationId);
        
        logger.info("New version created for agreement: {} by user: {}", 
                agreementId, userId);
        
        return new ResponseEntity<>(version, HttpStatus.OK);
    }
    /**
     * Fetch a version by ID
     */
    @GetMapping("/versions/{versionId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<AgreementVersionResponse> getVersionById(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId) {

        AgreementVersionResponse version = agreementService.getVersionById(versionId);
        return ResponseEntity.ok(version);
    }

    /**
     * Update a draft agreement version
     */
    @PutMapping("/versions/{versionId}")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementVersionResponse> updateVersion(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId,
            @Valid @RequestBody UpdateVersionRequest request) {
        
        request.setVersionId(versionId); // Ensure consistency
        String userId = (String) claims.get("userId");
        String organisationId = (String) claims.get("organisationId");

        AgreementVersionResponse version = agreementService.updateVersion(request, organisationId);
        
        logger.info("Agreement version updated: {} by user: {}", versionId, userId);
        
        return ResponseEntity.ok(version);
    }

    /**
     * Publish an agreement version (make it available for acceptance)
     */
    @PostMapping("/versions/{versionId}/publish")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementVersionResponse> publishVersion(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId,
            @Valid @RequestBody PublishVersionRequest request) {
        
        request.setVersionId(versionId); // Ensure consistency
        String userId = (String) claims.get("userId");
        String organisationId = (String) claims.get("organisationId");

        AgreementVersionResponse version = agreementService.publishVersion(request, userId, organisationId);
        
        logger.info("Agreement version published: {} by user: {}", versionId, userId);
        
        return ResponseEntity.ok(version);
    }

    /**
     * Retire an agreement version (prevent future acceptances)
     */
    @PostMapping("/versions/{versionId}/retire")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementVersionResponse> retireVersion(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId) {

        String userId = (String) claims.get("userId");
        String organisationId = (String) claims.get("organisationId");
        
        AgreementVersionResponse version = agreementService.retireVersion(versionId, organisationId);
        
        logger.info("Agreement version retired: {} by user: {}", versionId, userId);
        
        return ResponseEntity.ok(version);
    }

    /**
     * Accept an agreement by a user (create acceptance record)
     */
    @PostMapping("/accept")
    @Secured({"ROLE_CLIENT", "ROLE_USER"})
    public ResponseEntity<AgreementAcceptanceResponse> acceptAgreement(
            @AuthenticationPrincipal Claims claims,
            @Valid @RequestBody AcceptAgreementRequest request) {

        String userId = (String) claims.get("userId");
        request.setUserId(userId); // Ensure user can only accept for themselves
        
        AgreementAcceptanceResponse acceptance = agreementService.acceptAgreement(request);
        
        logger.info("Agreement accepted - Version: {}, User: {}, Acceptance ID: {}", 
                request.getAgreementVersionUserCopyId(), request.getUserId(), acceptance.getId());
        
        return new ResponseEntity<>(acceptance, HttpStatus.OK);
    }

    /**
     * Get acceptance status for a specific agreement version user copy
     */
    @GetMapping("/acceptances/{userCopyId}")
    @Secured({"ROLE_ADMIN", "ROLE_CLIENT", "ROLE_USER"})
    public ResponseEntity<Boolean> hasAccepted(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userCopyId) {

        return ResponseEntity.ok(agreementService.hasUserAcceptedVersion(userCopyId));
    }

    /**
     * Get acceptance history for a specific user
     */
    @GetMapping("/acceptances/user/{userId}")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<AgreementAcceptanceResponse>> getUserAcceptanceHistory(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userId) {
        
        List<AgreementAcceptanceResponse> acceptances = 
                agreementService.getUserAcceptanceHistory(UUID.fromString(userId));
        
        return ResponseEntity.ok(acceptances);
    }

    /**
     * Get acceptance history for the authenticated user
     */
    @GetMapping("/acceptances/my-history")
    @Secured({"ROLE_CLIENT", "ROLE_USER"})
    public ResponseEntity<List<AgreementAcceptanceResponse>> getMyAcceptanceHistory(
            @AuthenticationPrincipal Claims claims) {

        String userId = (String) claims.get("userId");

        List<AgreementAcceptanceResponse> acceptances = 
                agreementService.getUserAcceptanceHistory(UUID.fromString(userId));
        
        return ResponseEntity.ok(acceptances);
    }

    /**
     * Get acceptance history for a specific agreement
     */
    @GetMapping("/{agreementId}/acceptances")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<AgreementAcceptanceResponse>> getAgreementAcceptanceHistory(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String agreementId) {
        
        List<AgreementAcceptanceResponse> acceptances = 
                agreementService.getAgreementAcceptanceHistory(agreementId);
        
        return ResponseEntity.ok(acceptances);
    }

    /**
     * Verify a specific acceptance (for audit purposes)
     */
    @GetMapping("/acceptances/{acceptanceId}/verify")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementAcceptanceResponse> verifyAcceptance(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String acceptanceId) {

        String userId = (String) claims.get("userId");

        AgreementAcceptanceResponse acceptance = agreementService.verifyAcceptance(acceptanceId);
        
        logger.info("Acceptance verification requested for ID: {} by user: {}", 
                acceptanceId, userId);
        
        return ResponseEntity.ok(acceptance);
    }

    /**
     * Get acceptance count/statistics for an agreement
     */
    @GetMapping("/{agreementId}/statistics")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    public ResponseEntity<AcceptanceStatistics> getAcceptanceStatistics(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String agreementId) {
        
        Long acceptanceCount = agreementService.getAcceptanceCount(agreementId);
        
        AcceptanceStatistics stats = new AcceptanceStatistics();
        stats.setAgreementId(agreementId);
        stats.setTotalAcceptances(acceptanceCount);
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Download the PDF for a published agreement version
     */
    @GetMapping("/versions/{versionId}/pdf")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<byte[]> downloadAgreementPdf(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId) {

        String userId = (String) claims.get("userId");

        PublicAsset pdfAsset = agreementService.getAgreementPdf(versionId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(pdfAsset.getContentType());
        headers.setContentDispositionFormData("attachment", pdfAsset.getFileName());
        headers.setContentLength(pdfAsset.getData().length);
        
        logger.info("PDF downloaded for agreement version: {} by user: {}", 
                versionId, userId);
        
        return new ResponseEntity<>(pdfAsset.getData(), headers, HttpStatus.OK);
    }

    /**
     * View the PDF inline for a published agreement version
     */
    @GetMapping("/versions/{versionId}/pdf/view")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<byte[]> viewAgreementPdf(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId) {

        String userId = (String) claims.get("userId");

        PublicAsset pdfAsset = agreementService.getAgreementPdf(versionId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(pdfAsset.getContentType());
        headers.setContentDispositionFormData("inline", pdfAsset.getFileName());
        headers.setContentLength(pdfAsset.getData().length);
        
        logger.info("PDF viewed inline for agreement version: {} by user: {}", 
                versionId, userId);
        
        return new ResponseEntity<>(pdfAsset.getData(), headers, HttpStatus.OK);
    }

    /**
     * Regenerate PDF for a published agreement version (admin only)
     */
    @PostMapping("/versions/{versionId}/regenerate-pdf")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementVersionResponse> regenerateAgreementPdf(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId) {

        String userId = (String) claims.get("userId");

        AgreementVersionResponse response = agreementService.regeneratePdf(versionId, UUID.fromString(userId));
        
        logger.info("PDF regenerated for agreement version: {} by admin: {}", 
                versionId, userId);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Create user-specific copy of an agreement version
     */
    @PostMapping("/user-copies")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<AgreementVersionUserCopyResponse> createUserCopy(
            @AuthenticationPrincipal Claims claims,
            @Valid @RequestBody CreateUserCopyRequest request) {
        
        AgreementVersionUserCopyResponse userCopy = agreementService.createUserCopy(request);
        
        logger.info("User copy created - Version: {}, User: {}, Copy ID: {}", 
                request.getAgreementVersionId(), request.getUserId(), userCopy.getId());
        
        return new ResponseEntity<>(userCopy, HttpStatus.OK);
    }

    /**
     * Get user copy for specific agreement version and user
     */
    @GetMapping("/user-copies/{userCopyId}")
    @Secured({"ROLE_ADMIN", "ROLE_CLIENT", "ROLE_USER"})
    public ResponseEntity<AgreementVersionUserCopyResponse> getUserCopy(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userCopyId) {

        AgreementVersionUserCopyResponse userCopy = agreementService.getUserCopy(userCopyId);
        return ResponseEntity.ok(userCopy);
    }

    /**
     * Get all user copies for a specific user
     */
    @GetMapping("/user-copies/user/{userId}")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<AgreementVersionUserCopyResponse>> getUserCopiesByUser(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userId) {
        
        List<AgreementVersionUserCopyResponse> userCopies = 
                agreementService.getUserCopiesByUser(UUID.fromString(userId));
        
        return ResponseEntity.ok(userCopies);
    }

    /**
     * Get user copies for the authenticated user
     */
    @GetMapping("/user-copies/my-copies")
    @Secured({"ROLE_ADMIN", "ROLE_CLIENT", "ROLE_USER"})
    public ResponseEntity<List<AgreementVersionUserCopyResponse>> getMyUserCopies(
            @AuthenticationPrincipal Claims claims) {

        String userId = (String) claims.get("userId");
        List<AgreementVersionUserCopyResponse> userCopies = 
                agreementService.getUserCopiesByUser(UUID.fromString(userId));
        
        return ResponseEntity.ok(userCopies);
    }

    /**
     * Get all user copies for a specific agreement version
     */
    @GetMapping("/versions/{versionId}/user-copies")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<AgreementVersionUserCopyResponse>> getUserCopiesByVersion(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String versionId) {
        
        List<AgreementVersionUserCopyResponse> userCopies = 
                agreementService.getUserCopiesByVersion(versionId);
        
        return ResponseEntity.ok(userCopies);
    }

    /**
     * Download the PDF for a user copy
     */
    @GetMapping("/user-copies/{userCopyId}/pdf")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<byte[]> downloadUserCopyPdf(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userCopyId) {

        String userId = (String) claims.get("userId");

        PublicAsset pdfAsset = agreementService.getUserCopyPdf(userCopyId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(pdfAsset.getContentType());
        headers.setContentDispositionFormData("attachment", pdfAsset.getFileName());
        headers.setContentLength(pdfAsset.getData().length);
        
        logger.info("User copy PDF downloaded: {} by user: {}", 
                userCopyId, userId);
        
        return new ResponseEntity<>(pdfAsset.getData(), headers, HttpStatus.OK);
    }

    /**
     * View the PDF inline for a user copy
     */
    @GetMapping("/user-copies/{userCopyId}/pdf/view")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<byte[]> viewUserCopyPdf(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userCopyId) {

        String userId = (String) claims.get("userId");

        PublicAsset pdfAsset = agreementService.getUserCopyPdf(userCopyId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(pdfAsset.getContentType());
        headers.setContentDispositionFormData("inline", pdfAsset.getFileName());
        headers.setContentLength(pdfAsset.getData().length);
        
        logger.info("User copy PDF viewed inline: {} by user: {}", 
                userCopyId, userId);
        
        return new ResponseEntity<>(pdfAsset.getData(), headers, HttpStatus.OK);
    }

    /**
     * Verify user copy document hash integrity
     */
    @GetMapping("/user-copies/{userCopyId}/verify")
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<Map<String, Object>> verifyUserCopyHash(
            @AuthenticationPrincipal Claims claims,
            @PathVariable String userCopyId) {

        String userId = (String) claims.get("userId");

        boolean isValid = agreementService.verifyUserCopyHash(userCopyId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userCopyId", userCopyId);
        response.put("hashValid", isValid);
        response.put("verifiedAt", LocalDateTime.now());
        response.put("verifiedBy", userId);
        
        logger.info("User copy hash verification: {} - Result: {}", userCopyId, isValid);
        
        return ResponseEntity.ok(response);
    }

    // Inner class for statistics response
    @Getter
    public static class AcceptanceStatistics {
        private String agreementId;
        private Long totalAcceptances;

        public void setAgreementId(String agreementId) {
            this.agreementId = agreementId;
        }

        public void setTotalAcceptances(Long totalAcceptances) {
            this.totalAcceptances = totalAcceptances;
        }
    }
}
