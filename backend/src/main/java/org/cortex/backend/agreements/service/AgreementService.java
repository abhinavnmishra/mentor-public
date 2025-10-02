package org.cortex.backend.agreements.service;

import org.cortex.backend.agreements.constant.AgreementStatus;
import org.cortex.backend.agreements.dto.*;
import org.cortex.backend.agreements.model.Agreement;
import org.cortex.backend.agreements.model.AgreementAcceptance;
import org.cortex.backend.agreements.model.AgreementVersion;
import org.cortex.backend.agreements.model.AgreementVersionUserCopy;
import org.cortex.backend.agreements.repository.AgreementAcceptanceRepository;
import org.cortex.backend.agreements.repository.AgreementRepository;
import org.cortex.backend.agreements.repository.AgreementVersionRepository;
import org.cortex.backend.agreements.repository.AgreementVersionUserCopyRepository;
import org.cortex.backend.exception.BadRequestException;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exception.ValidationException;
import org.cortex.backend.model.PublicAsset;
import org.cortex.backend.repository.PublicAssetRepository;
import org.cortex.backend.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AgreementService {

    private static final Logger logger = LoggerFactory.getLogger(AgreementService.class);

    @Autowired
    private AgreementRepository agreementRepository;

    @Autowired
    private AgreementVersionRepository agreementVersionRepository;

    @Autowired
    private AgreementAcceptanceRepository agreementAcceptanceRepository;

    @Autowired
    private HttpServletRequest request;

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Autowired
    private PublicAssetRepository publicAssetRepository;

    @Autowired
    private AgreementVersionUserCopyRepository agreementVersionUserCopyRepository;

    /**
     * Fetch all agreements with their versions
     */
    @Transactional(readOnly = true)
    public List<AgreementResponse> getAllAgreements(String organisationId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching all agreements for org: {}", organisationId);
        
        List<Agreement> agreements = agreementRepository.findByOrganisationIdOrderByCreatedAtDesc(UUID.fromString(organisationId));

        List<AgreementResponse> responses = agreements.stream()
                .map(AgreementResponse::fromEntity)
                .collect(Collectors.toList());
                
        logger.info("Retrieved {} agreements", responses.size());
        MDC.clear();
        return responses;
    }

    /**
     * Get agreement by ID with all versions
     */
    @Transactional(readOnly = true)
    public AgreementResponse getAgreementById(String agreementId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching agreement with ID: {}", agreementId);
        
        Agreement agreement = agreementRepository.findById(UUID.fromString(agreementId))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", agreementId));
                
        AgreementResponse response = AgreementResponse.fromEntity(agreement);
        logger.info("Successfully retrieved agreement: {}", agreement.getTitle());
        MDC.clear();
        return response;
    }

    /**
     * Create a new agreement
     */
    public AgreementResponse createAgreement(CreateAgreementRequest request, String userId, String organisationId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Creating new agreement with title: {} for org: {}", request.getTitle(), organisationId);
        
        // Check for duplicate titles for the same user
        if (agreementRepository.existsByTitleAndOrganisationId(request.getTitle(), UUID.fromString(organisationId))) {
            throw new ValidationException("Agreement with title '" + request.getTitle() + "' already exists");
        }
        
        Agreement agreement = Agreement.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .createdBy(UUID.fromString(userId))
                .organisationId(UUID.fromString(organisationId))
                .build();
                
        agreement = agreementRepository.save(agreement);
        AgreementResponse response = AgreementResponse.fromEntity(agreement);
        logger.info("Successfully created agreement with ID: {}", agreement.getId());
        MDC.clear();
        return response;
    }

    /**
     * Fetch a version of an existing agreement by Id
     */
    @Transactional(readOnly = true)
    public AgreementVersionResponse getVersionById(String versionId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);

        logger.info("Fetching agreement version with ID: {}", versionId);

        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(versionId))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", versionId));

        AgreementVersionResponse response = AgreementVersionResponse.fromEntity(version);
        logger.info("Successfully retrieved agreement version: {} for agreement: {}",
                version.getVersionNumber(), version.getAgreement().getTitle());
        MDC.clear();
        return response;
    }

    /**
     * Create a new version of an existing agreement
     */
    public AgreementVersionResponse createNewVersion(CreateVersionRequest request, String userId, String organisationId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Creating new version for agreement: {}", request.getAgreementId());
        
        Agreement agreement = agreementRepository.findById(UUID.fromString(request.getAgreementId()))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement", "id", request.getAgreementId()));

        // Verify user has permission
        if (!agreement.getOrganisationId().equals(UUID.fromString(organisationId))) {
            throw new BadRequestException("You do not have permission to publish this agreement version");
        }

        Integer nextVersionNumber = agreementVersionRepository.getNextVersionNumber(agreement.getId());
        
        AgreementVersion newVersion = AgreementVersion.builder()
                .agreement(agreement)
                .versionNumber(nextVersionNumber)
                .status(AgreementStatus.DRAFT)
                .pages(request.getPages())
                .pdfFilePath(request.getPdfFilePath())
                .publishedBy(UUID.fromString(userId))
                .build();
                
        newVersion = agreementVersionRepository.save(newVersion);
        
        AgreementVersionResponse response = AgreementVersionResponse.fromEntity(newVersion);
        logger.info("Successfully created version {} for agreement: {}", nextVersionNumber, agreement.getId());
        MDC.clear();
        return response;
    }

    /**
     * Update a draft agreement version
     */
    public AgreementVersionResponse updateVersion(UpdateVersionRequest request, String organisationId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Updating agreement version: {}", request.getVersionId());
        
        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(request.getVersionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", request.getVersionId()));

        // Verify user has permission
        if (!version.getAgreement().getOrganisationId().equals(UUID.fromString(organisationId))) {
            throw new BadRequestException("You do not have permission to publish this agreement version");
        }

        if (!version.isEditable()) {
            throw new ValidationException("Agreement version is not in draft state and cannot be edited");
        }
        
        version.setPages(request.getPages());
        version.setPdfFilePath(request.getPdfFilePath());
        
        version = agreementVersionRepository.save(version);
        
        AgreementVersionResponse response = AgreementVersionResponse.fromEntity(version);
        logger.info("Successfully updated agreement version: {}", version.getId());
        MDC.clear();
        return response;
    }

    /**
     * Publish an agreement version with PDF generation
     */
    public AgreementVersionResponse publishVersion(PublishVersionRequest request, String userId, String organisationId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Publishing agreement version: {}", request.getVersionId());
        
        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(request.getVersionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", request.getVersionId()));

        // Verify user has permission
        if (!version.getAgreement().getOrganisationId().equals(UUID.fromString(organisationId))) {
            throw new BadRequestException("You do not have permission to publish this agreement version");
        }
        
        // Validate version has content
        if ((version.getPages() == null || version.getPages().isEmpty()) && 
            (version.getPdfFilePath() == null || version.getPdfFilePath().trim().isEmpty())) {
            throw new ValidationException("Agreement version must have content before publishing");
        }
        
//        // Validate effective date doesn't invalidate previous acceptances
//        if (request.getEffectiveAt() != null && request.getEffectiveAt().isBefore(LocalDateTime.now())) {
//            List<AgreementVersion> previousVersions = agreementVersionRepository
//                    .findVersionsPublishedBefore(request.getEffectiveAt());
//            if (!previousVersions.isEmpty()) {
//                throw new ValidationException("Effective date cannot be in the past as it would invalidate previous acceptances");
//            }
//        }
        
        try {
            // Generate PDF from content and store it
            logger.info("Generating PDF for agreement version: {}", version.getId());
            UUID pdfAssetId = pdfGenerationService.generateAndStorePdf(version);
            
            // Calculate hash from PDF binary
            String documentHash = pdfGenerationService.calculatePdfHash(pdfAssetId);
            
            // Publish the version with PDF reference and hash
            version.publish(UUID.fromString(userId), request.getEffectiveAt(), pdfAssetId, documentHash);
            version = agreementVersionRepository.save(version);
            
            AgreementVersionResponse response = AgreementVersionResponse.fromEntity(version);
            logger.info("Successfully published agreement version: {} with PDF asset: {} and hash: {}", 
                    version.getId(), pdfAssetId, documentHash);
            MDC.clear();
            return response;
            
        } catch (Exception e) {
            logger.error("Failed to publish agreement version: {}", request.getVersionId(), e);
            MDC.clear();
            throw new RuntimeException("Failed to publish agreement version due to PDF generation error", e);
        }
    }

    /**
     * Retire an agreement version
     */
    public AgreementVersionResponse retireVersion(String versionId, String organisationId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Retiring agreement version: {}", versionId);
        
        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(versionId))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", versionId));

        // Verify user has permission
        if (!version.getAgreement().getOrganisationId().equals(UUID.fromString(organisationId))) {
            throw new BadRequestException("You do not have permission to retire this agreement version");
        }
        
        version.retire();
        version = agreementVersionRepository.save(version);
        
        AgreementVersionResponse response = AgreementVersionResponse.fromEntity(version);
        logger.info("Successfully retired agreement version: {}", version.getId());
        MDC.clear();
        return response;
    }

    /**
     * Accept an agreement by a user
     */
    public AgreementAcceptanceResponse acceptAgreement(AcceptAgreementRequest request) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Processing agreement acceptance for version: {} by user: {}", 
                request.getAgreementVersionUserCopyId(), request.getUserId());

        AgreementVersionUserCopy versionUserCopy = agreementVersionUserCopyRepository.findById(UUID.fromString(request.getAgreementVersionUserCopyId()))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", request.getAgreementVersionUserCopyId()));

        AgreementVersion version = versionUserCopy.getAgreementVersion();
                
        // Verify version can be accepted
        if (!version.isAcceptable()) {
            throw new ValidationException("Agreement version is not available for acceptance");
        }
        
        UUID userId = UUID.fromString(request.getUserId());
        
        // Check if user has already accepted this specific version
        if (agreementAcceptanceRepository.existsByUserIdAndAgreementVersionUserCopy_Id(userId, versionUserCopy.getId())) {
            throw new ValidationException("User has already accepted this agreement version");
        }
        
        // Extract request metadata
        String ipAddress = getClientIpAddress();
        String userAgent = getUserAgent();

        if (ipAddress == null || ipAddress.isEmpty()) {
            throw new ValidationException("Cannot determine client IP address for acceptance record");
        }
        
        AgreementAcceptance acceptance = AgreementAcceptance.createAcceptance(
                userId, versionUserCopy, ipAddress, userAgent, correlationId);
                
        acceptance = agreementAcceptanceRepository.save(acceptance);

        AgreementAcceptanceResponse response = AgreementAcceptanceResponse.fromEntity(acceptance);
        logger.info("Successfully recorded agreement acceptance with ID: {} for correlation: {}", 
                acceptance.getId(), correlationId);
        MDC.clear();
        return response;
    }

    /**
     * Has accepted version copy
     */
    @Transactional(readOnly = true)
    public boolean hasUserAcceptedVersion(String userCopyId) {
        return agreementAcceptanceRepository.existsByAgreementVersionUserCopy_Id(UUID.fromString(userCopyId));
    }

    /**
     * Get acceptance history for a user
     */
    @Transactional(readOnly = true)
    public List<AgreementAcceptanceResponse> getUserAcceptanceHistory(UUID userId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching acceptance history for user: {}", userId);
        
        List<AgreementAcceptance> acceptances = agreementAcceptanceRepository
                .findByUserIdOrderByAcceptedAtDesc(userId);
                
        List<AgreementAcceptanceResponse> responses = acceptances.stream()
                .map(AgreementAcceptanceResponse::fromEntity)
                .collect(Collectors.toList());
                
        logger.info("Retrieved {} acceptances for user: {}", responses.size(), userId);
        MDC.clear();
        return responses;
    }

    /**
     * Get acceptance history for an agreement
     */
    @Transactional(readOnly = true)
    public List<AgreementAcceptanceResponse> getAgreementAcceptanceHistory(String agreementId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching acceptance history for agreement: {}", agreementId);
        
        List<AgreementAcceptance> acceptances = agreementAcceptanceRepository
                .findLatestAcceptancesByAgreementId(UUID.fromString(agreementId));
                
        List<AgreementAcceptanceResponse> responses = acceptances.stream()
                .map(AgreementAcceptanceResponse::fromEntity)
                .collect(Collectors.toList());
                
        logger.info("Retrieved {} acceptances for agreement: {}", responses.size(), agreementId);
        MDC.clear();
        return responses;
    }

    /**
     * Verify acceptance and download audit information
     */
    @Transactional(readOnly = true)
    public AgreementAcceptanceResponse verifyAcceptance(String acceptanceId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Verifying acceptance with ID: {}", acceptanceId);
        
        AgreementAcceptance acceptance = agreementAcceptanceRepository.findById(UUID.fromString(acceptanceId))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Acceptance", "id", acceptanceId));
                
        AgreementAcceptanceResponse response = AgreementAcceptanceResponse.fromEntity(acceptance);
        
        // Log verification for audit
        logger.info("Acceptance verification completed for ID: {}, Document hash valid: {}", 
                acceptanceId, response.isDocumentHashValid());
        MDC.clear();
        return response;
    }

    /**
     * Get acceptance statistics for an agreement
     */
    @Transactional(readOnly = true)
    public Long getAcceptanceCount(String agreementId) {
        return agreementAcceptanceRepository.countAcceptancesByAgreementId(UUID.fromString(agreementId));
    }

    /**
     * Get the generated PDF for a published agreement version
     */
    @Transactional(readOnly = true)
    public PublicAsset getAgreementPdf(String versionId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Retrieving PDF for agreement version: {}", versionId);
        
        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(versionId))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", versionId));
        
        if (version.getGeneratedPdfAssetId() == null) {
            throw new ResourceNotFoundException("No PDF generated for this agreement version");
        }
        
        PublicAsset pdfAsset = publicAssetRepository.findById(version.getGeneratedPdfAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("PDF asset not found"));
        
        logger.info("Successfully retrieved PDF asset: {} for version: {}", 
                pdfAsset.getId(), versionId);
        MDC.clear();
        return pdfAsset;
    }

    /**
     * Regenerate PDF for a published agreement version (admin only)
     */
    public AgreementVersionResponse regeneratePdf(String versionId, UUID requestedBy) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Regenerating PDF for agreement version: {} by user: {}", versionId, requestedBy);
        
        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(versionId))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", versionId));
        
        if (version.getStatus() != AgreementStatus.PUBLISHED) {
            throw new ValidationException("Can only regenerate PDF for published versions");
        }
        
        try {
            // Generate new PDF
            UUID newPdfAssetId = pdfGenerationService.generateAndStorePdf(version);
            
            // Calculate new hash
            String newDocumentHash = pdfGenerationService.calculatePdfHash(newPdfAssetId);
            
            // Update version with new PDF and hash
            version.setGeneratedPdfAsset(newPdfAssetId);
            version.setDocumentHash(newDocumentHash);
            version = agreementVersionRepository.save(version);
            
            AgreementVersionResponse response = AgreementVersionResponse.fromEntity(version);
            logger.info("Successfully regenerated PDF for agreement version: {} with new asset: {} and hash: {}", 
                    versionId, newPdfAssetId, newDocumentHash);
            MDC.clear();
            return response;
            
        } catch (Exception e) {
            logger.error("Failed to regenerate PDF for agreement version: {}", versionId, e);
            MDC.clear();
            throw new RuntimeException("Failed to regenerate PDF", e);
        }
    }

    // Helper methods
    
    private String generateCorrelationId() {
        return UUID.randomUUID().toString();
    }
    
    private String getClientIpAddress() {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private String getUserAgent() {
        return request.getHeader("User-Agent");
    }

    /**
     * Create user-specific copy of an agreement version with PDF generation and hash calculation
     */
    public AgreementVersionUserCopyResponse createUserCopy(CreateUserCopyRequest request) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Creating user copy for agreement version: {} and user: {}", 
                request.getAgreementVersionId(), request.getUserId());
        
        AgreementVersion version = agreementVersionRepository.findById(UUID.fromString(request.getAgreementVersionId()))
                .orElseThrow(() -> new ResourceNotFoundException("Agreement Version", "id", request.getAgreementVersionId()));
        
        // Verify version is published and acceptable
        if (!version.isAcceptable()) {
            throw new ValidationException("Agreement version is not available for user copy generation");
        }
        
        UUID userId = UUID.fromString(request.getUserId());
        
        // Check if user copy already exists
        if (agreementVersionUserCopyRepository.existsByAgreementVersionIdAndUserId(version.getId(), userId)) {
            throw new ValidationException("User copy already exists for this agreement version and user");
        }
        
        try {
            // Create user copy entity
            AgreementVersionUserCopy userCopy = AgreementVersionUserCopy.createUserCopy(
                    version, userId, request.getUserName(), request.getUserEmail(), request.getUserOrganisation());
            
            // Set user copy ID
            userCopy.setId(UUID.randomUUID());
            
            // Generate user-specific PDF with placeholders replaced
            UUID pdfAssetId = pdfGenerationService.generateAndStoreUserSpecificPdf(userCopy);
            
            // Calculate hash from PDF binary
            String documentHash = pdfGenerationService.calculatePdfHash(pdfAssetId);
            
            // Update user copy with PDF reference and hash
            userCopy.setGeneratedPdfAsset(pdfAssetId);
            userCopy.setDocumentHashWithTimestamp(documentHash);
            userCopy = agreementVersionUserCopyRepository.save(userCopy);
            
            AgreementVersionUserCopyResponse response = AgreementVersionUserCopyResponse.fromEntity(userCopy);
            logger.info("Successfully created user copy with ID: {} and hash: {}", 
                    userCopy.getId(), documentHash);
            MDC.clear();
            return response;
            
        } catch (Exception e) {
            logger.error("Failed to create user copy for agreement version: {} and user: {}", 
                    request.getAgreementVersionId(), request.getUserId(), e);
            MDC.clear();
            throw new RuntimeException("Failed to create user copy", e);
        }
    }

    /**
     * Get user copy by agreement version and user
     */
    @Transactional(readOnly = true)
    public AgreementVersionUserCopyResponse getUserCopy(String userCopyId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching user copy for agreement user copy: {}", userCopyId);
        
        AgreementVersionUserCopy userCopy = agreementVersionUserCopyRepository
                .findById(UUID.fromString(userCopyId))
                .orElseThrow(() -> new ResourceNotFoundException("User copy not found for this agreement userCopyId"));
        
        AgreementVersionUserCopyResponse response = AgreementVersionUserCopyResponse.fromEntity(userCopy);
        logger.info("Successfully retrieved user copy: {}", userCopy.getId());
        MDC.clear();
        return response;
    }

    /**
     * Get all user copies for a specific user
     */
    @Transactional(readOnly = true)
    public List<AgreementVersionUserCopyResponse> getUserCopiesByUser(UUID userId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching all user copies for user: {}", userId);
        
        List<AgreementVersionUserCopy> userCopies = agreementVersionUserCopyRepository
                .findByUserIdOrderByCreatedAtDesc(userId);
        
        List<AgreementVersionUserCopyResponse> responses = userCopies.stream()
                .map(AgreementVersionUserCopyResponse::fromEntity)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} user copies for user: {}", responses.size(), userId);
        MDC.clear();
        return responses;
    }

    /**
     * Get all user copies for a specific agreement version
     */
    @Transactional(readOnly = true)
    public List<AgreementVersionUserCopyResponse> getUserCopiesByVersion(String agreementVersionId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Fetching all user copies for agreement version: {}", agreementVersionId);
        
        List<AgreementVersionUserCopy> userCopies = agreementVersionUserCopyRepository
                .findByAgreementVersionIdOrderByCreatedAtDesc(UUID.fromString(agreementVersionId));
        
        List<AgreementVersionUserCopyResponse> responses = userCopies.stream()
                .map(AgreementVersionUserCopyResponse::fromEntity)
                .collect(Collectors.toList());
        
        logger.info("Retrieved {} user copies for agreement version: {}", responses.size(), agreementVersionId);
        MDC.clear();
        return responses;
    }

    /**
     * Get the generated PDF for a user copy
     */
    @Transactional(readOnly = true)
    public PublicAsset getUserCopyPdf(String userCopyId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Retrieving PDF for user copy: {}", userCopyId);
        
        AgreementVersionUserCopy userCopy = agreementVersionUserCopyRepository.findById(UUID.fromString(userCopyId))
                .orElseThrow(() -> new ResourceNotFoundException("User Copy", "id", userCopyId));
        
        if (userCopy.getGeneratedPdfAssetId() == null) {
            throw new ResourceNotFoundException("No PDF generated for this user copy");
        }
        
        PublicAsset pdfAsset = publicAssetRepository.findById(userCopy.getGeneratedPdfAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("PDF asset not found"));
        
        logger.info("Successfully retrieved PDF asset: {} for user copy: {}", 
                pdfAsset.getId(), userCopyId);
        MDC.clear();
        return pdfAsset;
    }

    /**
     * Verify user copy document hash integrity
     */
    @Transactional(readOnly = true)
    public boolean verifyUserCopyHash(String userCopyId) {
        String correlationId = generateCorrelationId();
        MDC.put("correlationId", correlationId);
        
        logger.info("Verifying hash for user copy: {}", userCopyId);
        
        AgreementVersionUserCopy userCopy = agreementVersionUserCopyRepository.findById(UUID.fromString(userCopyId))
                .orElseThrow(() -> new ResourceNotFoundException("User Copy", "id", userCopyId));
        
        if (userCopy.getGeneratedPdfAssetId() == null || userCopy.getDocSha256() == null) {
            logger.warn("User copy {} does not have PDF or hash", userCopyId);
            MDC.clear();
            return false;
        }
        
        try {
            String currentHash = pdfGenerationService.calculatePdfHash(userCopy.getGeneratedPdfAssetId());
            boolean isValid = currentHash.equals(userCopy.getDocSha256());
            
            logger.info("Hash verification for user copy {}: {}", userCopyId, isValid ? "VALID" : "INVALID");
            MDC.clear();
            return isValid;
            
        } catch (Exception e) {
            logger.error("Failed to verify hash for user copy: {}", userCopyId, e);
            MDC.clear();
            return false;
        }
    }
}
