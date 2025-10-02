package org.cortex.backend.repository;

import org.cortex.backend.model.Client;
import org.cortex.backend.model.ReportView;
import org.cortex.backend.model.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportViewRepository extends JpaRepository<ReportView, String> {

    @Query("SELECT cp.trainer FROM CoachingProgram cp WHERE cp.report.id = :reportId")
    Optional<Trainer> getTrainerByReportId(UUID reportId);

    List<ReportView> findByReportId(String reportId);

}