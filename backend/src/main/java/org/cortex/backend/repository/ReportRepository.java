package org.cortex.backend.repository;

import org.cortex.backend.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    @Query(value = "SELECT * FROM report WHERE version->>'coachingProgramId' = :coachingProgramId", nativeQuery = true)
    List<Report> findAllByVersion_CoachingProgramId(@Param("coachingProgramId") String coachingProgramId);

    @Query(value = "SELECT * FROM report WHERE version->>'coachingProgramId' = :coachingProgramId AND CAST(version->>'count' AS integer) = :count", nativeQuery = true)
    List<Report> findAllByVersion_CoachingProgramIdAndVersion_Count(@Param("coachingProgramId") String coachingProgramId, @Param("count") int count);

}
