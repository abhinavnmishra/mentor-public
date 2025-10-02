package org.cortex.backend.agreements.model;

import jakarta.persistence.*;
import lombok.*;
import org.cortex.backend.agreements.constant.AgreementStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "agreement_version", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"agreement_id", "version_number"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_id", nullable = false)
    private Agreement agreement;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AgreementStatus status = AgreementStatus.DRAFT;

    // Content can be either rich text (JSON) or PDF file path
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<AgreementPage> pages; // For rich text content with pagination

    @Column(length = 500)
    private String pdfFilePath; // For PDF document uploads

    @Column(name = "generated_pdf_asset_id")
    private UUID generatedPdfAssetId; // Reference to PublicAsset containing generated PDF

    @Column(name = "doc_sha256", length = 64)
    private String docSha256; // Document hash calculated from PDF binary for integrity verification

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "retired_at")
    private LocalDateTime retiredAt;

    @Column(name = "effective_at")
    private LocalDateTime effectiveAt; // When this version becomes effective

    @Column(nullable = false)
    private UUID publishedBy; // User ID who published this version

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AgreementPage {
        private Integer pageNumber;
        private String content; // Rich text content
        private String title;
    }

    /**
     * Sets the document hash (calculated from PDF binary)
     */
    public void setDocumentHash(String hash) {
        this.docSha256 = hash;
    }
    
    /**
     * Sets the generated PDF asset reference
     */
    public void setGeneratedPdfAsset(UUID pdfAssetId) {
        this.generatedPdfAssetId = pdfAssetId;
    }

    /**
     * Publishes this version, making it immutable
     * Note: PDF generation and hash calculation are handled by the service layer
     */
    public void publish(UUID publisherId, LocalDateTime effectiveDate, UUID pdfAssetId, String documentHash) {
        if (this.status == AgreementStatus.PUBLISHED) {
            throw new IllegalStateException("Agreement version is already published and cannot be modified");
        }
        
        this.status = AgreementStatus.PUBLISHED;
        this.publishedBy = publisherId;
        this.publishedAt = LocalDateTime.now();
        this.effectiveAt = effectiveDate != null ? effectiveDate : LocalDateTime.now();
        this.generatedPdfAssetId = pdfAssetId;
        this.docSha256 = documentHash;
    }

    /**
     * Retires this version, preventing future acceptances
     */
    public void retire() {
        if (this.status != AgreementStatus.PUBLISHED) {
            throw new IllegalStateException("Only published agreement versions can be retired");
        }
        
        this.status = AgreementStatus.RETIRED;
        this.retiredAt = LocalDateTime.now();
    }

    /**
     * Checks if this version can be edited
     */
    public boolean isEditable() {
        return this.status == AgreementStatus.DRAFT;
    }

    /**
     * Checks if this version can be accepted by users
     */
    public boolean isAcceptable() {
        return this.status == AgreementStatus.PUBLISHED && 
               (effectiveAt == null || effectiveAt.isBefore(LocalDateTime.now()) || effectiveAt.isEqual(LocalDateTime.now()));
    }
}
