package org.cortex.backend.repository;

import org.cortex.backend.constant.Status;
import org.cortex.backend.model.Client;
import org.cortex.backend.model.CoachingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CoachingSessionRepository extends JpaRepository<CoachingSession, UUID> {
    @Query("SELECT COUNT(DISTINCT cs.client.id) FROM CoachingSession cs WHERE cs.coachingProgram.trainer.id = :trainerId")
    int countDistinctClientByCoachingProgram_Trainer_Id(UUID trainerId);

    @Query("SELECT DISTINCT cs.client FROM CoachingSession cs WHERE cs.coachingProgram.id = :programId")
    List<Client> findDistinctClientsByProgramId(UUID programId);

    @Query("SELECT DISTINCT cs FROM CoachingSession cs WHERE cs.coachingProgram.calendlyEventType = :calendlyEventType AND cs.client.user.email = :email AND cs.coachingProgram.status = :status ORDER BY cs.createdAt DESC")
    List<CoachingSession> findDistinctCoachingSessionForCalendly(String calendlyEventType, String email, Status status);

    List<CoachingSession> findByCoachingProgramId(UUID id);

    List<CoachingSession> findAllByClient_User_UserNameOrderByCreatedAtDesc(String userName);

    Optional<CoachingSession> findByClient_IdAndCoachingProgram_Id(UUID clientId, UUID programId);
}