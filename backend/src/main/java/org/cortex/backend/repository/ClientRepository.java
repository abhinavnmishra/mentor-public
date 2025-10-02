package org.cortex.backend.repository;

import org.cortex.backend.model.Client;
import org.cortex.backend.model.ClientOrganisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {
    long countByClientOrganisation(ClientOrganisation clientOrganisation);
    Optional<Client> findByUser_Id(UUID id);

    @Query("SELECT mt.coachingSession.client FROM MilestoneTracker mt WHERE mt.id = :milestoneTrackerId")
    Optional<Client> findByMilestoneTrackerId(UUID milestoneTrackerId);

    Optional<Client> findByEmailAndClientOrganisation_TrainerOrganisation_Id(String email, UUID orgId);

    @Query("SELECT cs.client FROM CoachingSession cs WHERE cs.coachingProgram.id = :programId")
    List<Client> getAllByProgramId(UUID programId);

    @Query("SELECT cs.client FROM CoachingSession cs WHERE cs.coachingProgram.id = :programId AND cs.client.email = :email")
    Optional<Client> findByEmailAndProgramId(String email, UUID programId);

}