package org.cortex.backend.agreements.repository;

import org.cortex.backend.agreements.model.AgreementAcceptance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgreementAcceptanceRepository extends JpaRepository<AgreementAcceptance, UUID> {

    /**
     * Find all acceptances by a specific user
     */
    List<AgreementAcceptance> findByUserIdOrderByAcceptedAtDesc(UUID userId);

    /**
     * Find the latest acceptance by a user for a specific agreement (any version)
     */
    @Query("SELECT aa FROM AgreementAcceptance aa WHERE aa.userId = :userId " +
           "AND aa.agreementVersionUserCopy.agreementVersion.agreement.id = :agreementId " +
           "ORDER BY aa.acceptedAt DESC LIMIT 1")
    Optional<AgreementAcceptance> findLatestAcceptanceByUserAndAgreement(
            @Param("userId") UUID userId, 
            @Param("agreementId") UUID agreementId);

    Boolean existsByUserIdAndAgreementVersionUserCopy_AgreementVersion_Id(UUID userId, UUID versionId);

    Boolean existsByUserIdAndAgreementVersionUserCopy_Id(UUID userId, UUID versionId);

    Boolean existsByAgreementVersionUserCopy_Id(UUID versionUserCopyId);

    /**
     * Get acceptance statistics for an agreement
     */
    @Query("SELECT COUNT(aa) FROM AgreementAcceptance aa WHERE aa.agreementVersionUserCopy.agreementVersion.agreement.id = :agreementId")
    Long countAcceptancesByAgreementId(@Param("agreementId") UUID agreementId);

    /**
     * Get acceptance statistics for a specific version
     */
    @Query("SELECT COUNT(aa) FROM AgreementAcceptance aa WHERE aa.agreementVersionUserCopy.agreementVersion.id = :versionId")
    Long countAcceptancesByVersionId(@Param("versionId") UUID versionId);

    /**
     * Find the most recent acceptance for each user for a specific agreement
     */
    @Query("SELECT aa FROM AgreementAcceptance aa WHERE aa.id IN " +
           "(SELECT MAX(aa2.id) FROM AgreementAcceptance aa2 " +
           "WHERE aa2.agreementVersionUserCopy.agreementVersion.agreement.id = :agreementId GROUP BY aa2.userId)")
    List<AgreementAcceptance> findLatestAcceptancesByAgreementId(@Param("agreementId") UUID agreementId);
}
