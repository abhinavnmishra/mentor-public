package org.cortex.backend.clients.service;

import io.jsonwebtoken.Claims;
import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.exercises.repository.ExerciseResponseRepository;
import org.cortex.backend.model.CoachingSession;
import org.cortex.backend.model.MilestoneTracker;
import org.cortex.backend.model.PeerReview;
import org.cortex.backend.model.SurveyResponse;
import org.cortex.backend.repository.CoachingSessionRepository;
import org.cortex.backend.repository.MilestoneTrackerRepository;
import org.cortex.backend.repository.PeerReviewRepository;
import org.cortex.backend.repository.SurveyResponseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ClientPortalService {

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private MilestoneTrackerRepository milestoneTrackerRepository;

    @Autowired
    private ExerciseResponseRepository exerciseResponseRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private PeerReviewRepository peerReviewRepository;

    public List<CoachingSession.ClientProgramView> getAllClientPrograms(Claims claims) {
        String username = (String) claims.get("username");

        return coachingSessionRepository.findAllByClient_User_UserNameOrderByCreatedAtDesc(username)
                .stream()
                .map(CoachingSession::getClientProgramView)
                .map(program -> {
                    Integer completedMilestones = milestoneTrackerRepository.countAllByCoachingSession_Id(program.getCoachingSessionId());
                    program.setMilestoneCount(completedMilestones);
                    return program;
                })
                .toList();
    }

    public CoachingSession.ClientProgramView getClientProgram(Claims claims, String programId) {
        String username = (String) claims.get("username");

        List<CoachingSession.ClientProgramView> programs = coachingSessionRepository.findAllByClient_User_UserNameOrderByCreatedAtDesc(username)
                .stream()
                .map(CoachingSession::getClientProgramView)
                .map(program -> {
                    Integer completedMilestones = milestoneTrackerRepository.countAllByCoachingSession_Id(program.getCoachingSessionId());
                    program.setMilestoneCount(completedMilestones);
                    return program;
                }).filter(program -> program.getProgramId().toString().equals(programId))
                .toList();
        if (!programs.isEmpty()) {
            return programs.get(0);
        } else {
            throw new RuntimeException("Program not found");
        }
    }

    public List<MilestoneTracker.ClientMilestoneView> getAllClientMilestones(String coachingProgramId, Claims claims) {
        String username = (String) claims.get("username");

        return milestoneTrackerRepository.findAllByCoachingSession_Client_User_UserNameAndCoachingSession_CoachingProgram_IdOrderByProgramMilestone_IndexDesc(username, UUID.fromString(coachingProgramId))
                .stream()
                .map(MilestoneTracker.ClientMilestoneView::new)
                .peek(milestoneView -> {
                    if (milestoneView.getType().equals(MilestoneType.ACTIVITY)){
                        Optional<ExerciseResponse> exerciseResponseOptional = exerciseResponseRepository.findByMilestoneTrackerId(milestoneView.getTrackerId());
                        exerciseResponseOptional.ifPresent(exerciseResponse -> {
                            milestoneView.setExerciseResponseId(exerciseResponse.getId().toString());
                            milestoneView.setReportUrl(exerciseResponse.getReportUrl());
                        });
                    } else if (milestoneView.getType().equals(MilestoneType.SURVEY)){
                        Optional<SurveyResponse> surveyResponseOptional = surveyResponseRepository.findLatestBySurveyIdAndClientId(milestoneView.getSurveyId(), milestoneView.getClientId());
                        surveyResponseOptional.ifPresent(surveyResponse -> {
                            milestoneView.setSurveyResponseId(surveyResponse.getId());
                            milestoneView.setReportUrl(surveyResponse.getReportUrl());
                        });
                    } else if (milestoneView.getType().equals(MilestoneType.PEER_REVIEW)){
                        Optional<PeerReview> peerReviewOptional = peerReviewRepository.findByMilestoneTracker_Id(milestoneView.getTrackerId());
                        peerReviewOptional.ifPresent(peerReview -> {
                            milestoneView.setPeerReviewId(peerReview.getId());
                            milestoneView.setReportUrl(peerReview.getReportUrl());
                        });
                    }
                })
                .toList();
    }

}
