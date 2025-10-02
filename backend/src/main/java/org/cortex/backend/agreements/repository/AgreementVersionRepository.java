package org.cortex.backend.agreements.repository;

import org.cortex.backend.agreements.constant.AgreementStatus;
import org.cortex.backend.agreements.model.AgreementVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementVersionRepository extends JpaRepository<AgreementVersion, UUID> {

    /**
     * Find all versions for a specific agreement ordered by version number
     */
    List<AgreementVersion> findByAgreementIdOrderByVersionNumberDesc(UUID agreementId);

    /**
     * Find the latest version for an agreement
     */
    @Query("SELECT av FROM AgreementVersion av WHERE av.agreement.id = :agreementId " +
           "ORDER BY av.versionNumber DESC LIMIT 1")
    Optional<AgreementVersion> findLatestVersionByAgreementId(@Param("agreementId") UUID agreementId);

    /**
     * Find the current published version for an agreement
     */
    @Query("SELECT av FROM AgreementVersion av WHERE av.agreement.id = :agreementId " +
           "AND av.status = 'PUBLISHED' ORDER BY av.versionNumber DESC LIMIT 1")
    Optional<AgreementVersion> findCurrentPublishedVersionByAgreementId(@Param("agreementId") UUID agreementId);

    /**
     * Find versions by status
     */
    List<AgreementVersion> findByStatusOrderByCreatedAtDesc(AgreementStatus status);

    /**
     * Find draft versions for an agreement
     */
    List<AgreementVersion> findByAgreementIdAndStatus(UUID agreementId, AgreementStatus status);

    /**
     * Check if a version number already exists for an agreement
     */
    boolean existsByAgreementIdAndVersionNumber(UUID agreementId, Integer versionNumber);

    /**
     * Find published versions that are effective (can be accepted)
     */
    @Query("SELECT av FROM AgreementVersion av WHERE av.status = 'PUBLISHED' " +
           "AND (av.effectiveAt IS NULL OR av.effectiveAt <= :currentTime) " +
           "ORDER BY av.effectiveAt DESC")
    List<AgreementVersion> findEffectivePublishedVersions(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Find versions published before a specific date (for audit trail validation)
     */
    @Query("SELECT av FROM AgreementVersion av WHERE av.publishedAt < :date")
    List<AgreementVersion> findVersionsPublishedBefore(@Param("date") LocalDateTime date);

    /**
     * Get next version number for an agreement
     */
    @Query("SELECT COALESCE(MAX(av.versionNumber), 0) + 1 FROM AgreementVersion av WHERE av.agreement.id = :agreementId")
    Integer getNextVersionNumber(@Param("agreementId") UUID agreementId);
}
