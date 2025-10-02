package org.cortex.backend.repository;

import org.cortex.backend.model.Client;
import org.cortex.backend.model.ClientOrganisation;
import org.cortex.backend.model.TrainerOrganisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClientOrganisationRepository extends JpaRepository<ClientOrganisation, UUID> {

    public List<ClientOrganisation> findAllByTrainerOrganisation(TrainerOrganisation trainerOrganisation);

} 