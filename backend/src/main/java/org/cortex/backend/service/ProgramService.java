package org.cortex.backend.service;

import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import jakarta.mail.MessagingException;
import org.apache.commons.io.IOUtils;
import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.constant.Status;
import org.cortex.backend.constant.SurveyType;
import org.cortex.backend.dto.FocusAreaDto;
import org.cortex.backend.dto.MilestoneStatusDTO;
import org.cortex.backend.dto.SurveyWizardDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exception.ValidationException;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.exercises.repository.ExerciseRepository;
import org.cortex.backend.exercises.repository.ExerciseResponseRepository;
import org.cortex.backend.llm.Surveys.model.AskWizardChat;
import org.cortex.backend.llm.Surveys.repository.AskWizardChatRepository;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ProgramService {

    private static final Logger logger = LoggerFactory.getLogger(ProgramService.class);

    @Autowired
    private CoachingProgramRepository coachingProgramRepository;

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private MilestoneTrackerRepository milestoneTrackerRepository;

    @Autowired
    private FocusAreaRepository focusAreaRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private ClientOrganisationRepository clientOrganisationRepository;

    @Autowired
    private SurveyWizardService surveyWizardService;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private ExerciseResponseRepository exerciseResponseRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private PeerReviewRepository peerReviewRepository;

    @Autowired
    private AskWizardChatRepository askWizardChatRepository;

    @Autowired
    private TrainerService trainerService;

    @Autowired
    private EmailService emailService;

    @Value("classpath:email_templates/activity_assignment.html")
    private Resource activityAssignmentResource;

    @Value("${frontend-base-url}")
    private String frontendBaseUrl;

    private String activityAssignment;

    @PostConstruct
    public void init() throws IOException {
        logger.info("Entering init - Loading email templates");
        try {
            logger.debug("Reading activity assignment template");
            activityAssignment = IOUtils.toString(activityAssignmentResource.getInputStream(), StandardCharsets.UTF_8);
            logger.info("Successfully loaded all email templates");
        } catch (IOException e) {
            logger.error("Failed to initialize email templates: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting init");
        }
    }

    public List<CoachingProgram> getProgramsByTrainerOrganisation(Claims claims) {
        logger.info("Entering getProgramsByTrainerOrganisation for organisation ID: {}", (String) claims.get("organisationId"));
        try {
            if("ROLE_USER".equals(claims.get("role"))){
                logger.info("Executing for ROLE_ADMIN");
                List<CoachingProgram> programs = coachingProgramRepository.findByTrainerUserId(UUID.fromString((String) claims.get("userId"))).reversed();
                logger.info("Found {} programs for organisation", programs.size());
                return programs;

            } else if ("ROLE_ADMIN".equals(claims.get("role")) || "ROLE_MODERATOR".equals(claims.get("role"))) {
                logger.info("Executing for ROLE_USER");
                List<CoachingProgram> programs = coachingProgramRepository.findByTrainerOrganisationId(UUID.fromString((String) claims.get("organisationId"))).reversed();
                logger.info("Found {} programs for organisation", programs.size());
                return programs;
            }
        } catch (Exception e) {
            logger.error("Error in getProgramsByTrainerOrganisation: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getProgramsByTrainerOrganisation");
        }
        return new ArrayList<>();
    }

    @Transactional
    public CoachingProgram createProgram(String programId, String trainerId, String clientOrganisationId, String title, LocalDate startDate) {
        logger.info("Entering createProgram - title: {}, trainer: {}, client org: {}", title, trainerId, clientOrganisationId);
        try {
            CoachingProgram program;

            if (!(programId == null || programId.isEmpty())) {
                logger.debug("Updating existing program with ID: {}", programId);
                program = coachingProgramRepository.findById(UUID.fromString(programId))
                    .orElseThrow(() -> {
                        logger.error("Program not found with ID: {}", programId);
                        return new ResourceNotFoundException("Program", "id", programId);
                    });
            } else {
                logger.debug("Creating new program");
                program = new CoachingProgram();
                program.setStatus(Status.ACTIVE);
            }

            logger.debug("Fetching trainer with ID: {}", trainerId);
            Trainer trainer = trainerRepository.findById(UUID.fromString(trainerId))
                .orElseThrow(() -> {
                    logger.error("Trainer not found with ID: {}", trainerId);
                    return new ResourceNotFoundException("Trainer", "id", trainerId);
                });

            logger.debug("Fetching client organisation with ID: {}", clientOrganisationId);
            ClientOrganisation clientOrg = clientOrganisationRepository.findById(UUID.fromString(clientOrganisationId))
                .orElseThrow(() -> {
                    logger.error("Client organisation not found with ID: {}", clientOrganisationId);
                    return new ResourceNotFoundException("Client Organisation", "id", clientOrganisationId);
                });

            program.setTrainer(trainer);
            program.setClientOrganisation(clientOrg);
            program.setTitle(title);
            program.setStartDate(startDate);
            program.setFocusAreas(new ArrayList<>());

            program = coachingProgramRepository.save(program);
            program.setFocusAreaDtoList(getAllFocusAreaHierarchy(program.getFocusAreas()));
            logger.info("Successfully created/updated program with ID: {}", program.getId());
            return program;
        } catch (Exception e) {
            logger.error("Error in createProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createProgram");
        }
    }

    public List<Client> getClientsByProgram(String programId) {
        logger.info("Entering getClientsByProgram for program ID: {}", programId);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Program not found with ID: {}", programId);
                    return new RuntimeException("Coaching Program not found");
                });

            logger.debug("Fetching clients for program");
            List<Client> clients = coachingSessionRepository.findDistinctClientsByProgramId(program.getId());
            
            logger.debug("Fetching milestone status for {} clients", clients.size());
            clients.forEach(client -> {
                client.setMilestoneStatusList(getClientMilestones(client.getId().toString(), programId));
                client.setSessionId(coachingSessionRepository.findByClient_IdAndCoachingProgram_Id(client.getId(), program.getId()).orElseThrow(() -> new ResourceNotFoundException("Session Not Found")).getId().toString());
            });

            logger.info("Successfully retrieved {} clients", clients.size());
            return clients;
        } catch (Exception e) {
            logger.error("Error in getClientsByProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getClientsByProgram");
        }
    }

    @Transactional
    public List<MilestoneStatusDTO> getClientMilestones(String clientId, String programId) {
        logger.info("Entering getClientMilestones for client ID: {}", clientId);
        try {
            logger.debug("Fetching milestone trackers for client");
            List<MilestoneTracker> trackers = milestoneTrackerRepository.findByClientIdAndProgramId(UUID.fromString(clientId), UUID.fromString(programId));

            logger.debug("Converting {} trackers to DTOs", trackers.size());
            List<MilestoneStatusDTO> dtos = trackers.stream().map(tracker -> {
                MilestoneStatusDTO dto = new MilestoneStatusDTO();
                ProgramMilestone milestone = tracker.getProgramMilestone();

                if (milestone.getActivity() != null && milestone.getActivity().getExerciseId() != null){
                    dto.setExerciseId(milestone.getActivity().getExerciseId().toString());
                    Optional<ExerciseResponse> exerciseResponseOptional = exerciseResponseRepository.findByMilestoneTrackerId(tracker.getId());
                    if (exerciseResponseOptional.isPresent()){
                        dto.setExerciseResponseId(exerciseResponseOptional.get().getId().toString());
                        dto.setExerciseId(exerciseResponseOptional.get().getExerciseId().toString());
                    }
                }

                dto.setMilestoneId(milestone.getId());
                dto.setTitle(milestone.getTitle());
                dto.setDescription(milestone.getDescription());
                dto.setType(milestone.getType());
                dto.setIndex(milestone.getIndex());
                dto.setStartDate(milestone.getStartDate());
                dto.setDueDate(milestone.getDueDate());
                dto.setTrackerId(tracker.getId());
                dto.setTrainerNotes(tracker.getTrainerNotes());
                dto.setIsTrainerNotesVisible(tracker.getTrainerNotesIsVisible() != null ? tracker.getTrainerNotesIsVisible() : false);

                if(milestone.getType().equals(MilestoneType.SURVEY)) {
                    logger.debug("Processing survey milestone");
                    AtomicReference<Boolean> completed = new AtomicReference<>(false);
                    dto.setSurvey(milestone.getSurvey());
                    dto.setSurveyResponseList(Stream.of(
                            surveyWizardService.getLatestResponseByClient(milestone.getSurvey().getId().toString(),
                                    tracker.getCoachingSession().getClient().getId())
                    ).peek(sr -> {
//                        sr.setPeerReview(null);
                        if(sr.getStatus() == Status.COMPLETED){
                            completed.set(true);
                        }
                    }).toList());
                    if (!dto.getSurvey().getPublished()) {
                        dto.setStatus(Status.PAUSED);
                        tracker.setStatus(Status.PAUSED);
                    } else if(completed.get()){
                        dto.setStatus(Status.COMPLETED);
                        tracker.setStatus(Status.COMPLETED);
                    } else {
                        dto.setStatus(Status.ACTIVE);
                        tracker.setStatus(Status.ACTIVE);
                    }
                    milestoneTrackerRepository.save(tracker);
                }
                else if(milestone.getType().equals(MilestoneType.PEER_REVIEW)) {
                    logger.debug("Processing peer review milestone");
                    AtomicInteger successCount = new AtomicInteger();
                    dto.setSurvey(milestone.getSurvey());
                    dto.setSurveyResponseList(
                            surveyWizardService.getSurveyResponsesByMilestoneTrackerAndSurvey(
                                    tracker.getId().toString(),
                                    milestone.getSurvey().getId().toString()
                            ).stream().peek(sr -> {
//                                sr.setPeerReview(null);
                                if(sr.getStatus() == Status.COMPLETED){
                                    successCount.getAndIncrement();
                                }
                            }).toList()
                    );
                    if (!dto.getSurvey().getPublished()) {
                        dto.setStatus(Status.PAUSED);
                        tracker.setStatus(Status.PAUSED);
                    } else if(successCount.get() >= dto.getSurvey().getPeerReviewCount()){
                        dto.setStatus(Status.COMPLETED);
                        tracker.setStatus(Status.COMPLETED);
                    } else {
                        dto.setStatus(Status.ACTIVE);
                        tracker.setStatus(Status.ACTIVE);
                    }
                    milestoneTrackerRepository.save(tracker);
                } else if(milestone.getType().equals(MilestoneType.ACTIVITY)) {
                    logger.debug("Processing activity milestone");
                    dto.setActivity(milestone.getActivity());
                    dto.setStatus(milestone.getStatus());
                }

                return dto;
            }).collect(Collectors.toList());

            logger.info("Successfully retrieved {} milestone statuses", dtos.size());
            return dtos;
        } catch (Exception e) {
            logger.error("Error in getClientMilestones: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getClientMilestones");
        }
    }

    public CoachingProgram getProgram(String programId) {
        logger.info("Entering getProgram for ID: {}", programId);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Program not found with ID: {}", programId);
                    return new ResourceNotFoundException("Coaching Program", "id", programId);
                });

            program.setTrainerResponseDTO(trainerService.getTrainerResponseDto(program.getTrainer()));
            program.setFocusAreaDtoList(getAllFocusAreaHierarchy(program.getFocusAreas()));
            logger.info("Successfully retrieved program");
            return program;
        } catch (Exception e) {
            logger.error("Error in getProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getProgram");
        }
    }

    public CoachingProgram updateProgram(String programId, String description, Status status) {
        logger.info("Entering updateProgram for ID: {} with status: {}", programId, status);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Program not found with ID: {}", programId);
                    return new ResourceNotFoundException("Coaching Program", "id", programId);
                });

            program.setDescription(description);
            program.setStatus(status);

            if(program.getStatus() != Status.COMPLETED && status == Status.COMPLETED) {
                logger.debug("Setting end date for completed program");
                program.setEndDate(LocalDate.now());
            }

            program = coachingProgramRepository.save(program);
            program.setFocusAreaDtoList(getAllFocusAreaHierarchy(program.getFocusAreas()));
            logger.info("Successfully updated program with ID: {}", program.getId());
            return program;
        } catch (Exception e) {
            logger.error("Error in updateProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateProgram");
        }
    }

    public CoachingProgram updateProgramCalendlyEventType(String programId, String calendlyEventType, String calendlyEventTypeSchedulingUrl) {
        logger.info("Entering updateProgram for ID: {} with Calendly Event Type: {}", programId, calendlyEventType);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                    .orElseThrow(() -> {
                        logger.error("Program not found with ID: {}", programId);
                        return new ResourceNotFoundException("Coaching Program", "id", programId);
                    });

            program.setCalendlyEventType(calendlyEventType);
            program.setCalendlyEventTypeSchedulingUrl(calendlyEventTypeSchedulingUrl);
            program = coachingProgramRepository.save(program);
            program.setFocusAreaDtoList(getAllFocusAreaHierarchy(program.getFocusAreas()));
            logger.info("Successfully updated program with ID: {}", program.getId());
            return program;
        } catch (Exception e) {
            logger.error("Error in updateProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateProgram");
        }
    }

    public List<FocusAreaDto> updateProgramFocusAreas(String programId, List<UUID> focusAreaIds) {
        logger.info("Entering updateProgramFocusAreas for ID: {}", programId);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                    .orElseThrow(() -> {
                        logger.error("Program not found with ID: {}", programId);
                        return new ResourceNotFoundException("Coaching Program", "id", programId);
                    });

            logger.debug("Fetching and validating focus areas");
            List<FocusArea> focusAreas = focusAreaRepository.findAllById(focusAreaIds);
            if (focusAreas.size() != focusAreaIds.size()) {
                logger.error("One or more focus areas not found from IDs: {}", focusAreaIds);
                throw new ResourceNotFoundException("One or more focus areas not found");
            }

            focusAreas.removeIf(fa -> !fa.getIsParent());

            program.setFocusAreas(focusAreas);
            program = coachingProgramRepository.save(program);

            logger.info("Successfully updated program focus areas with ID: {}", program.getId());
            return getAllFocusAreaHierarchy(program.getFocusAreas());
        } catch (Exception e) {
            logger.error("Error in updateProgramFocusAreas: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateProgramFocusAreas");
        }
    }

    @Transactional
    public List<FocusAreaDto> deleteFocusArea(String areaId){

        logger.info("Inside deleteFocusArea for Id : {} ", areaId);
        if(areaId == null || areaId.isEmpty()) throw new ValidationException("Focus Area Id Is Empty");
        try {
            FocusArea focusArea = focusAreaRepository.findById(UUID.fromString(areaId))
                    .orElseThrow(() -> {
                        logger.error("Focus Area not found with ID: {}", areaId);
                        return new ResourceNotFoundException("Focus Area", "id", areaId);
                    });
            UUID coachingProgramId = focusArea.getCoachingProgram().getId();

            List<FocusArea> toBeRemoved = new ArrayList<>(List.of(focusArea));

            if(focusArea.getIsParent()){
                List<FocusArea> children = focusAreaRepository.getAllByParent_Id(focusArea.getId());
                toBeRemoved.addAll(children);
            }

            Set<String> toBeRemovedIds = toBeRemoved.stream()
                    .map(fa -> fa.getId().toString())
                    .collect(Collectors.toSet());

            removeFocusAreasFromProgram(coachingProgramId, toBeRemovedIds);
            removeFocusAreasFromProgramMilestone(coachingProgramId, toBeRemovedIds);

            toBeRemoved = toBeRemoved.stream().map(fa -> {
                fa.setCoachingProgram(null);
                fa.setParent(null);
                return fa;
            }).collect(Collectors.toList());

            focusAreaRepository.saveAll(toBeRemoved);

            return getAllFocusAreasForProgramId(coachingProgramId.toString());

        } catch (Exception e) {
            logger.error("Error in deleteFocusArea: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting deleteFocusArea");
        }
    }

    public void removeFocusAreasFromProgramMilestone(UUID programId, Set<String> toBeRemovedIds) {

        List<ProgramMilestone> milestones = programMilestoneRepository.findAllByCoachingProgramId(programId);
        milestones = milestones.stream().map(ml -> {
            ml.getFocusAreas().removeIf(fa -> toBeRemovedIds.contains(fa.getId().toString()));
            return ml;
        }).toList();
        programMilestoneRepository.saveAll(milestones);
    }

    public void removeFocusAreasFromProgram(UUID programId, Set<String> toBeRemovedIds) {

        CoachingProgram program = coachingProgramRepository.findById(programId)
                .orElseThrow(() -> {
                    logger.error("Program not found with ID: {}", programId);
                    return new ResourceNotFoundException("Coaching Program", "id", programId);
                });
        program.getFocusAreas().removeIf(fa -> toBeRemovedIds.contains(fa.getId().toString()));
        coachingProgramRepository.save(program);
    }

    @Transactional
    public List<FocusAreaDto> createFocusArea(String id, String parentId, String name, String objective, String description, String criteria, String programId) {
        logger.info("Entering createFocusArea - name: {}", name);
        try {
            FocusArea focusArea;
            FocusArea.Eval eval = new FocusArea.Eval();
            eval.setMaxScore(10.0);
            eval.setMinScore(0.0);
            eval.setThreshold1(2.0);
            eval.setThreshold2(6.0);
            eval.setThreshold3(8.0);

            if(id == null || id.isEmpty()) {
                logger.debug("Creating new focus area");
                focusArea = new FocusArea();
                CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId)).orElseThrow(() -> new RuntimeException("Program Not Found"));
                focusArea.setCoachingProgram(coachingProgram);
                focusArea.setEval(eval);

                if(!(parentId == null || parentId.isEmpty())) {
                    logger.debug("Fetching parent focus area by Id : {}", parentId);
                    FocusArea parent = focusAreaRepository.findById(UUID.fromString(parentId)).orElseThrow(() -> new RuntimeException("Parent Focus Area Not Found"));
                    focusArea.setIsParent(false);
                    focusArea.setParent(parent);

                } else {
                    focusArea.setIsParent(true);
                    coachingProgram.getFocusAreas().add(focusArea);
                }
                focusArea.setName(name);
                focusArea = focusAreaRepository.save(focusArea);
                coachingProgramRepository.save(coachingProgram);
                logger.info("Successfully created focus area with ID: {}", focusArea.getId());
                return getAllFocusAreasForProgramId(coachingProgram.getId().toString());

            } else {
                logger.debug("Fetching focus area by Id : {}", id);
                focusArea = focusAreaRepository.findById(UUID.fromString(id)).orElseThrow(() -> new RuntimeException("Focus Area Not Found"));
            }

            focusArea.setName(name);
            focusArea.setDescription(description);
            focusArea.setObjective(objective);
            focusArea.setCriteria(criteria);

            focusArea = focusAreaRepository.save(focusArea);
            logger.info("Successfully updated focus area with ID: {}", focusArea.getId());
            return getAllFocusAreasForProgramId(focusArea.getCoachingProgram().getId().toString());
        } catch (Exception e) {
            logger.error("Error in createFocusArea: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createFocusArea");
        }
    }

    @Transactional
    public List<FocusAreaDto> updateFocusAreaEval(String id, FocusArea.Eval eval) {
        logger.info("Entering updateFocusAreaEval - id: {}", id);
        try {
            if (eval == null){
                eval = new FocusArea.Eval();
                eval.setMaxScore(10.0);
                eval.setMinScore(0.0);
                eval.setThreshold1(2.0);
                eval.setThreshold2(6.0);
                eval.setThreshold3(8.0);
            }

            logger.debug("Fetching focus area by Id : {}", id);
            FocusArea focusArea = focusAreaRepository.findById(UUID.fromString(id)).orElseThrow(() -> new RuntimeException("Focus Area Not Found"));
            focusArea.setEval(eval);

            focusArea = focusAreaRepository.save(focusArea);
            logger.info("Successfully updated focus area with ID: {}", focusArea.getId());
            return getAllFocusAreasForProgramId(focusArea.getCoachingProgram().getId().toString());
        } catch (Exception e) {
            logger.error("Error in createFocusArea: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createFocusArea");
        }
    }

    public List<FocusArea> getAllFocusAreas() {
        logger.info("Entering getAllFocusAreas");
        try {
            List<FocusArea> areas = focusAreaRepository.findAll();
            logger.info("Successfully retrieved {} focus areas", areas.size());
            return areas;
        } catch (Exception e) {
            logger.error("Error in getAllFocusAreas: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getAllFocusAreas");
        }
    }

    public List<FocusAreaDto> getAllFocusAreasForProgramId(String programId) {
        logger.info("Entering getAllFocusAreasForProgramId for program: {}", programId);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                    .orElseThrow(() -> {
                        logger.error("Program not found with ID: {}", programId);
                        return new RuntimeException("Coaching Program not found");
                    });

            List<FocusArea> areas = focusAreaRepository.getAllByCoachingProgram_Id(program.getId());
            logger.info("Successfully retrieved {} focus areas", areas.size());
            return getAllFocusAreaHierarchy(areas);
        } catch (Exception e) {
            logger.error("Error in getAllFocusAreasForProgramId: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getAllFocusAreasForProgramId");
        }
    }

    public List<FocusAreaDto> getAllFocusAreasBySurveyResponseId(String surveyResponseId) {
        logger.info("Entering getAllFocusAreasBySurveyResponseId for program: {}", surveyResponseId);
        try {
            logger.debug("Fetching program with Survey Response ID: {}", surveyResponseId);
            CoachingProgram program = coachingProgramRepository.findBySurveyResponseId(UUID.fromString(surveyResponseId))
                    .orElseThrow(() -> {
                        logger.error("Program not found with Survey Response ID: {}", surveyResponseId);
                        return new RuntimeException("Coaching Program not found");
                    });

            List<FocusArea> areas = focusAreaRepository.getAllByCoachingProgram_Id(program.getId());
            logger.info("Successfully retrieved {} focus areas", areas.size());
            return getAllFocusAreaHierarchy(areas);
        } catch (Exception e) {
            logger.error("Error in getAllFocusAreasForProgramId: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getAllFocusAreasForProgramId");
        }
    }

    public List<SurveyWizardDto.FocusArea> getAllFocusAreasForProgramIdForSelection(String programId) {

        logger.debug("Fetching program with ID: {}", programId);
        CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Program not found with ID: {}", programId);
                    return new RuntimeException("Coaching Program not found");
                });

        List<FocusArea> focusAreaList = focusAreaRepository.getAllByCoachingProgram_Id(program.getId());

        logger.info("Setting focus areas with {} input items", focusAreaList != null ? focusAreaList.size() : 0);

        List<SurveyWizardDto.FocusArea> focusAreas = new ArrayList<>();

        if (focusAreaList == null || focusAreaList.isEmpty()) {
            logger.info("Focus area list is null or empty, setting empty list");
            return new ArrayList<>();
        }

        focusAreas = focusAreaList.stream()
                .map(fa -> {
                    boolean isParent = fa.getIsParent() != null && fa.getIsParent();
                    String name;

                    if (isParent) {
                        name = fa.getName();
                        logger.debug("Processing parent focus area: {} (ID: {})", name, fa.getId());
                    } else {
                        String parentName = fa.getParent() != null ? fa.getParent().getName() : "Unknown Parent";
                        name = parentName + " - " + fa.getName();
                        logger.debug("Processing child focus area: {} (ID: {}), parent: {}",
                                fa.getName(), fa.getId(), parentName);
                    }

                    return new SurveyWizardDto.FocusArea(fa.getId().toString(), name);
                })
                .toList();

        logger.info("Finished setting focus areas, transformed {} items", focusAreas.size());
        return focusAreas;
    }

    public List<FocusAreaDto> getAllFocusAreaHierarchy(List<FocusArea> parentFocusAreas){
        if (parentFocusAreas == null) return new ArrayList<>();
        return parentFocusAreas.stream()
            .filter(FocusArea::getIsParent)
            .map(fa -> {
                FocusAreaDto focusAreaDto = FocusAreaDto.convertFocusArea(fa);
                focusAreaDto.setChildren(focusAreaRepository.getAllByParent_Id(fa.getId()).stream().map(FocusAreaDto::convertFocusArea).toList());
                return focusAreaDto;
        }).toList();
    }

    public List<FocusArea> getAllFocusAreaFlat(List<FocusArea> parentFocusAreas){
        if (parentFocusAreas == null) return new ArrayList<>();
        return parentFocusAreas.stream()
                .filter(FocusArea::getIsParent)
                .flatMap(fa -> {
                    ArrayList<FocusArea> group = new ArrayList<>();
                    group.add(fa);
                    group.addAll(focusAreaRepository.getAllByParent_Id(fa.getId()));
                    return group.stream();
                }).toList();
    }

    @Transactional
    public MilestoneTracker updateTrainerNotes(String trackerId, String trainerNotes, Boolean isVisible) {
        logger.info("Entering updateTrainerNotes for tracker: {}", trackerId);
        try {
            logger.debug("Fetching milestone tracker with ID: {}", trackerId);
            MilestoneTracker tracker = milestoneTrackerRepository.findById(UUID.fromString(trackerId))
                .orElseThrow(() -> {
                    logger.error("Milestone tracker not found with ID: {}", trackerId);
                    return new RuntimeException("Milestone Tracker not found");
                });
                
            tracker.setTrainerNotes(trainerNotes);
            tracker.setTrainerNotesIsVisible(isVisible != null ? isVisible : false);
            tracker = milestoneTrackerRepository.save(tracker);
            
            logger.info("Successfully updated trainer notes for tracker: {}", tracker.getId());
            return tracker;
        } catch (Exception e) {
            logger.error("Error in updateTrainerNotes: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateTrainerNotes");
        }
    }

    @Transactional
    public ProgramMilestone createMilestone(String programId, String typeString, String title) {
        logger.info("Entering createMilestone - program: {}, type: {}, title: {}", programId, typeString, title);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Coaching program not found with ID: {}", programId);
                    return new RuntimeException("Coaching Program not found");
                });

            logger.debug("Calculating maximum index for program's milestones");
            Integer maxIndex = programMilestoneRepository.findAll().stream()
                .filter(m -> m.getCoachingProgram().getId().equals(program.getId()))
                .map(ProgramMilestone::getIndex)
                .max(Integer::compareTo)
                .orElse(0);

            MilestoneType type = MilestoneType.valueOf(typeString);

            logger.debug("Creating new program milestone of type: {}", type);
            ProgramMilestone milestone = new ProgramMilestone();
            milestone.setCoachingProgram(program);
            milestone.setType(type);
            milestone.setTitle(title);
            milestone.setIndex(maxIndex + 1);

            switch (type) {
                case ACTIVITY:
                    logger.debug("Creating activity for milestone");
                    Activity activity = new Activity();
                    activity = activityRepository.save(activity);
                    milestone.setActivity(activity);
                    break;

                case SURVEY:
                    logger.debug("Creating survey for milestone");
                    Survey survey = new Survey();
                    survey.setTitle(title);
                    survey.setType(SurveyType.ASSESSMENT);
                    AskWizardChat askWizardChat = new AskWizardChat();
                    survey.setAskWizardChat(askWizardChatRepository.save(askWizardChat));
                    survey = surveyRepository.save(survey);
                    milestone.setSurvey(survey);
                    break;

                case PEER_REVIEW:
                    logger.debug("Creating peer review survey for milestone");
                    Survey peerSurvey = new Survey();
                    peerSurvey.setType(SurveyType.PEER_REVIEW);
                    peerSurvey.setTitle(title);
                    AskWizardChat askWizardChatPR = new AskWizardChat();
                    peerSurvey.setAskWizardChat(askWizardChatRepository.save(askWizardChatPR));
                    peerSurvey = surveyRepository.save(peerSurvey);
                    milestone.setSurvey(peerSurvey);
                    break;
            }

            logger.debug("Saving milestone");
            final ProgramMilestone savedMilestone = programMilestoneRepository.save(milestone);

            logger.debug("Creating milestone trackers for each session");
            List<CoachingSession> sessions = coachingSessionRepository.findAll().stream()
                .filter(s -> s.getCoachingProgram().getId().equals(program.getId()))
                .toList();

            List<MilestoneTracker> trackers = sessions.stream().map(session -> {
                MilestoneTracker tracker = new MilestoneTracker();
                tracker.setProgramMilestone(savedMilestone);
                tracker.setCoachingSession(session);
                tracker.setStatus(Status.ACTIVE);
                return milestoneTrackerRepository.save(tracker);
            }).toList();

            if (type == MilestoneType.PEER_REVIEW) {
                logger.debug("Creating peer reviews for each tracker");
                trackers.forEach(tracker -> {
                    PeerReview peerReview = new PeerReview();
                    peerReview.setMilestoneTracker(tracker);
                    peerReview.setSurvey(savedMilestone.getSurvey());
                    peerReviewRepository.save(peerReview);
                });
            }

            if (type == MilestoneType.SURVEY) {
                logger.debug("Creating survey responses for each tracker");
                trackers.forEach(tracker -> {
                    SurveyResponse surveyResponse = new SurveyResponse();
                    surveyResponse.setSurvey(savedMilestone.getSurvey());
                    Client client = tracker.getCoachingSession().getClient();
                    surveyResponse.setClient(client);
                    surveyResponse.setRespondentEmail(client.getEmail());
                    surveyResponse.setRespondentDesignation(client.getDesignation());
                    surveyResponse.setRespondentName(client.fullName());
                    surveyResponse.setClientIdentifier(client.getId().toString());
                    surveyResponse.setStatus(Status.PAUSED);
                    surveyResponseRepository.save(surveyResponse);
                });
            }

            logger.info("Successfully created milestone with ID: {}", savedMilestone.getId());
            savedMilestone.setFocusAreaDtoList(getAllFocusAreaHierarchy(savedMilestone.getFocusAreas()));
            return savedMilestone;
        } catch (Exception e) {
            logger.error("Error in createMilestone: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createMilestone");
        }
    }

    public MilestoneTracker createMilestoneTrackerForClient(ProgramMilestone milestone, CoachingSession session) {
        logger.info("Entering createMilestoneTracker for milestone: {} and session: {}", milestone.getId(), session.getId());
        try {
            MilestoneTracker tracker = new MilestoneTracker();
            tracker.setProgramMilestone(milestone);
            tracker.setCoachingSession(session);
            tracker.setStatus(Status.ACTIVE);
            tracker = milestoneTrackerRepository.save(tracker);

            if (milestone.getType() == MilestoneType.PEER_REVIEW) {
                logger.debug("Creating peer review for tracker");
                PeerReview peerReview = new PeerReview();
                peerReview.setMilestoneTracker(tracker);
                peerReview.setSurvey(milestone.getSurvey());
                peerReviewRepository.save(peerReview);
            }

            if (milestone.getType() == MilestoneType.SURVEY) {
                logger.debug("Creating survey response for tracker");
                SurveyResponse surveyResponse = new SurveyResponse();
                surveyResponse.setSurvey(milestone.getSurvey());
                Client client = session.getClient();
                surveyResponse.setClient(client);
                surveyResponse.setRespondentEmail(client.getEmail());
                surveyResponse.setRespondentDesignation(client.getDesignation());
                surveyResponse.setRespondentName(client.fullName());
                surveyResponse.setClientIdentifier(client.getId().toString());
                surveyResponse.setStatus(Status.PAUSED);
                surveyResponseRepository.save(surveyResponse);
            }

            logger.info("Successfully created milestone tracker with ID: {}", tracker.getId());
            return tracker;
        } catch (Exception e) {
            logger.error("Error in createMilestoneTracker: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting createMilestoneTracker");
        }
    }

    @Transactional
    public List<ProgramMilestone> updateMilestoneStatus(String milestoneId, Status status, Claims claims) {
        logger.info("Entering updateMilestoneStatus - milestone: {}, status: {}", milestoneId, status);
        try {
            logger.debug("Fetching milestone with ID: {}", milestoneId);
            ProgramMilestone milestone = programMilestoneRepository.findById(UUID.fromString(milestoneId))
                .orElseThrow(() -> {
                    logger.error("Program milestone not found with ID: {}", milestoneId);
                    return new ResourceNotFoundException("Program Milestone", "id", milestoneId);
                });
            
            if (status == null) {
                logger.error("Status cannot be null");
                throw new ValidationException("Status cannot be null");
            }

            Survey survey = milestone.getSurvey();
            if(survey != null) {
                logger.debug("Updating survey status");
                if (status == Status.ACTIVE) {
                    logger.debug("Updating survey to published status");
                    surveyWizardService.publishSurvey(survey.getId().toString(), true, null, claims);
                } else {
                    survey.setPublished(false);
                    surveyRepository.save(survey);
                    milestone.setStatus(status);
                    programMilestoneRepository.save(milestone);
                }
            } else if(milestone.getActivity() != null) {
                milestone.setStatus(status);
                programMilestoneRepository.save(milestone);
                sendActivityAssignment(milestone, claims);
            }
            
            logger.info("Successfully updated milestone status");
            return getMilestonesByProgram(milestone.getCoachingProgram().getId().toString());
        } catch (Exception e) {
            logger.error("Error in updateMilestoneStatus: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        } finally {
            logger.info("Exiting updateMilestoneStatus");
        }
    }

    public void sendActivityAssignment(ProgramMilestone milestone, Claims claims) throws Exception {
        List<MilestoneTracker> milestoneTrackers = milestoneTrackerRepository.findByProgramMilestone(milestone);
        for(MilestoneTracker tracker : milestoneTrackers) {
            if(milestone.getType() == MilestoneType.ACTIVITY) {
                Client client = tracker.getCoachingSession().getClient();
                logger.debug("Sending activity assignment email to: {}", client.getEmail());
                emailService.sendEmailWithBranding(
                        client.getEmail(),
                        milestone.getCoachingProgram().getTrainer().getFirstName() + " Has Started An Activity Task",
                        activityAssignment
                                .replaceAll("<<trainer_organisation>>", milestone.getCoachingProgram().getTrainer().getTrainerOrganisation().getName())
                                .replaceAll("<<client_name>>", client.getFirstName())
                                .replaceAll("<<trainer_name>>", milestone.getCoachingProgram().getTrainer().getFirstName())
                                .replaceAll("<<activity_name>>", (milestone.getActivity().getName() == null ? "" : milestone.getActivity().getName()))
                                .replaceAll("<<activity_outline>>", (milestone.getActivity().getDescription() == null ? "" : milestone.getActivity().getDescription())),
                        claims
                );

                logger.info("Successfully sent activity assignment email");
            }
        }
    }

    @Transactional
    public ProgramMilestone updateMilestoneDetails(
            String milestoneId,
            String title,
            LocalDate startDate,
            LocalDate dueDate,
            String description,
            List<String> focusAreaIds
    ) {
        logger.info("Entering updateMilestoneDetails for milestone: {}", milestoneId);
        try {
            logger.debug("Fetching milestone with ID: {}", milestoneId);
            ProgramMilestone milestone = programMilestoneRepository.findById(UUID.fromString(milestoneId))
                .orElseThrow(() -> {
                    logger.error("Program milestone not found with ID: {}", milestoneId);
                    return new ResourceNotFoundException("Program Milestone", "id", milestoneId);
                });

            if (startDate != null && dueDate != null && startDate.isAfter(dueDate)) {
                logger.error("Start date {} cannot be after due date {}", startDate, dueDate);
                throw new ValidationException("Start date cannot be after due date");
            }

            logger.debug("Updating milestone details");
            if (title != null) milestone.setTitle(title);
            if (startDate != null) milestone.setStartDate(startDate);
            if (dueDate != null) milestone.setDueDate(dueDate);
            if (description != null) milestone.setDescription(description);

            if (focusAreaIds != null && !focusAreaIds.isEmpty()) {
                logger.debug("Updating focus areas for milestone");
                List<FocusArea> focusAreas = focusAreaRepository.findAllById(
                    focusAreaIds.stream()
                        .map(UUID::fromString)
                        .toList()
                );

                if (focusAreas.size() != focusAreaIds.size()) {
                    logger.error("One or more focus areas not found from IDs: {}", focusAreaIds);
                    throw new ResourceNotFoundException("One or more focus areas not found");
                }

                milestone.setFocusAreas(focusAreas);
            }

            Survey survey = milestone.getSurvey();
            if(survey != null) {
                logger.debug("Updating associated survey dates");
                if(startDate != null) survey.setStartDate(startDate);
                if(dueDate != null) survey.setDueDate(dueDate);
                surveyRepository.save(survey);
            }

            milestone = programMilestoneRepository.save(milestone);
            logger.info("Successfully updated milestone details");
            milestone.setFocusAreaDtoList(getAllFocusAreaHierarchy(milestone.getFocusAreas()));
            return milestone;
        } catch (Exception e) {
            logger.error("Error in updateMilestoneDetails: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateMilestoneDetails");
        }
    }

    public List<ProgramMilestone> resetMilestonesByProgram(String programId) {
        logger.info("Entering resetMilestonesByProgram for program: {}", programId);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Coaching program not found with ID: {}", programId);
                    return new RuntimeException("Coaching Program not found");
                });

            logger.debug("Finding active milestones for program");
            List<ProgramMilestone> milestones = programMilestoneRepository.findAll().stream()
                .filter(m -> m.getCoachingProgram().getId().equals(program.getId()))
                .filter(m -> m.getStatus() != null && m.getStatus() != Status.SUSPENDED)
                .toList();

            logger.debug("Resetting status for {} milestones", milestones.size());
            for(ProgramMilestone milestone : milestones) {
                milestone.setStatus(Status.valueOf("PAUSED"));
            }

            List<ProgramMilestone> updatedMilestones = programMilestoneRepository.saveAll(milestones).stream()
                    .peek(ml -> {
                        ml.setFocusAreaDtoList(getAllFocusAreaHierarchy(ml.getFocusAreas()));
                    })
                .sorted(Comparator.comparing(ProgramMilestone::getIndex))
                .toList();
                
            logger.info("Successfully reset {} milestones", updatedMilestones.size());
            return updatedMilestones;
        } catch (Exception e) {
            logger.error("Error in resetMilestonesByProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting resetMilestonesByProgram");
        }
    }

    public List<ProgramMilestone> getMilestonesByProgram(String programId) {
        logger.info("Entering getMilestonesByProgram for program: {}", programId);
        try {
            logger.debug("Fetching program with ID: {}", programId);
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> {
                    logger.error("Coaching program not found with ID: {}", programId);
                    return new RuntimeException("Coaching Program not found");
                });

            List<ProgramMilestone> milestones = programMilestoneRepository.findAll().stream()
                .filter(m -> m.getCoachingProgram().getId().equals(program.getId()))
                .filter(m -> m.getStatus() != null && m.getStatus() != Status.SUSPENDED)
                    .peek(m -> {
                        if (m.getSurvey() != null) {
                            m.setSurvey(surveyWizardService.populateSurveyStats(m.getSurvey()));
                        }
                        m.setFocusAreaDtoList(getAllFocusAreaHierarchy(m.getFocusAreas()));
                    })
                .sorted((m1, m2) -> m1.getIndex().compareTo(m2.getIndex()))
                .toList();
                
            logger.info("Successfully retrieved {} milestones", milestones.size());
            return milestones;
        } catch (Exception e) {
            logger.error("Error in getMilestonesByProgram: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting getMilestonesByProgram");
        }
    }

    @Transactional
    public Activity updateActivity(
        String activityId,
        String name,
        String notes,
        String description,
        List<Activity.ActivityFile> activityFiles
    ) {
        logger.info("Entering updateActivity for activity: {}", activityId);
        try {
            logger.debug("Fetching activity with ID: {}", activityId);
            Activity activity = activityRepository.findById(UUID.fromString(activityId))
                .orElseThrow(() -> {
                    logger.error("Activity not found with ID: {}", activityId);
                    return new ResourceNotFoundException("Activity", "id", activityId);
                });

            logger.debug("Updating activity details");
            if (name != null) activity.setName(name);
            if (notes != null) activity.setNotes(notes);
            if (description != null) activity.setDescription(description);
            if (activityFiles != null) activity.setFiles(activityFiles);

            activity = activityRepository.save(activity);
            logger.info("Successfully updated activity");
            return activity;
        } catch (Exception e) {
            logger.error("Error in updateActivity: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting updateActivity");
        }
    }

    public List<MilestoneTracker.MilestoneDropDownView> getActivityTrackerList(String coachingSessionId) {
        logger.info("Entering getActivityTrackerList");

        List<MilestoneTracker> trackers = milestoneTrackerRepository.findAllByCoachingSession_IdAndProgramMilestone_TypeOrderByProgramMilestone_IndexDesc(UUID.fromString(coachingSessionId), MilestoneType.ACTIVITY);
        logger.debug("Found {} milestone trackers", trackers.size());

        List<MilestoneTracker.MilestoneDropDownView> dropDownViews = trackers.stream()
                .map(MilestoneTracker.MilestoneDropDownView::new)
                .toList();

        logger.info("Successfully created dropdown views for {} trackers", dropDownViews.size());
        return dropDownViews;
    }
} 