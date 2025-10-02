package org.cortex.backend.agreements.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.cortex.backend.agreements.model.AgreementVersion;
import org.cortex.backend.agreements.model.AgreementVersionUserCopy;
import org.cortex.backend.model.PublicAsset;
import org.cortex.backend.repository.PublicAssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class PdfGenerationService {

    private static final Logger logger = LoggerFactory.getLogger(PdfGenerationService.class);
    
    // Placeholder constants
    private static final String SIGNATORY_NAME_PLACEHOLDER = "{{SIGNATORY_NAME}}";
    private static final String SIGNATORY_EMAIL_PLACEHOLDER = "{{SIGNATORY_EMAIL}}";
    private static final String SIGNATORY_ORGANISATION_PLACEHOLDER = "{{SIGNATORY_ORGANISATION}}";
    
    @Autowired
    private PublicAssetRepository publicAssetRepository;
    
    @Autowired
    private HtmlSanitizer htmlSanitizer;

    /**
     * Generates PDF from agreement version content and stores it as PublicAsset
     */
    public UUID generateAndStorePdf(AgreementVersion agreementVersion) {
        logger.info("Generating PDF for agreement version: {}", agreementVersion.getId());
        
        try {
            String htmlContent = buildCompleteHtml(agreementVersion, null);
            String sanitizedHtml = htmlSanitizer.sanitizeHtml(htmlContent);
            
            // Log HTML validation status for debugging
            if (!htmlSanitizer.isWellFormed(sanitizedHtml)) {
                logger.warn("Generated HTML may not be well-formed for agreement version: {}", agreementVersion.getId());
            }
            
            byte[] pdfBytes = convertHtmlToPdf(sanitizedHtml);
            
            // Store PDF as PublicAsset
            PublicAsset pdfAsset = new PublicAsset();
            pdfAsset.setData(pdfBytes);
            pdfAsset.setFileName(generatePdfFileName(agreementVersion, null));
            pdfAsset.setContentType(MediaType.APPLICATION_PDF);
            pdfAsset.setEntityId(agreementVersion.getId().toString());
            
            PublicAsset savedAsset = publicAssetRepository.save(pdfAsset);
            
            logger.info("PDF generated and stored with asset ID: {} for agreement version: {}", 
                    savedAsset.getId(), agreementVersion.getId());
            
            return savedAsset.getId();
            
        } catch (Exception e) {
            logger.error("Failed to generate PDF for agreement version: {}", agreementVersion.getId(), e);
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    /**
     * Generates user-specific PDF with placeholders replaced and stores it as PublicAsset
     */
    public UUID generateAndStoreUserSpecificPdf(AgreementVersionUserCopy userCopy) {
        logger.info("Generating user-specific PDF for agreement version: {} and user: {}", 
                userCopy.getAgreementVersion().getId(), userCopy.getUserId());
        
        try {
            String htmlContent = buildCompleteHtml(userCopy.getAgreementVersion(), userCopy);
            String sanitizedHtml = htmlSanitizer.sanitizeHtml(htmlContent);
            
            // Log HTML validation status for debugging
            if (!htmlSanitizer.isWellFormed(sanitizedHtml)) {
                logger.warn("Generated HTML may not be well-formed for user copy: {}", userCopy.getId());
            }
            
            byte[] pdfBytes = convertHtmlToPdf(sanitizedHtml);
            
            // Store PDF as PublicAsset
            PublicAsset pdfAsset = new PublicAsset();
            pdfAsset.setData(pdfBytes);
            pdfAsset.setFileName(generatePdfFileName(userCopy.getAgreementVersion(), userCopy));
            pdfAsset.setContentType(MediaType.APPLICATION_PDF);
            pdfAsset.setEntityId(userCopy.getId().toString());
            
            PublicAsset savedAsset = publicAssetRepository.save(pdfAsset);
            
            logger.info("User-specific PDF generated and stored with asset ID: {} for user copy: {}", 
                    savedAsset.getId(), userCopy.getId());
            
            return savedAsset.getId();
            
        } catch (Exception e) {
            logger.error("Failed to generate user-specific PDF for user copy: {}", userCopy.getId(), e);
            throw new RuntimeException("Failed to generate user-specific PDF", e);
        }
    }

    /**
     * Calculates SHA256 hash from PDF binary data
     */
    public String calculatePdfHash(UUID pdfAssetId) {
        logger.info("Calculating hash for PDF asset: {}", pdfAssetId);
        
        PublicAsset pdfAsset = publicAssetRepository.findById(pdfAssetId)
                .orElseThrow(() -> new RuntimeException("PDF asset not found: " + pdfAssetId));
        
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(pdfAsset.getData());
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            
            String hashValue = hexString.toString();
            logger.info("PDF hash calculated: {} for asset: {}", hashValue, pdfAssetId);
            
            return hashValue;
            
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    /**
     * Builds complete HTML document with optional user-specific placeholder replacement
     */
    private String buildCompleteHtml(AgreementVersion agreementVersion, AgreementVersionUserCopy userCopy) {
        StringBuilder htmlBuilder = new StringBuilder();
        
        // HTML document structure with CSS for PDF generation
        htmlBuilder.append("<!DOCTYPE html>")
                .append("<html>")
                .append("<head>")
                .append("<meta charset='UTF-8'/>")
                .append("<title>").append(escapeHtml(agreementVersion.getAgreement().getTitle())).append("</title>")
                .append(buildPdfStyles())
                .append("</head>")
                .append("<body>");
        
        // Document header
        htmlBuilder.append("<div class='document-header'>")
                .append("<h1>").append(escapeHtml(agreementVersion.getAgreement().getTitle())).append("</h1>")
                .append("<div class='version-info'>")
                .append("<p><strong>Version:</strong> ").append(agreementVersion.getVersionNumber()).append("</p>")
                .append("<p><strong>Effective Date:</strong> ").append(agreementVersion.getEffectiveAt()).append("</p>")
                .append("<p><strong>Published Date:</strong> ").append(agreementVersion.getPublishedAt()).append("</p>")
                .append("</div>")
                .append("</div>");
        
        // Content with manual pagination (no auto-pagination)
        if (agreementVersion.getPages() != null && !agreementVersion.getPages().isEmpty()) {
            // Convert pages to HTML with user-specific placeholder replacement
            htmlBuilder.append(buildPaginatedContent(agreementVersion, userCopy));
        } else if (agreementVersion.getPdfFilePath() != null) {
            // Handle existing PDF file case
            htmlBuilder.append("<div class='content'>")
                    .append("<p><em>This agreement was uploaded as a PDF document.</em></p>")
                    .append("<p><strong>Original File:</strong> ").append(escapeHtml(agreementVersion.getPdfFilePath())).append("</p>")
                    .append("</div>");
        }
        
        // Document footer
        htmlBuilder.append("<div class='document-footer'>")
                .append("<p class='hash-info'><strong>Document ID:</strong> ").append(agreementVersion.getId()).append("</p>")
                .append("<p class='generated-info'><em>This PDF was automatically generated on ")
                .append(java.time.LocalDateTime.now()).append("</em></p>")
                .append("</div>");
        
        htmlBuilder.append("</body></html>");
        
        return htmlBuilder.toString();
    }

    /**
     * Builds paginated content with manual page breaks only
     */
    private String buildPaginatedContent(AgreementVersion agreementVersion, AgreementVersionUserCopy userCopy) {
        StringBuilder contentBuilder = new StringBuilder();
        
        for (AgreementVersion.AgreementPage page : agreementVersion.getPages()) {
            contentBuilder.append("<div class='page-section'>");
            
            if (page.getTitle() != null && !page.getTitle().trim().isEmpty()) {
                String title = replacePlaceholders(page.getTitle(), userCopy);
                contentBuilder.append("<h2 class='page-title'>").append(escapeHtml(title)).append("</h2>");
            }
            
            if (page.getContent() != null && !page.getContent().trim().isEmpty()) {
                String content = replacePlaceholders(page.getContent(), userCopy);
                // Additional sanitization for page content since it comes from TinyMCE
                String sanitizedContent = htmlSanitizer.sanitizeHtml(content);
                contentBuilder.append("<div class='page-content'>").append(sanitizedContent).append("</div>");
            }
            
            contentBuilder.append("</div>");
            
            // Add page break between agreement pages (except for the last one)
            if (page.getPageNumber() < agreementVersion.getPages().size()) {
                contentBuilder.append("<div style='page-break-before: always;'></div>");
            }
        }
        
        return contentBuilder.toString();
    }

    /**
     * Replaces placeholders in content with user-specific values
     */
    private String replacePlaceholders(String content, AgreementVersionUserCopy userCopy) {
        if (content == null || userCopy == null) {
            return content;
        }
        
        String processedContent = content;
        
        // Replace signatory name placeholder
        processedContent = processedContent.replace(SIGNATORY_NAME_PLACEHOLDER, 
                userCopy.getUserName() != null ? userCopy.getUserName() : "[Name]");
        
        // Replace signatory email placeholder
        processedContent = processedContent.replace(SIGNATORY_EMAIL_PLACEHOLDER, 
                userCopy.getUserEmail() != null ? userCopy.getUserEmail() : "[Email]");
        
        // Replace signatory organisation placeholder
        processedContent = processedContent.replace(SIGNATORY_ORGANISATION_PLACEHOLDER, 
                userCopy.getUserOrganisation() != null ? userCopy.getUserOrganisation() : "[Organisation]");
        
        return processedContent;
    }

    /**
     * Builds CSS styles optimized for PDF generation
     */
    private String buildPdfStyles() {
        return "<style>" +
                "@page { " +
                "  size: A4; " +
                "  margin: 2cm 1.5cm; " +
                "  @top-center { content: 'Agreement - Page ' counter(page); } " +
                "  @bottom-center { content: 'Confidential and Proprietary'; } " +
                "} " +
                "body { " +
                "  font-family: 'Arial', sans-serif; " +
                "  font-size: 11pt; " +
                "  line-height: 1.6; " +
                "  color: #333; " +
                "  margin: 0; " +
                "  padding: 0; " +
                "} " +
                ".document-header { " +
                "  text-align: center; " +
                "  margin-bottom: 30px; " +
                "  padding-bottom: 20px; " +
                "  border-bottom: 2px solid #ccc; " +
                "} " +
                ".document-header h1 { " +
                "  font-size: 24pt; " +
                "  color: #2c3e50; " +
                "  margin-bottom: 15px; " +
                "} " +
                ".version-info { " +
                "  font-size: 10pt; " +
                "  color: #666; " +
                "} " +
                ".version-info p { " +
                "  margin: 5px 0; " +
                "} " +
                ".page-section { " +
                "  margin-bottom: 25px; " +
                "} " +
                ".page-title { " +
                "  font-size: 16pt; " +
                "  color: #34495e; " +
                "  margin-bottom: 15px; " +
                "  padding-bottom: 5px; " +
                "  border-bottom: 1px solid #eee; " +
                "} " +
                ".page-content { " +
                "  text-align: justify; " +
                "  margin-bottom: 15px; " +
                "} " +
                ".page-content p { " +
                "  margin: 10px 0; " +
                "} " +
                ".page-content ul, .page-content ol { " +
                "  margin: 10px 0 10px 20px; " +
                "} " +
                ".page-content li { " +
                "  margin: 5px 0; " +
                "} " +
                ".document-footer { " +
                "  margin-top: 40px; " +
                "  padding-top: 20px; " +
                "  border-top: 1px solid #ccc; " +
                "  font-size: 9pt; " +
                "  color: #666; " +
                "  text-align: center; " +
                "} " +
                ".hash-info { " +
                "  font-weight: bold; " +
                "  margin-bottom: 5px; " +
                "} " +
                ".generated-info { " +
                "  font-style: italic; " +
                "} " +
                "</style>";
    }

    /**
     * Converts HTML to PDF using OpenHTMLtoPDF
     */
    private byte[] convertHtmlToPdf(String htmlContent) throws IOException {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(outputStream);
            builder.run();
            
            return outputStream.toByteArray();
        }
    }

    /**
     * Generates a meaningful PDF filename
     */
    private String generatePdfFileName(AgreementVersion agreementVersion, AgreementVersionUserCopy userCopy) {
        String sanitizedTitle = agreementVersion.getAgreement().getTitle()
                .replaceAll("[^a-zA-Z0-9\\s]", "")
                .replaceAll("\\s+", "_")
                .toLowerCase();
        
        if (userCopy != null) {
            // User-specific filename
            String sanitizedUserName = userCopy.getUserName()
                    .replaceAll("[^a-zA-Z0-9\\s]", "")
                    .replaceAll("\\s+", "_")
                    .toLowerCase();
            
            return String.format("%s_v%d_%s_%s.pdf", 
                    sanitizedTitle, 
                    agreementVersion.getVersionNumber(),
                    sanitizedUserName,
                    userCopy.getId().toString().substring(0, 8));
        } else {
            // Generic filename
            return String.format("%s_v%d_%s.pdf", 
                    sanitizedTitle, 
                    agreementVersion.getVersionNumber(),
                    agreementVersion.getId().toString().substring(0, 8));
        }
    }

    /**
     * Escapes HTML content for safe inclusion in HTML document
     */
    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;");
    }
}
