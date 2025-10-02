package org.cortex.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import org.apache.commons.io.IOUtils;
import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.constant.Status;
import org.cortex.backend.constant.SurveyType;
import org.cortex.backend.dto.FormDto;
import org.cortex.backend.dto.PeerDto;
import org.cortex.backend.dto.SurveyWizardDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.llm.Evaluations.EvaluationService;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SurveyWizardService {

    private static final Logger logger = LoggerFactory.getLogger(SurveyWizardService.class);

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private PeerReviewRepository peerReviewRepository;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private MilestoneTrackerRepository milestoneTrackerRepository;

    @Autowired
    private FocusAreaRepository focusAreaRepository;

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private TrainerOrganisationRepository trainerOrganisationRepository;

    @Autowired
    private ReportViewGenerator reportViewGenerator;

    @Autowired
    private EmailService emailService;

    @Value("classpath:email_templates/peer_review_invitation.html")
    private Resource peerInvitationResource;

    @Value("classpath:email_templates/peer_review_reminder.html")
    private Resource peerReminderResource;

    @Value("classpath:email_templates/peer_review_assignment.html")
    private Resource peerReviewAssignmentResource;

    @Value("classpath:email_templates/survey_assignment.html")
    private Resource surveyAssignmentResource;

    @Value("${frontend-base-url}")
    private String frontendBaseUrl;

    private String surveyAssignment;
    private String peerInvitation;
    private String peerReminder;
    private String peerReviewAssignment;

    @PostConstruct
    public void init() throws IOException {
        logger.info("Entering init - Loading email templates");
        try {
            logger.debug("Reading peer reminder template");
            peerReminder = IOUtils.toString(peerReminderResource.getInputStream(), StandardCharsets.UTF_8);
            
            logger.debug("Reading peer invitation template");
            peerInvitation = IOUtils.toString(peerInvitationResource.getInputStream(), StandardCharsets.UTF_8);
            
            logger.debug("Reading peer review assignment template");
            peerReviewAssignment = IOUtils.toString(peerReviewAssignmentResource.getInputStream(), StandardCharsets.UTF_8);

            logger.debug("Reading survey assignment template");
            surveyAssignment = IOUtils.toString(surveyAssignmentResource.getInputStream(), StandardCharsets.UTF_8);

            logger.info("Successfully loaded all email templates");
        } catch (IOException e) {
            logger.error("Failed to initialize email templates: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting init");
        }
    }

    public SurveyResponse getLatestResponse(String surveyId, String respondentEmail) {
        logger.info("Entering getLatestResponse - surveyId: {}, respondent: {}", surveyId, respondentEmail);
        try {
            logger.debug("Fetching latest response from repository");
            SurveyResponse response = surveyResponseRepository.findLatestBySurveyIdAndRespondentEmail(
                UUID.fromString(surveyId), 
                respondentEmail
            ).orElseThrow(() -> {
                logger.error("No survey response found for survey: {} and respondent: {}", surveyId, respondentEmail);
                return new ResourceNotFoundException("No survey response found for this survey and respondent");
            });
            
            logger.info("Successfully retrieved latest response");
            return response;
        } catch (Exception e) {
            logger.error("Error in getLatestResponse: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getLatestResponse");
        }
    }

    public SurveyResponse getLatestResponseByClient(String surveyId, UUID clientId) {
        logger.info("Entering getLatestResponseByClient - surveyId: {}, client: {}", surveyId, clientId );
        try {
            logger.debug("Fetching latest response from repository");
            SurveyResponse response = surveyResponseRepository.findLatestBySurveyIdAndClientId(
                    UUID.fromString(surveyId),
                    clientId
            ).orElseThrow(() -> {
                logger.error("No survey response found for survey: {} and client: {}", surveyId, clientId);
                return new ResourceNotFoundException("No survey response found for this survey and client");
            });

            logger.info("Successfully retrieved latest response");
            return response;
        } catch (Exception e) {
            logger.error("Error in getLatestResponseByClient: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getLatestResponseByClient");
        }
    }

    public List<SurveyResponse> getSurveyResponsesByMilestoneTrackerAndSurvey(String milestoneTrackerId, String surveyId) {
        logger.info("Entering getSurveyResponsesByMilestoneTrackerAndSurvey - tracker: {}, survey: {}", milestoneTrackerId, surveyId);
        try {
            logger.debug("Finding peer review for milestone tracker and survey");
            PeerReview peerReview = peerReviewRepository.findAll().stream()
                .filter(pr -> pr.getMilestoneTracker().getId().equals(UUID.fromString(milestoneTrackerId))
                    && pr.getSurvey().getId().equals(UUID.fromString(surveyId)))
                .findFirst()
                .orElseThrow(() -> {
                    logger.error("No peer review found for milestone tracker: {} and survey: {}", milestoneTrackerId, surveyId);
                    return new ResourceNotFoundException("No peer review found for given milestone tracker and survey");
                });

            List<SurveyResponse> responses = surveyResponseRepository.findByPeerReview_Id(peerReview.getId());
            logger.info("Found {} survey responses", responses.size());
            return responses;
        } catch (Exception e) {
            logger.error("Error in getSurveyResponsesByMilestoneTrackerAndSurvey: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getSurveyResponsesByMilestoneTrackerAndSurvey");
        }
    }

    public Survey populateSurveyStats(Survey survey){
        List<SurveyResponse> surveyResponseList = surveyResponseRepository.findBySurvey_Id(survey.getId());
        int completedCount = 0;
        int pendingCount = 0;
        for(SurveyResponse surveyResponse : surveyResponseList) {
            if(surveyResponse.getStatus() == Status.COMPLETED){
                completedCount++;
            } else if (surveyResponse.getStatus() == Status.ACTIVE || surveyResponse.getStatus() == Status.PAUSED ) {
                pendingCount++;
            }
        }
        survey.setCompletedCount(completedCount);
        survey.setPendingCount(pendingCount);
        return survey;
    }

    public SurveyWizardDto updateSurveyWizard(String surveyId, SurveyWizardDto request) {
        logger.info("Entering updateSurveyWizard - surveyId: {}", surveyId);
        try {
            logger.debug("Fetching survey with ID: {}", surveyId);
            Survey survey = surveyRepository.findById(UUID.fromString(surveyId))
                .orElseThrow(() -> {
                    logger.error("Survey not found with ID: {}", surveyId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            logger.debug("Updating survey properties");
            survey.setSurveyId();
            survey.setPeerReviewCount(request.getPeerReviewCount());
            survey.setObjective(request.getObjective());
            survey.setTitle(request.getTitle());
            survey.setPublished(request.getPublished());
            survey.setStartDate(request.getStartDate());
            survey.setDueDate(request.getDueDate());
            survey.setQuestions(request.getQuestions());
            survey.setType(SurveyType.valueOf(request.getSurveyType()));
            survey = surveyRepository.save(survey);

            logger.debug("Fetching and updating program milestone");
            ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(survey.getId())
                .orElseThrow(() -> {
                    logger.error("Program milestone not found for survey: {}", surveyId);
                    return new ResourceNotFoundException("Program Not Found");
                });

            milestone.setSurvey(survey);
            milestone.setStartDate(request.getStartDate());
            milestone.setDueDate(request.getDueDate());
            milestone.setStatus((request.getPublished() ? Status.ACTIVE : Status.PAUSED));
            programMilestoneRepository.save(milestone);

            logger.info("Successfully updated survey wizard");
            return getSurveyWizard(surveyId);
        } catch (Exception e) {
            logger.error("Error in updateSurveyWizard: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateSurveyWizard");
        }
    }

    public SurveyWizardDto publishSurvey(String surveyId, Boolean publish, SurveyWizardDto wizardDto, Claims claims) throws Exception {
        logger.info("Entering publishSurvey - surveyId: {}, publish: {}", surveyId, publish);
        try {
            logger.debug("Fetching survey with ID: {}", surveyId);
            Survey survey = surveyRepository.findById(UUID.fromString(surveyId))
                .orElseThrow(() -> {
                    logger.error("Survey not found with ID: {}", surveyId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            if(wizardDto != null && publish){
                logger.debug("Saving Survey Wizard");
                updateSurveyWizard(surveyId, wizardDto);
            }

            survey.setSurveySummary(evaluationService.getSurveySummary(surveyId));
            survey.setPublished(publish);
            survey = surveyRepository.save(survey);

            logger.debug("Updating program milestone status");
            ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(survey.getId())
                .orElseThrow(() -> {
                    logger.error("Program milestone not found for survey: {}", surveyId);
                    return new ResourceNotFoundException("Program Not Found");
                });

            milestone.setSurvey(survey);
            milestone.setStatus((publish ? Status.ACTIVE : Status.PAUSED));
            programMilestoneRepository.save(milestone);

            if (publish){
                List<MilestoneTracker> milestoneTrackers = milestoneTrackerRepository.findByProgramMilestone(milestone);
                for(MilestoneTracker tracker : milestoneTrackers) {
                    if(milestone.getType() == MilestoneType.PEER_REVIEW) {
                        logger.debug("Sending peer review assignments");
                        sendPeerReviewAssignment(tracker, claims);
                    } else if (milestone.getType() == MilestoneType.SURVEY) {
                        logger.debug("Sending survey assignments");
                        sendSurveyAssignment(tracker, claims);
                    }
                }
            }

            logger.info("Successfully published/unpublished survey");
            return getSurveyWizard(surveyId);
        } catch (Exception e) {
            logger.error("Error in publishSurvey: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting publishSurvey");
        }
    }

    public Survey getSurveyDetails(String surveyId) {
        logger.info("Entering getSurveyDetails - surveyId: {}", surveyId);
        try {
            logger.debug("Fetching survey with ID: {}", surveyId);
            Survey survey = surveyRepository.findById(UUID.fromString(surveyId))
                .orElseThrow(() -> {
                    logger.error("Survey not found with ID: {}", surveyId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            logger.debug("Calculating response counts");
            survey = populateSurveyStats(survey);

            logger.info("Successfully retrieved survey details");
            return survey;
        } catch (Exception e) {
            logger.error("Error in getSurveyDetails: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getSurveyDetails");
        }
    }

    public SurveyWizardDto importQuestions(String cloneSurveyId, SurveyWizardDto request){
        Survey survey = surveyRepository.findById(UUID.fromString(cloneSurveyId))
                .orElseThrow(() -> {
                    logger.error("Clone Survey not found with ID: {}", cloneSurveyId);
                    return new ResourceNotFoundException("Invalid Id");
                });

        ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(survey.getId())
                .orElseThrow(() -> {
                    logger.error("Program milestone not found for survey: {}", survey.getId());
                    return new RuntimeException("Program Not Found");
                });

        ArrayList<ArrayList<SurveyWizardDto.QuestionItem>> questions = (ArrayList<ArrayList<SurveyWizardDto.QuestionItem>>) survey.getTemplate().get("questions");
        request.getQuestions().addAll(questions);
        request.setFocusAreas(getAllFocusAreaFlat(milestone.getFocusAreas()));
        return request;
    }

    public SurveyWizardDto getSurveyWizard(String surveyId) {
        logger.info("Entering getSurveyWizard - surveyId: {}", surveyId);
        try {
            logger.debug("Fetching survey and milestone");
            Survey survey = surveyRepository.findById(UUID.fromString(surveyId))
                .orElseThrow(() -> {
                    logger.error("Survey not found with ID: {}", surveyId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(survey.getId())
                .orElseThrow(() -> {
                    logger.error("Program milestone not found for survey: {}", surveyId);
                    return new RuntimeException("Program Not Found");
                });

            logger.debug("Creating survey wizard DTO");
            SurveyWizardDto surveyWizardDto = new SurveyWizardDto();
            surveyWizardDto.setSurveyId(survey.getId().toString());
            surveyWizardDto.setMilestoneId(milestone.getId().toString());
            surveyWizardDto.setChatId(survey.getAskWizardChat().getId().toString());
            surveyWizardDto.setPeerReviewCount(survey.getPeerReviewCount());
            surveyWizardDto.setTitle(survey.getTitle());
            surveyWizardDto.setObjective(survey.getObjective());
            surveyWizardDto.setSurveyType(survey.getType().toString());
            surveyWizardDto.setPublished(milestone.getStatus() == Status.ACTIVE);
            surveyWizardDto.setStartDate(milestone.getStartDate());
            surveyWizardDto.setDueDate(milestone.getDueDate());
            surveyWizardDto.setFocusAreas(getAllFocusAreaFlat(milestone.getFocusAreas()));
            surveyWizardDto.setQuestions((ArrayList<ArrayList<SurveyWizardDto.QuestionItem>>) survey.getTemplate().get("questions"));

            logger.info("Successfully retrieved survey wizard data");
            return surveyWizardDto;
        } catch (Exception e) {
            logger.error("Error in getSurveyWizard: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getSurveyWizard");
        }
    }

    @Async
    public void processFormEvaluation(String surveyResponseId) {
        logger.info("Starting async form evaluation for surveyResponseId: {}", surveyResponseId);
        try {
            logger.info("Evaluating Form");
            evaluationService.evaluateAnswers(surveyResponseId);

            SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            if (surveyResponse.getSurvey().getType().equals(SurveyType.PEER_REVIEW)) {
                logger.info("Summarising Peer Review");
                PeerReview peerReview = peerReviewRepository.findBySurveyResponseId(UUID.fromString(surveyResponseId))
                        .orElseThrow(() -> {
                            logger.error("peer review not found for survey response ID: {}", surveyResponseId);
                            return new ResourceNotFoundException("peer review not found");
                        });

                peerReview.setPeerReviewSummary(evaluationService.getPeerReviewResponseSummary(peerReview.getId().toString()));
                peerReviewRepository.save(peerReview);
                logger.info("Completed Summarising Peer Review");
            }

            logger.info("Successfully completed async form evaluation");
        } catch (Exception e) {
            logger.error("Error in processFormEvaluation: {}", e.getMessage(), e);
        }
    }

    public FormDto submitForm(String surveyResponseId, FormDto request) {
        logger.info("Entering submitForm - surveyResponseId: {}", surveyResponseId);
        try {
            logger.debug("Fetching survey response with ID: {}", surveyResponseId);
            SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            logger.debug("Updating survey response");
            surveyResponse.setResponses(request.getResponses());
            surveyResponse.setCompletedDateAsCurrent();
            surveyResponse.setStatus(Status.COMPLETED);
            surveyResponse.setSurveyResponseId();
            surveyResponseRepository.save(surveyResponse);

            // Trigger async evaluation
            processFormEvaluation(surveyResponseId);

            logger.info("Successfully submitted form");
            return getForm(surveyResponseId);
        } catch (Exception e) {
            logger.error("Error in submitForm: {}", e.getMessage(), e);
            return request;
        } finally {
            logger.info("Exiting submitForm");
        }
    }

    public SurveyResponse saveSurveyEvaluation(String surveyResponseId, SurveyResponse surveyResponse) {

        logger.info("Entering saveSurveyEvaluation - surveyResponseId: {}", surveyResponseId);
        try {
            logger.debug("Fetching survey response with ID: {}", surveyResponseId);
            SurveyResponse existingResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            logger.debug("Updating evaluation details");
            existingResponse.setEvaluation(surveyResponse.getEvaluation());
            existingResponse.setReportPages(surveyResponse.getReportPages());
            existingResponse = surveyResponseRepository.save(existingResponse);

            logger.info("Successfully saved survey evaluation");
            return existingResponse;
        } catch (Exception e) {
            logger.error("Error in saveSurveyEvaluation: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting saveSurveyEvaluation");
        }

    }

    public List<SurveyResponse> invitePeer(String peerReviewId, PeerDto request, Claims claims) throws Exception {
        logger.info("Entering invitePeer - peerReviewId: {}, peer email: {}", peerReviewId, request.getEmail());
        try {
            logger.debug("Fetching peer review with ID: {}", peerReviewId);
            PeerReview peerReview = peerReviewRepository.findById(UUID.fromString(peerReviewId))
                .orElseThrow(() -> {
                    logger.error("Peer review not found with ID: {}", peerReviewId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            logger.debug("Creating new survey response for peer");
            SurveyResponse surveyResponse = new SurveyResponse();
            surveyResponse.setSurvey(peerReview.getSurvey());
            surveyResponse.setPeerReview(peerReview);
            surveyResponse.setRespondentEmail(request.getEmail());
            surveyResponse.setRespondentDesignation(request.getDesignation());
            surveyResponse.setRespondentName(request.getName());
            surveyResponse.setClientIdentifier(peerReview.getMilestoneTracker().getCoachingSession().getClient().getId().toString());
            surveyResponse.setStatus(Status.PAUSED);
            surveyResponse = surveyResponseRepository.save(surveyResponse);

            logger.debug("Sending invitation email");
            sendInviteToPeer(surveyResponse.getId().toString(), claims);

            logger.info("Successfully invited peer");
            return getAllPeerStatus(peerReviewId);
        } catch (Exception e) {
            logger.error("Error in invitePeer: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting invitePeer");
        }
    }

    public List<SurveyResponse> getAllPeerStatus(String peerReviewId) {
        logger.info("Entering getAllPeerStatus - peerReviewId: {}", peerReviewId);
        try {
            List<SurveyResponse> responses = surveyResponseRepository.findByPeerReview_Id(UUID.fromString(peerReviewId));
            logger.info("Found {} peer responses", responses.size());
            return responses;
        } catch (Exception e) {
            logger.error("Error in getAllPeerStatus: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getAllPeerStatus");
        }
    }

    public List<Survey> listAvailableSurveys(String trainerOrganisationId){
        return surveyRepository.findAllByTrainerOrganisationId(UUID.fromString(trainerOrganisationId));
    }

    public void sendReminderToPeer(String surveyResponseId, Claims claims) throws Exception {
        logger.info("Entering sendReminderToPeer - surveyResponseId: {}", surveyResponseId);
        try {
            logger.debug("Fetching survey response with ID: {}", surveyResponseId);
            SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString((String) claims.get("organisationId")))
                    .orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

            String menteeFullName = surveyResponse.getPeerReview().getMilestoneTracker().getCoachingSession().getClient().fullName();

            logger.debug("Sending reminder email to: {}", surveyResponse.getRespondentEmail());
            emailService.sendEmailWithBranding(
                surveyResponse.getRespondentEmail(),
                "Reminder To Complete Peer Survey",
                peerReminder.replaceAll("<<mentee_name>>", menteeFullName)
                        .replaceAll("<<trainer_organisation>>", trainerOrganisation.getName())
                    .replaceAll("<<peer_name>>", surveyResponse.getRespondentName())
                    .replaceAll("<<survey_link>>", frontendBaseUrl + "/survey/" + surveyResponse.getId().toString()),
                    claims
            );

            logger.info("Successfully sent reminder email");
        } catch (Exception e) {
            logger.error("Error in sendReminderToPeer: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting sendReminderToPeer");
        }
    }

    public void sendInviteToPeer(String surveyResponseId, Claims claims) throws Exception {
        logger.info("Entering sendInviteToPeer - surveyResponseId: {}", surveyResponseId);
        try {
            logger.debug("Fetching survey response with ID: {}", surveyResponseId);
            SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString((String) claims.get("organisationId")))
                    .orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));


            String menteeFullName = surveyResponse.getPeerReview().getMilestoneTracker().getCoachingSession().getClient().fullName();

            logger.debug("Sending invitation email to: {}", surveyResponse.getRespondentEmail());
            emailService.sendEmailWithBranding(
                surveyResponse.getRespondentEmail(),
                menteeFullName + " Has Invited You To Complete A Peer Survey",
                peerInvitation.replaceAll("<<mentee_name>>", menteeFullName)
                        .replaceAll("<<trainer_organisation>>", trainerOrganisation.getName())
                    .replaceAll("<<peer_name>>", surveyResponse.getRespondentName())
                    .replaceAll("<<survey_link>>", frontendBaseUrl + "/survey/" + surveyResponse.getId().toString()),
                    claims
            );

            logger.info("Successfully sent invitation email");
        } catch (Exception e) {
            logger.error("Error in sendInviteToPeer: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting sendInviteToPeer");
        }
    }

    public void sendPeerReviewAssignment(MilestoneTracker milestoneTracker, Claims claims) throws Exception {
        logger.info("Entering sendPeerReviewAssignment for tracker ID: {}", milestoneTracker.getId());
        try {
            logger.debug("Fetching peer review object");
            PeerReview peerReview = peerReviewRepository.findByMilestoneTracker_Id(milestoneTracker.getId())
                    .orElseThrow(() -> {
                        logger.error("Peer review not found for tracker: {}", milestoneTracker.getId());
                        return new RuntimeException("Peer Review Not Found");
                    });

            ProgramMilestone milestone = milestoneTracker.getProgramMilestone();

            String recipientEmail = milestoneTracker.getCoachingSession().getClient().getEmail();
            String recipientName = milestoneTracker.getCoachingSession().getClient().getFirstName();

            TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString((String) claims.get("organisationId")))
                    .orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

            logger.debug("Sending peer review assignment email to: {}", recipientEmail);
            emailService.sendEmailWithBranding(
                recipientEmail,
                milestone.getCoachingProgram().getTrainer().getFirstName() + " Has Assigned You A Peer Review Task",
                peerReviewAssignment
                    .replaceAll("<<mentee_name>>", recipientName)
                        .replaceAll("<<trainer_organisation>>", trainerOrganisation.getName())
                    .replaceAll("<<deadline>>", milestone.getDueDate().toString())
                    .replaceAll("<<objective>>", milestoneTracker.getProgramMilestone().getSurvey().getObjective())
                    .replaceAll("<<management_link>>", frontendBaseUrl + "/peer-review/" + peerReview.getId().toString()),
                    claims
            );

            logger.info("Successfully sent peer review assignment email");
        } catch (Exception e) {
            logger.error("Error in sendPeerReviewAssignment: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting sendPeerReviewAssignment");
        }
    }

    public void sendSurveyAssignment(MilestoneTracker milestoneTracker, Claims claims) throws Exception {
        logger.info("Entering sendSurveyAssignment for tracker ID: {}", milestoneTracker.getId());
        try {
            ProgramMilestone milestone = milestoneTracker.getProgramMilestone();
            Client client = milestoneTracker.getCoachingSession().getClient();

            logger.debug("Fetching survey object");
            SurveyResponse surveyResponse = surveyResponseRepository.findLatestBySurveyIdAndClientId(milestone.getSurvey().getId(), client.getId())
                    .orElseThrow(() -> {
                        logger.error("Survey not found for tracker: {}", milestoneTracker.getId());
                        return new RuntimeException("Survey Not Found");
                    });

            logger.debug("Sending survey assignment email to: {}", client.getEmail());
            emailService.sendEmailWithBranding(
                    client.getEmail(),
                    milestone.getCoachingProgram().getTrainer().getFirstName() + " Has Assigned You A Survey Task",
                    surveyAssignment
                            .replaceAll("<<trainer_organisation>>", milestone.getCoachingProgram().getTrainer().getTrainerOrganisation().getName())
                            .replaceAll("<<client_name>>", client.getFirstName())
                            .replaceAll("<<trainer_name>>", milestone.getCoachingProgram().getTrainer().getFirstName())
                            .replaceAll("<<objective>>", milestone.getSurvey().getObjective())
                            .replaceAll("<<due_date>>", milestone.getDueDate().toString())
                            .replaceAll("<<survey_link>>", frontendBaseUrl + "/survey/" + surveyResponse.getId()),
                    claims
            );

            logger.info("Successfully sent survey assignment email");
        } catch (Exception e) {
            logger.error("Error in sendSurveyAssignment: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting sendSurveyAssignment");
        }
    }

    public FormDto updateForm(String surveyResponseId, FormDto request) {
        logger.info("Entering updateForm - surveyResponseId: {}", surveyResponseId);
        try {
            logger.debug("Fetching survey response with ID: {}", surveyResponseId);
            SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            logger.debug("Updating form responses");
            surveyResponse.setResponses(request.getResponses());
            surveyResponse.setCompletedDateAsCurrent();
            surveyResponse.setStatus(Status.ACTIVE);
            surveyResponse.setSurveyResponseId();
            surveyResponseRepository.save(surveyResponse);

            logger.info("Successfully updated form");
            return getForm(surveyResponse.getId().toString());
        } catch (Exception e) {
            logger.error("Error in updateForm: {}", e.getMessage(), e);
            return request;
        } finally {
            logger.info("Exiting updateForm");
        }
    }

    public FormDto getForm(String surveyResponseId) {
        logger.info("Entering getForm - surveyResponseId: {}", surveyResponseId);
        try {
            logger.debug("Fetching survey response with ID: {}", surveyResponseId);
            SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> {
                    logger.error("Survey response not found with ID: {}", surveyResponseId);
                    return new ResourceNotFoundException("Invalid Id");
                });

            Client client = clientRepository.findById(UUID.fromString(surveyResponse.getClientIdentifier()))
                    .orElseThrow(() -> {
                        logger.error("Client not found with ID: {}", surveyResponse.getClientIdentifier());
                        return new ResourceNotFoundException("Invalid Id");
                    });

            logger.debug("Parsing questions and responses");
            ArrayList<ArrayList<SurveyWizardDto.QuestionItem>> questions = parseQuestions(surveyResponse.getSurvey().getTemplate().get("questions"));
            ArrayList<ArrayList<FormDto.AnswerItem>> responses = parseResponses(surveyResponse.getResponse().get("responses"));

            logger.debug("Creating response map");
            HashMap<String, FormDto.AnswerItem> responseMap = new HashMap<>();
            for(ArrayList<FormDto.AnswerItem> inner : responses) {
                for(FormDto.AnswerItem response : inner) {
                    responseMap.put(response.getQuestionId(), response);
                }
            }

            logger.debug("Building updated responses");
            ArrayList<ArrayList<FormDto.AnswerItem>> updatedResponses = new ArrayList<>();
            for(ArrayList<SurveyWizardDto.QuestionItem> inner : questions){
                ArrayList<FormDto.AnswerItem> updatedResponsesInner = new ArrayList<>();
                for(SurveyWizardDto.QuestionItem question : inner){
                    if(responseMap.containsKey(question.getId())){
                        FormDto.AnswerItem previousResponse = responseMap.get(question.getId());
                        if(previousResponse.getVersion() != question.getVersion()){
                            updatedResponsesInner.add(getResponseFromQuestionObject(question));
                        } else {
                            updatedResponsesInner.add(previousResponse);
                        }
                    } else {
                        updatedResponsesInner.add(getResponseFromQuestionObject(question));
                    }
                }
                updatedResponses.add(updatedResponsesInner);
            }

            TrainerOrganisation trainerOrganisation = client.getClientOrganisation().getTrainerOrganisation();

            logger.info("Successfully retrieved form data");
            FormDto formDto = new FormDto();
            formDto.setSurveyResponse(surveyResponse);
            formDto.setResponses(updatedResponses);
            formDto.setLogoImageUrl(trainerOrganisation.getLogoImageUrl());
            formDto.setHeaderImageUrl("/public/" + trainerOrganisation.getHeaderImageId());
            formDto.setFooterImageUrl("/public/" + trainerOrganisation.getFooterImageId());
            return formDto;
        } catch (Exception e) {
            logger.error("Error in getForm: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getForm");
        }
    }

    public FormDto.AnswerItem getResponseFromQuestionObject(SurveyWizardDto.QuestionItem questionItem){
        FormDto.AnswerItem responseItem = new FormDto.AnswerItem();
        responseItem.setQuestionId(questionItem.getId());
        responseItem.setResponseId(UUID.randomUUID().toString());
        responseItem.setIndex(questionItem.getIndex());
        responseItem.setQuestion(questionItem.getContent());
        responseItem.setOptions(questionItem.getOptions());
        responseItem.setMentees(questionItem.getMentees());
        responseItem.setType(questionItem.getType());
        responseItem.setVersion(questionItem.getVersion());
        responseItem.setEval(questionItem.getEval());
        responseItem.setRating(0);

        return responseItem;
    }

    public static ArrayList<ArrayList<SurveyWizardDto.QuestionItem>> parseQuestions(Object questionsObject){
        logger.debug("Parsing questions object");
        ObjectMapper objectMapper = new ObjectMapper();
        List<List<HashMap<String, Object>>> questions = (List<List<HashMap<String, Object>>>) questionsObject;

        ArrayList<ArrayList<SurveyWizardDto.QuestionItem>> result = new ArrayList<>();
        for (List<HashMap<String, Object>> questionList : questions) {
            ArrayList<SurveyWizardDto.QuestionItem> pojoList = new ArrayList<>();
            for (HashMap<String, Object> map : questionList) {
                SurveyWizardDto.QuestionItem pojo = objectMapper.convertValue(map, SurveyWizardDto.QuestionItem.class);
                pojoList.add(pojo);
            }
            result.add(pojoList);
        }
        return result;
    }

    public static ArrayList<ArrayList<FormDto.AnswerItem>> parseResponses(Object responsesObject){
        logger.debug("Parsing responses object");
        ObjectMapper objectMapper = new ObjectMapper();
        List<List<Map<String, Object>>> responses = (List<List<Map<String, Object>>>) responsesObject;
        logger.debug("Parsing responses object");
        ArrayList<ArrayList<FormDto.AnswerItem>> result = new ArrayList<>();
        for (List<Map<String, Object>> responseList : responses) {
            ArrayList<FormDto.AnswerItem> pojoList = new ArrayList<>();
            for (int i = 0; i<responseList.size(); i++) {
                Object object = responseList.get(i);

                if(object instanceof FormDto.AnswerItem) {
                    FormDto.AnswerItem pojo = (FormDto.AnswerItem) object;
                    pojoList.add(pojo);

                } else if (object instanceof Map<?,?>) {
                    FormDto.AnswerItem pojo = objectMapper.convertValue(object, FormDto.AnswerItem.class);
                    pojoList.add(pojo);
                }
            }
//            for (HashMap<String, Object> map : responseList) {
//                FormDto.AnswerItem pojo = objectMapper.convertValue(map, FormDto.AnswerItem.class);
//                pojoList.add(pojo);
//            }
            result.add(pojoList);
        }
        return result;
    }

    public List<FocusArea> getAllFocusAreaFlat(List<FocusArea> parentFocusAreas){
        logger.info("Entering getAllFocusAreaFlat with {} parent focus areas", parentFocusAreas != null ? parentFocusAreas.size() : 0);
        
        if (parentFocusAreas == null) {
            logger.info("No parent focus areas provided, returning empty list");
            return new ArrayList<>();
        }
        
        List<FocusArea> result = parentFocusAreas.stream()
                .filter(FocusArea::getIsParent)
                .flatMap(fa -> {
                    logger.debug("Processing parent focus area: {} (ID: {})", fa.getName(), fa.getId());
                    ArrayList<FocusArea> group = new ArrayList<>();
                    group.add(fa);
                    
                    List<FocusArea> children = focusAreaRepository.getAllByParent_Id(fa.getId());
                    logger.debug("Found {} child focus areas for parent: {}", children.size(), fa.getName());
                    
                    group.addAll(children);
                    return group.stream();
                }).collect(Collectors.toList());
        
        logger.info("Exiting getAllFocusAreaFlat - Returning {} total focus areas", result.size());
        return result;
    }

    public List<ReportView> getAllReportViewsBySurveyId(String surveyId, String templateId, Claims claims) {
        logger.info("Fetching all report views for survey ID: {}", surveyId);
        List<SurveyResponse> responses = surveyResponseRepository.findBySurvey_IdAndStatus(UUID.fromString(surveyId), Status.COMPLETED);
        logger.debug("Found {} responses for survey ID: {}", responses.size(), surveyId);

        List<ReportView> reportViews = responses.stream()
                .map(response -> {
                    Client client = response.getClient();
                    ReportView reportView = reportViewGenerator.createInstantReportView(response.getReportPages(), response.getId().toString(), response.getSurvey().getId().toString(), templateId, client.getId().toString(), client.fullName(), claims);
                    logger.debug("Generated report view for response ID: {}", response.getId());
                    return reportView;
                })
                .toList();

        logger.info("Returning {} report views for exercise ID: {}", reportViews.size(), surveyId);
        return reportViews;
    }

    public List<ReportView> getAllReportViewsBySurveyResponseId(String surveyResponseId, String templateId, Claims claims) {
        logger.info("Fetching all report views for survey response ID: {}", surveyResponseId);
        List<SurveyResponse> responses = surveyResponseRepository.findAllByIdAndStatus(UUID.fromString(surveyResponseId), Status.COMPLETED);
        logger.debug("Found {} responses for survey response ID: {}", responses.size(), surveyResponseId);

        List<ReportView> reportViews = responses.stream()
                .map(response -> {
                    Client client = response.getClient();
                    ReportView reportView = reportViewGenerator.createInstantReportView(response.getReportPages(), response.getId().toString(), surveyResponseId, templateId, client.getId().toString(), client.fullName(), claims);
                    logger.debug("Generated report view for response ID: {}", response.getId());
                    return reportView;
                })
                .toList();

        logger.info("Returning {} report views for survey response ID: {}", reportViews.size(), surveyResponseId);
        return reportViews;
    }
} 