package org.cortex.backend.agent.repository;

import org.cortex.backend.agent.model.AgentTokenUsage;
import org.cortex.backend.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface AgentTokenUsageRepository extends JpaRepository<AgentTokenUsage, UUID> {

    List<AgentTokenUsage> findAllByUserAndStartTimeBeforeAndEndTimeAfterOrderByUpdatedAtAsc(User user, LocalDateTime startTime, LocalDateTime endTime);

}
