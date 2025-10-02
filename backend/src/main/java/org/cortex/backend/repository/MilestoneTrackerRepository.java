package org.cortex.backend.repository;

import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.model.MilestoneTracker;
import org.cortex.backend.model.ProgramMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MilestoneTrackerRepository extends JpaRepository<MilestoneTracker, UUID> {
    @Query("SELECT mt FROM MilestoneTracker mt WHERE mt.coachingSession.client.id = :clientId order by mt.programMilestone.index desc")
    List<MilestoneTracker> findByClientId(UUID clientId);

    @Query("SELECT mt FROM MilestoneTracker mt WHERE mt.coachingSession.client.id = :clientId and mt.coachingSession.coachingProgram.id = :programId order by mt.programMilestone.index desc")
    List<MilestoneTracker> findByClientIdAndProgramId(UUID clientId, UUID programId);

    List<MilestoneTracker> findAllByCoachingSession_IdAndProgramMilestone_TypeOrderByProgramMilestone_IndexDesc(UUID coachingSessionId, MilestoneType type);

    List<MilestoneTracker> findAllByCoachingSession_Client_User_UserNameAndCoachingSession_CoachingProgram_IdOrderByProgramMilestone_IndexDesc(String username, UUID coachingProgramId);

    Optional<MilestoneTracker> findByProgramMilestone_IdAndCoachingSession_Client_Id(UUID programId, UUID clientId);

    List<MilestoneTracker> findByProgramMilestone(ProgramMilestone milestone);

    Integer countAllByCoachingSession_Id(UUID coachingSessionId);


} 