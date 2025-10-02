package org.cortex.backend.repository;

import org.cortex.backend.model.TaskInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskInstanceRepository extends JpaRepository<TaskInstance, UUID> {

    List<TaskInstance> findAllByCoachingSessionIdAndUserId(UUID programSessionId, UUID userId);

    @Query("SELECT ti FROM TaskInstance ti WHERE ti.coachingSessionId = (select cs.id FROM CoachingSession cs where cs.coachingProgram.id = :programId AND cs.client.user.id = :userId) ORDER BY ti.task.dueDate DESC")
    List<TaskInstance> findAllByProgramIdAndUserId(UUID programId, UUID userId);

    @Query("SELECT ti FROM TaskInstance ti WHERE ti.resourceInstanceId = :resourceInstanceId")
    List<TaskInstance> findAllByResourceInstanceId(UUID resourceInstanceId);


}
