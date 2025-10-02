package org.cortex.backend.agreements.repository;

import org.cortex.backend.agreements.model.Agreement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AgreementRepository extends JpaRepository<Agreement, UUID> {

    /**
     * Find agreements created by a specific user
     */
    List<Agreement> findByCreatedByOrderByCreatedAtDesc(UUID createdBy);

    List<Agreement> findByOrganisationIdOrderByCreatedAtDesc(UUID orgId);
    /**
     * Find agreements created by a specific user with pagination
     */
    Page<Agreement> findByCreatedByOrderByCreatedAtDesc(UUID createdBy, Pageable pageable);

    /**
     * Find agreements by title (case-insensitive partial match)
     */
    @Query("SELECT a FROM Agreement a WHERE LOWER(a.title) LIKE LOWER(CONCAT('%', :title, '%')) ORDER BY a.createdAt DESC")
    List<Agreement> findByTitleContainingIgnoreCase(@Param("title") String title);

    /**
     * Find all agreements with their latest versions
     */
    @Query("SELECT DISTINCT a FROM Agreement a LEFT JOIN FETCH a.versions v WHERE v.versionNumber = " +
           "(SELECT MAX(v2.versionNumber) FROM AgreementVersion v2 WHERE v2.agreement = a)")
    List<Agreement> findAllWithLatestVersions();

    /**
     * Find agreements that have published versions
     */
    @Query("SELECT DISTINCT a FROM Agreement a JOIN a.versions v WHERE v.status = 'PUBLISHED'")
    List<Agreement> findAgreementsWithPublishedVersions();

    /**
     * Check if agreement exists by title for the same creator
     */
    boolean existsByTitleAndCreatedBy(String title, UUID createdBy);

    boolean existsByTitleAndOrganisationId(String title, UUID organisationId);
}
