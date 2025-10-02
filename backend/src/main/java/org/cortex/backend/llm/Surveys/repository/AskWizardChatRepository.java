package org.cortex.backend.llm.Surveys.repository;

import org.cortex.backend.llm.Surveys.model.AskWizardChat;
import org.cortex.backend.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AskWizardChatRepository extends JpaRepository<AskWizardChat, UUID> {

    @Query("SELECT DISTINCT mt.coachingSession.client FROM MilestoneTracker mt WHERE mt.programMilestone.survey.askWizardChat.id = :askWizardChatId")
    List<Client> findAllClientsByChatId(UUID askWizardChatId);

    @Query("SELECT DISTINCT pm FROM ProgramMilestone pm WHERE pm.survey.askWizardChat.id = :askWizardChatId")
    List<ProgramMilestone> findMilestoneByChatId(UUID askWizardChatId);

    @Query("SELECT mt.coachingSession.client FROM MilestoneTracker mt WHERE mt.id = :id")
    List<Client> findAllClientsByMilestoneTrackerId(UUID id);

    @Query("SELECT mt FROM MilestoneTracker mt WHERE mt.programMilestone.survey.askWizardChat.id = :askWizardChatId")
    List<MilestoneTracker> findAllTrackersByChatId(UUID askWizardChatId);

}
