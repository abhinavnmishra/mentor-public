package org.cortex.backend.agreements.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "agreement_acceptance",
       indexes = {
           @Index(name = "idx_agreement_acceptance_user", columnList = "user_id"),
                              @Index(name = "idx_agreement_acceptance_user_copy", columnList = "agreement_version_user_copy_id"),
           @Index(name = "idx_agreement_acceptance_correlation", columnList = "correlation_id")
       })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementAcceptance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId; // ID of the user who accepted the agreement

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agreement_version_user_copy_id", nullable = false)
    private AgreementVersionUserCopy agreementVersionUserCopy;

    @Column(name = "doc_sha256", nullable = false, length = 64)
    private String docSha256; // Document hash at time of acceptance for verification

    @Column(name = "ip_address", length = 45) // Supports both IPv4 and IPv6
    private String ipAddress;

    @Column(name = "user_agent", length = 1000)
    private String userAgent;

    @Column(name = "correlation_id", nullable = false, length = 36)
    private String correlationId; // For tracing acceptance flows

    @CreationTimestamp
    @Column(name = "accepted_at", updatable = false, nullable = false)
    private LocalDateTime acceptedAt;

    @Column(name = "acceptance_method", length = 50)
    @Builder.Default
    private String acceptanceMethod = "WEB_FORM"; // WEB_FORM, API, MOBILE_APP, etc.

    @Column(name = "browser_fingerprint", length = 500)
    private String browserFingerprint; // For additional security tracking

    /**
     * Validates that the document hash matches the user copy's hash
     */
    public boolean isDocumentHashValid() {
        return docSha256 != null && 
               agreementVersionUserCopy != null && 
               docSha256.equals(agreementVersionUserCopy.getDocSha256());
    }

    /**
     * Creates an acceptance record for a user copy of an agreement version
     */
    public static AgreementAcceptance createAcceptance(
            UUID userId,
            AgreementVersionUserCopy userCopy, 
            String ipAddress,
            String userAgent,
            String correlationId) {
        
        if (userCopy.getAgreementVersion().getStatus() != org.cortex.backend.agreements.constant.AgreementStatus.PUBLISHED) {
            throw new IllegalArgumentException("Cannot accept agreement version that is not published");
        }
        
        if (!userCopy.getAgreementVersion().isAcceptable()) {
            throw new IllegalArgumentException("Agreement version is not currently acceptable");
        }
        
        if (userCopy.getDocSha256() == null) {
            throw new IllegalArgumentException("User copy must have a document hash before acceptance");
        }
        
        return AgreementAcceptance.builder()
                .userId(userId)
                .agreementVersionUserCopy(userCopy)
                .docSha256(userCopy.getDocSha256())
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .correlationId(correlationId)
                .acceptanceMethod("WEB_FORM")
                .build();
    }
}
