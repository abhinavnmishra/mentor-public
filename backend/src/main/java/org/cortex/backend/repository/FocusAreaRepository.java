package org.cortex.backend.repository;

import org.cortex.backend.model.FocusArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FocusAreaRepository extends JpaRepository<FocusArea, UUID> {
    List<FocusArea> getAllByCoachingProgram_Id(UUID programId);

    List<FocusArea> getAllByParent_Id(UUID id);
}