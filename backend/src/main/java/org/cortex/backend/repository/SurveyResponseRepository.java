package org.cortex.backend.repository;

import org.cortex.backend.constant.Status;
import org.cortex.backend.model.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SurveyResponseRepository extends JpaRepository<SurveyResponse, UUID> {
    List<SurveyResponse> findBySurvey_Id(UUID surveyId);
    @Query("SELECT sr FROM SurveyResponse sr WHERE sr.survey.id = :surveyId AND sr.respondentEmail = :email ORDER BY sr.createdAt DESC LIMIT 1")
    Optional<SurveyResponse> findLatestBySurveyIdAndRespondentEmail(UUID surveyId, String email);

    @Query("SELECT sr FROM SurveyResponse sr WHERE sr.survey.id = :surveyId AND sr.client.id = :clientId ORDER BY sr.createdAt DESC LIMIT 1")
    Optional<SurveyResponse> findLatestBySurveyIdAndClientId(UUID surveyId, UUID clientId);

    List<SurveyResponse> findByPeerReview_Id(UUID peerReviewId);

    List<SurveyResponse> findAllByIdAndStatus(UUID id, Status status);

    List<SurveyResponse> findBySurvey_IdAndStatus(UUID surveyId, Status status);

    List<SurveyResponse> findAllByClientId(UUID clientId);

} 