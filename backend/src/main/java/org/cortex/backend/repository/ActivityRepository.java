package org.cortex.backend.repository;

import org.cortex.backend.model.Activity;
import org.cortex.backend.model.Client;
import org.cortex.backend.model.MilestoneTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    @Query("SELECT mt from MilestoneTracker mt where mt.programMilestone.activity.id = :activityId")
    List<MilestoneTracker> findMilestoneTrackersByActivityId(UUID activityId);

}