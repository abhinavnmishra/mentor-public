package org.cortex.backend.repository;

import org.cortex.backend.constant.SurveyType;
import org.cortex.backend.model.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, UUID> {
    List<Survey> findByType(SurveyType type);

    @Query("SELECT s " +
            "FROM Survey s " +
            "WHERE s.id IN (" +
            "    SELECT pm.survey.id " +
            "    FROM ProgramMilestone pm " +
            "    WHERE pm.coachingProgram.id IN (" +
            "        SELECT cp.id " +
            "        FROM CoachingProgram cp " +
            "        WHERE cp.trainer.id IN (" +
            "            SELECT t.id " +
            "            FROM Trainer t " +
            "            WHERE t.trainerOrganisation.id = :trainerOrganisationId" +
            "        )" +
            "    )" +
            ")")
    List<Survey> findAllByTrainerOrganisationId(UUID trainerOrganisationId);
}