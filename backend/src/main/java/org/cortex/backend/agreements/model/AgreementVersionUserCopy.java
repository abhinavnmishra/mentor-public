package org.cortex.backend.agreements.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agreement_version_user_copy",
       uniqueConstraints = @UniqueConstraint(columnNames = {"agreement_version_id", "user_id"}),
       indexes = {
           @Index(name = "idx_agreement_version_user_copy_user", columnList = "user_id"),
           @Index(name = "idx_agreement_version_user_copy_version", columnList = "agreement_version_id"),
           @Index(name = "idx_agreement_version_user_copy_hash", columnList = "doc_sha256")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementVersionUserCopy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_version_id", nullable = false)
    private AgreementVersion agreementVersion;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "user_name", nullable = false, length = 255)
    private String userName;

    @Column(name = "user_email", nullable = false, length = 255)
    private String userEmail;

    @Column(name = "user_organisation", length = 255)
    private String userOrganisation;

    @Column(name = "generated_pdf_asset_id")
    private UUID generatedPdfAssetId; // Reference to PublicAsset containing user-specific PDF

    @Column(name = "doc_sha256", nullable = false, length = 64)
    private String docSha256; // Document hash calculated from user-specific PDF binary

    @Column(name = "hash_created_at", nullable = false)
    private LocalDateTime hashCreatedAt; // Timestamp when hash was calculated

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Sets the document hash and timestamp
     */
    public void setDocumentHashWithTimestamp(String hash) {
        this.docSha256 = hash;
        this.hashCreatedAt = LocalDateTime.now();
    }

    /**
     * Sets the generated PDF asset reference
     */
    public void setGeneratedPdfAsset(UUID pdfAssetId) {
        this.generatedPdfAssetId = pdfAssetId;
    }

    /**
     * Creates a user copy for an agreement version
     */
    public static AgreementVersionUserCopy createUserCopy(
            AgreementVersion agreementVersion,
            UUID userId,
            String userName,
            String userEmail,
            String userOrganisation) {
        
        return AgreementVersionUserCopy.builder()
                .agreementVersion(agreementVersion)
                .userId(userId)
                .userName(userName)
                .userEmail(userEmail)
                .userOrganisation(userOrganisation)
                .build();
    }
}
