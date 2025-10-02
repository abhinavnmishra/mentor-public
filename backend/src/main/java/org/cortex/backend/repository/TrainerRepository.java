package org.cortex.backend.repository;

import org.cortex.backend.model.Trainer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerRepository extends JpaRepository<Trainer, UUID> {
    List<Trainer> findByTrainerOrganisation_Id(UUID organisationId);

    Optional<Trainer> findByUser_Id(UUID userId);
}