package org.cortex.backend.agreements.repository;

import org.cortex.backend.agreements.model.AgreementVersionUserCopy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementVersionUserCopyRepository extends JpaRepository<AgreementVersionUserCopy, UUID> {

    /**
     * Find user copy by agreement version and user
     */
    Optional<AgreementVersionUserCopy> findByAgreementVersionIdAndUserId(UUID agreementVersionId, UUID userId);

    /**
     * Find all user copies for a specific user
     */
    List<AgreementVersionUserCopy> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Find all user copies for a specific agreement version
     */
    List<AgreementVersionUserCopy> findByAgreementVersionIdOrderByCreatedAtDesc(UUID agreementVersionId);

    /**
     * Find all user copies for a specific agreement (all versions)
     */
    @Query("SELECT auc FROM AgreementVersionUserCopy auc WHERE auc.agreementVersion.agreement.id = :agreementId ORDER BY auc.createdAt DESC")
    List<AgreementVersionUserCopy> findByAgreementIdOrderByCreatedAtDesc(@Param("agreementId") UUID agreementId);

    /**
     * Check if user copy exists for version and user
     */
    boolean existsByAgreementVersionIdAndUserId(UUID agreementVersionId, UUID userId);

    /**
     * Find user copies created within a date range
     */
    List<AgreementVersionUserCopy> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find user copies by document hash
     */
    List<AgreementVersionUserCopy> findByDocSha256(String docSha256);

    /**
     * Get count of user copies for an agreement version
     */
    @Query("SELECT COUNT(auc) FROM AgreementVersionUserCopy auc WHERE auc.agreementVersion.id = :versionId")
    Long countByAgreementVersionId(@Param("versionId") UUID versionId);

    /**
     * Get count of user copies for an agreement (all versions)
     */
    @Query("SELECT COUNT(auc) FROM AgreementVersionUserCopy auc WHERE auc.agreementVersion.agreement.id = :agreementId")
    Long countByAgreementId(@Param("agreementId") UUID agreementId);

    /**
     * Find user copies with hash mismatches (for audit purposes)
     */
    @Query("SELECT auc FROM AgreementVersionUserCopy auc WHERE auc.docSha256 != :expectedHash")
    List<AgreementVersionUserCopy> findByDocSha256Not(@Param("expectedHash") String expectedHash);

    /**
     * Find the latest user copy for each user for a specific agreement
     */
    @Query("SELECT auc FROM AgreementVersionUserCopy auc WHERE auc.id IN " +
           "(SELECT MAX(auc2.id) FROM AgreementVersionUserCopy auc2 " +
           "WHERE auc2.agreementVersion.agreement.id = :agreementId GROUP BY auc2.userId)")
    List<AgreementVersionUserCopy> findLatestUserCopiesByAgreementId(@Param("agreementId") UUID agreementId);
}
