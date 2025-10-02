package org.cortex.backend.agent.chat.repository;

import org.cortex.backend.agent.chat.model.AgentChat;
import org.cortex.backend.model.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AgentChatRepository extends JpaRepository<AgentChat, UUID> {

    Optional<AgentChat> findAllByTrainerOrderByCreatedAt(Trainer trainer);
    
    List<AgentChat> findTop10ByTrainerOrderByCreatedAtDesc(Trainer trainer);

}
