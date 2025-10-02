package org.cortex.backend.llm.Evaluations;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.exercises.repository.ExerciseResponseRepository;
import org.cortex.backend.llm.utilities.ContextEngine;
import org.cortex.backend.model.FocusArea;
import org.cortex.backend.model.PeerReview;
import org.cortex.backend.model.ProgramMilestone;
import org.cortex.backend.model.SurveyResponse;
import org.cortex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class EvaluationContext {

    @Value("classpath:Prompt/AboutTheTool.txt")
    private Resource aboutToolResource;

    @Value("classpath:Prompt/Evaluation/evaluation_contexts.json")
    private Resource evaluationContextsResource;

    @Autowired
    private ContextEngine contextEngine;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private PeerReviewRepository peerReviewRepository;

    @Autowired
    private ExerciseResponseRepository exerciseResponseRepository;

    private String aboutToolContent = "";
    private Map<String, EvaluationContextEntity> evaluationContexts = new HashMap<>();

    @Data
    static class EvaluationContextEntity {
        private String key;
        private String systemMessage;
        private String action;
    }

    @Data
    static class EvaluationContextsWrapper {
        private List<EvaluationContextEntity> contexts;
    }

    @PostConstruct
    public void init() throws IOException {
        // Load about tool content
        try (Reader reader = new InputStreamReader(aboutToolResource.getInputStream(), StandardCharsets.UTF_8)) {
            aboutToolContent = FileCopyUtils.copyToString(reader);
        }

        // Load evaluation contexts from JSON
        try (Reader reader = new InputStreamReader(evaluationContextsResource.getInputStream(), StandardCharsets.UTF_8)) {
            String jsonContent = FileCopyUtils.copyToString(reader);
            ObjectMapper mapper = new ObjectMapper();
            EvaluationContextsWrapper wrapper = mapper.readValue(jsonContent, EvaluationContextsWrapper.class);

            // Convert list to map for easy lookup
            wrapper.getContexts().forEach(context -> evaluationContexts.put(context.getKey(), context));
        }
    }

    public List<String> getSurveySummaryContext(String surveyId) {
        EvaluationContextEntity context = evaluationContexts.get("survey_summarizer");

        ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(UUID.fromString(surveyId))
                .orElseThrow(() -> new ResourceNotFoundException("Survey Milestone Not Found"));

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getAllFocusAreasByMilestoneContext(milestone.getId().toString()));
        contextList.add(contextEngine.getSurveyWithQuestionsContext(milestone.getSurvey().getId().toString()));
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getSurveyResponseSummaryContext(String surveyResponseId) {
        EvaluationContextEntity context = evaluationContexts.get("survey_response_summarizer");

        SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> new ResourceNotFoundException("Survey Response Not Found"));

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getSurveySummaryContext(surveyResponse.getSurvey().getId().toString()));
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getSurveyResponseFocusAreaSummaryContext(String focusAreaId) {
        EvaluationContextEntity context = evaluationContexts.get("survey_response_focus_area_summarizer");

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getFocusAreaContext(focusAreaId));
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getResponseEvaluationScoreContext(String milestoneId) {
        EvaluationContextEntity context = evaluationContexts.get("response_evaluator");

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getAllFocusAreasByMilestoneContext(milestoneId));
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getExerciseResponseEvaluationContext(String exerciseResponseId) {
        EvaluationContextEntity context = evaluationContexts.get("exercise_response_evaluator");
        ExerciseResponse exerciseResponse = exerciseResponseRepository.findById(UUID.fromString(exerciseResponseId))
                .orElseThrow(() -> new ResourceNotFoundException("Exercise Response Not Found"));

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(exerciseResponse.toXml());
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getSurveyResponseEvaluationContext(String surveyResponseId) {
        EvaluationContextEntity context = evaluationContexts.get("survey_response_evaluator");
        SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> new ResourceNotFoundException("Survey Response Not Found"));

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add("""
                        Below is the evaluation details of the survey response in XML format:
                        """ +
                surveyResponse.getEvaluation().toXmlString());
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getFocusAreaImprovementSummaryContext(String focusAreaId) {
        EvaluationContextEntity context = evaluationContexts.get("focus_area_improvement_summarizer");

        List<String> contextList = new ArrayList<>();
        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getFocusAreaContext(focusAreaId));
        contextList.add(context.getAction());
        return contextList;
    }

    public List<String> getPeerReviewResponseSummaryContext(String peerReviewId) {
        EvaluationContextEntity context = evaluationContexts.get("peer_review_response_summarizer");

        PeerReview peerReview = peerReviewRepository.findById(UUID.fromString(peerReviewId))
                .orElseThrow(() -> new ResourceNotFoundException("Peer Review Not Found"));

        List<SurveyResponse> peerResponses = surveyResponseRepository.findByPeerReview_Id(peerReview.getId());

        if(peerResponses.isEmpty()) throw new ResourceNotFoundException("Peer Review Responses Not Found");

        List<String> contextList = new ArrayList<>();

        contextList.add(aboutToolContent);
        contextList.add(context.getSystemMessage());
        contextList.add(contextEngine.getSurveySummaryContext(peerReview.getSurvey().getId().toString()));

        for(SurveyResponse response : peerResponses) {
            String responseContext = """
                    Below is the response summary of the peer review submitted by <<PEER_NAME>> :
                    """.replaceAll("<<PEER_NAME>>", response.getRespondentName() + " ( " + response.getRespondentDesignation() + " )")
                    + response.getEvaluation().getSurveyResponseSummary();
            contextList.add(responseContext);
        }

        contextList.add(context.getAction());
        return contextList;
    }

}
