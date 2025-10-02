package org.cortex.backend.repository;

import org.cortex.backend.model.ProgramMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgramMilestoneRepository extends JpaRepository<ProgramMilestone, UUID> {

    Optional<ProgramMilestone> findBySurvey_Id(UUID uuid);

    List<ProgramMilestone> findAllByCoachingProgramId(UUID id);

} 