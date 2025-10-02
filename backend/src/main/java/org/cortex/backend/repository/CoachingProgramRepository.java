package org.cortex.backend.repository;

import org.cortex.backend.model.CoachingProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CoachingProgramRepository extends JpaRepository<CoachingProgram, UUID> {
    int countByTrainer_Id(UUID trainerId);
    
    @Query("SELECT cp FROM CoachingProgram cp WHERE cp.trainer.trainerOrganisation.id = :organisationId")
    List<CoachingProgram> findByTrainerOrganisationId(UUID organisationId);

    @Query("SELECT cp FROM CoachingProgram cp WHERE cp.trainer.user.id = :userId")
    List<CoachingProgram> findByTrainerUserId(UUID userId);

    @Query("SELECT cp FROM CoachingProgram cp WHERE cp.id = (select distinct pm.coachingProgram.id from ProgramMilestone pm where pm.survey.id = :surveyId )")
    Optional<CoachingProgram> findBySurveyId(UUID surveyId);

    @Query("SELECT pm.coachingProgram FROM ProgramMilestone pm WHERE pm.survey.id = (SELECT sr.survey.id FROM SurveyResponse sr WHERE sr.id = :surveyResponseId)")
    Optional<CoachingProgram> findBySurveyResponseId(UUID surveyResponseId);

} 