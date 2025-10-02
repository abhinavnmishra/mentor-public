package org.cortex.backend.repository;

import org.cortex.backend.model.TrainerOrganisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TrainerOrganisationRepository extends JpaRepository<TrainerOrganisation, UUID> {
}