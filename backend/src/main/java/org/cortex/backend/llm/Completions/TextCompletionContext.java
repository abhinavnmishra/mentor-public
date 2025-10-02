package org.cortex.backend.llm.Completions;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.Getter;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.llm.utilities.ContextEngine;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class TextCompletionContext {

    @Value("classpath:Prompt/AboutTheTool.txt")
    private Resource aboutToolResource;

    @Value("classpath:Prompt/completion_contexts.json")
    private Resource completionContextsResource;

    private String aboutToolContent = "";
    private Map<String, CompletionContext> completionContexts = new HashMap<>();

    @Data
    static class CompletionContext {
        private String model;
        private String key;
        private String systemMessage;
        private String action;
    }

    @Data
    static class CompletionContextsWrapper {
        private List<CompletionContext> contexts;
    }

    @PostConstruct
    public void init() throws IOException {
        // Load about tool content
        try (Reader reader = new InputStreamReader(aboutToolResource.getInputStream(), StandardCharsets.UTF_8)) {
            aboutToolContent = FileCopyUtils.copyToString(reader);
        }

        // Load completion contexts from JSON
        try (Reader reader = new InputStreamReader(completionContextsResource.getInputStream(), StandardCharsets.UTF_8)) {
            String jsonContent = FileCopyUtils.copyToString(reader);
            ObjectMapper mapper = new ObjectMapper();
            CompletionContextsWrapper wrapper = mapper.readValue(jsonContent, CompletionContextsWrapper.class);
            
            // Convert list to map for easy lookup
            wrapper.getContexts().forEach(context -> completionContexts.put(context.getKey(), context));
        }
    }

    @Autowired
    private ContextEngine contextEngine;

    @Autowired
    private CoachingProgramRepository coachingProgramRepository;

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private FocusAreaRepository focusAreaRepository;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private SurveyRepository surveyRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private MilestoneTrackerRepository milestoneTrackerRepository;

    @Autowired
    private PeerReviewRepository peerReviewRepository;

    public List<String> programDescriptionContext(String programId) {
        CompletionContext context = completionContexts.get("program_description");
        
        CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId))
            .orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(coachingProgram.getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(coachingProgram.getId().toString()));
        contextList.add(contextEngine.getAllFocusAreasByProgramContext(coachingProgram.getId().toString()));
        contextList.add(contextEngine.getAllMilestonesByProgramContext(coachingProgram.getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> focusAreaObjectiveContext(String focusAreaId) {
        CompletionContext context = completionContexts.get("focus_area_objective");

        FocusArea focusArea = focusAreaRepository.findById(UUID.fromString(focusAreaId))
            .orElseThrow(() -> new ResourceNotFoundException("Focus Area Not Found"));

        CoachingProgram program = focusArea.getCoachingProgram();

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getProgramContext(program.getId().toString()));
        contextList.add(contextEngine.getFocusAreaContext(focusArea.getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> focusAreaDescriptionContext(String focusAreaId) {
        CompletionContext context = completionContexts.get("focus_area_description");

        FocusArea focusArea = focusAreaRepository.findById(UUID.fromString(focusAreaId))
            .orElseThrow(() -> new ResourceNotFoundException("Focus Area Not Found"));

        CoachingProgram program = focusArea.getCoachingProgram();

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getProgramContext(program.getId().toString()));
        contextList.add(contextEngine.getFocusAreaContext(focusArea.getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> focusAreaCriteriaContext(String focusAreaId) {
        CompletionContext context = completionContexts.get("focus_area_criteria");

        FocusArea focusArea = focusAreaRepository.findById(UUID.fromString(focusAreaId))
                .orElseThrow(() -> new ResourceNotFoundException("Focus Area Not Found"));

        CoachingProgram program = focusArea.getCoachingProgram();

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getProgramContext(program.getId().toString()));
        contextList.add(contextEngine.getFocusAreaContext(focusArea.getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerNotesOnClientSurveyContext(String milestoneTrackerId) {
        CompletionContext context = completionContexts.get("trainer_notes_client_survey");

        MilestoneTracker milestoneTracker = milestoneTrackerRepository.findById(UUID.fromString(milestoneTrackerId))
            .orElseThrow(() -> new ResourceNotFoundException("Milestone Tracker Not Found"));
        ProgramMilestone milestone = milestoneTracker.getProgramMilestone();
        Survey survey = milestone.getSurvey();
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(milestone.getCoachingProgram().getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getClientContext(milestoneTracker.getCoachingSession().getClient().getId().toString()));
        contextList.add(contextEngine.getSurveyContext(survey.getId().toString()));
        Optional<SurveyResponse> surveyResponse = surveyResponseRepository.findLatestBySurveyIdAndClientId(survey.getId(), milestoneTracker.getCoachingSession().getClient().getId());
        surveyResponse.ifPresent(response -> contextList.add(contextEngine.getSurveyResponseSummaryContext(response.getId().toString())));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerNotesOnClientActivityContext(String milestoneTrackerId) {
        CompletionContext context = completionContexts.get("trainer_notes_client_activity");

        MilestoneTracker tracker = milestoneTrackerRepository.findById(UUID.fromString(milestoneTrackerId))
            .orElseThrow(() -> new ResourceNotFoundException("Milestone Tracker Not Found"));
        ProgramMilestone milestone = tracker.getProgramMilestone();
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(milestone.getCoachingProgram().getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getClientContext(tracker.getCoachingSession().getClient().getId().toString()));
        contextList.add(contextEngine.getActivityContext(milestone.getActivity().getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerNotesOnClientPeerReviewContext(String milestoneTrackerId) {
        CompletionContext context = completionContexts.get("trainer_notes_client_peer_review");

        MilestoneTracker tracker = milestoneTrackerRepository.findById(UUID.fromString(milestoneTrackerId))
            .orElseThrow(() -> new ResourceNotFoundException("Milestone Tracker Not Found"));
        ProgramMilestone milestone = tracker.getProgramMilestone();
        Survey survey = milestone.getSurvey();
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(milestone.getCoachingProgram().getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getClientContext(tracker.getCoachingSession().getClient().getId().toString()));
        contextList.add(contextEngine.getSurveyContext(survey.getId().toString()));
        contextList.add(contextEngine.getAllClientPeerResponseSummariesByPeerReviewId(peerReviewRepository.findByMilestoneTracker_Id(tracker.getId()).get().getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> emailBodyToClientContext(String sessionId) {
        CompletionContext context = completionContexts.get("email_body_client");

        CoachingSession session = coachingSessionRepository.findById(UUID.fromString(sessionId))
            .orElseThrow(() -> new ResourceNotFoundException("Session Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getClientContext(session.getClient().getId().toString()));
        contextList.add(contextEngine.getProgramContext(session.getCoachingProgram().getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> emailBodyToClientOrganisationContext(String clientOrgId) {
        CompletionContext context = completionContexts.get("email_body_client_org");
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getClientOrganisationContext(clientOrgId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> emailBodyToTrainerContext(String trainerId) {
        CompletionContext context = completionContexts.get("email_body_trainer");

        Trainer trainer = trainerRepository.findById(UUID.fromString(trainerId))
            .orElseThrow(() -> new ResourceNotFoundException("Trainer Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerOrganisationContext(trainer.getTrainerOrganisation().getId().toString()));
        contextList.add(contextEngine.getTrainerContext(trainerId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> milestoneDetailsContext(String programMilestoneId) {
        CompletionContext context = completionContexts.get("milestone_details");

        ProgramMilestone milestone = programMilestoneRepository.findById(UUID.fromString(programMilestoneId))
            .orElseThrow(() -> new ResourceNotFoundException("Program Milestone Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(milestone.getCoachingProgram().getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getAllFocusAreasByProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getAllFocusAreasByMilestoneContext(programMilestoneId));
        contextList.add(contextEngine.getMilestoneContext(programMilestoneId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> activityOutlineContext(String milestoneId) {
        CompletionContext context = completionContexts.get("activity_outline");

        ProgramMilestone milestone = programMilestoneRepository.findById(UUID.fromString(milestoneId))
            .orElseThrow(() -> new ResourceNotFoundException("Program Milestone Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(milestone.getCoachingProgram().getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getAllFocusAreasByMilestoneContext(milestoneId));
        contextList.add(contextEngine.getMilestoneContext(milestoneId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> activityTrainerNotesContext(String milestoneId) {
        CompletionContext context = completionContexts.get("activity_trainer_notes");

        ProgramMilestone milestone = programMilestoneRepository.findById(UUID.fromString(milestoneId))
            .orElseThrow(() -> new ResourceNotFoundException("Program Milestone Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(milestone.getCoachingProgram().getTrainer().getId().toString()));
        contextList.add(contextEngine.getProgramContext(milestone.getCoachingProgram().getId().toString()));
        contextList.add(contextEngine.getAllFocusAreasByMilestoneContext(milestoneId));
        contextList.add(contextEngine.getMilestoneContext(milestoneId));
        contextList.add(contextEngine.getActivityContext(milestone.getActivity().getId().toString()));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> surveyObjectiveContext(String surveyId) {
        CompletionContext context = completionContexts.get("survey_objective");

        Survey survey = surveyRepository.findById(UUID.fromString(surveyId))
            .orElseThrow(() -> new ResourceNotFoundException("Survey Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getSurveyContext(surveyId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> askWizardChatContext(String surveyId) {
        CompletionContext context = completionContexts.get("ask_wizard_chat");

        Survey survey = surveyRepository.findById(UUID.fromString(surveyId))
            .orElseThrow(() -> new ResourceNotFoundException("Survey Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getSurveyContext(surveyId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerShortOverviewContext(String trainerId) {
        CompletionContext context = completionContexts.get("trainer_short_overview");

        Trainer trainer = trainerRepository.findById(UUID.fromString(trainerId))
            .orElseThrow(() -> new ResourceNotFoundException("Trainer Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(trainerId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerCompleteQualificationContext(String trainerId) {
        CompletionContext context = completionContexts.get("trainer_complete_qualification");

        Trainer trainer = trainerRepository.findById(UUID.fromString(trainerId))
            .orElseThrow(() -> new ResourceNotFoundException("Trainer Not Found"));
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerContext(trainerId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerOrganisationProfileEmailHeaderContext(String trainerOrgId) {
        CompletionContext context = completionContexts.get("trainer_org_email_header");
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerOrganisationContext(trainerOrgId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }

    public List<String> trainerOrganisationProfileEmailFooterContext(String trainerOrgId) {
        CompletionContext context = completionContexts.get("trainer_org_email_footer");
        
        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getTrainerOrganisationContext(trainerOrgId));
        contextList.add(context.getAction());
        contextList.add(context.getModel());
        return contextList;
    }
}
