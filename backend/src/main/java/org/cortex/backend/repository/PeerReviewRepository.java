package org.cortex.backend.repository;

import org.cortex.backend.model.PeerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PeerReviewRepository extends JpaRepository<PeerReview, UUID> {
    Optional<PeerReview> findByMilestoneTracker_Id(UUID uuid);

    @Query("SELECT pr FROM PeerReview pr WHERE pr.survey.id = (select sr.survey.id FROM SurveyResponse sr where sr.id = :surveyResponseId)")
    Optional<PeerReview> findBySurveyResponseId(UUID surveyResponseId);
}