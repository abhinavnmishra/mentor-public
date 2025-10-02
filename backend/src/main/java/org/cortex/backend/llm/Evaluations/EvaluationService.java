package org.cortex.backend.llm.Evaluations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.annotation.PostConstruct;
import org.cortex.backend.dto.ClientReport;
import org.cortex.backend.dto.FormDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.llm.Evaluations.pojo.*;
import org.cortex.backend.llm.pojo.GPTResponse;
import org.cortex.backend.llm.pojo.OpenAiRequest;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.FocusAreaRepository;
import org.cortex.backend.repository.ProgramMilestoneRepository;
import org.cortex.backend.repository.SurveyResponseRepository;
import org.cortex.backend.service.SurveyWizardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Function;

@Service
public class EvaluationService {

    private static final Logger logger = LoggerFactory.getLogger(EvaluationService.class);
    private static final String REQUEST_LOG_DIR = "logs/openai_requests";

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private EvaluationContext evaluationContext;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private FocusAreaRepository focusAreaRepository;

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Value("${spring.ai.openai.url}")
    private String openAiUrl;

    @Value("${spring.ai.openai.model}")
    private String model;

    private final Map<String, Function<String, List<String>>> contextMethodMap = new HashMap<>();

    @PostConstruct
    public void init() {
        logger.info("Initializing EvaluationService");
        // Create logs directory if it doesn't exist
        new File(REQUEST_LOG_DIR).mkdirs();
        // Initialize the map with all available context methods
        contextMethodMap.put("survey_summarizer", evaluationContext::getSurveySummaryContext);
        contextMethodMap.put("survey_response_summarizer", evaluationContext::getSurveyResponseSummaryContext);
        contextMethodMap.put("survey_response_evaluator", evaluationContext::getSurveyResponseEvaluationContext);
        contextMethodMap.put("survey_response_focus_area_summarizer", evaluationContext::getSurveyResponseFocusAreaSummaryContext);
        contextMethodMap.put("response_evaluator", evaluationContext::getResponseEvaluationScoreContext);
        contextMethodMap.put("exercise_response_evaluator", evaluationContext::getExerciseResponseEvaluationContext);
        contextMethodMap.put("peer_review_response_summarizer", evaluationContext::getPeerReviewResponseSummaryContext);
        contextMethodMap.put("focus_area_improvement_summarizer", evaluationContext::getFocusAreaImprovementSummaryContext);
        logger.info("EvaluationService initialized with {} context methods", contextMethodMap.size());
    }

    public Boolean evaluateAnswers(String surveyResponseId) {

        logger.info("Starting evaluateAnswers for surveyResponseId: {}", surveyResponseId);

        logger.debug("Fetching survey response data");
        SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> new ResourceNotFoundException("Survey Response Not Found"));

        Survey survey = surveyResponse.getSurvey();

        logger.debug("Fetching program milestone data");
        ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(survey.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Survey Milestone Not Found"));

        try {

            logger.debug("Parsing survey responses");
            ArrayList<ArrayList<FormDto.AnswerItem>> responses = SurveyWizardService.parseResponses(surveyResponse.getResponse().get("responses"));

            logger.debug("Evaluating non-descriptive answers");
            List<SurveyResponse.QuestionScore> questionScores = new ArrayList<>(responses.stream().flatMap(List::stream)
                    .filter(an -> !"descriptive".equals(an.getType()))
                    .map(this::evaluateSingleAnswer)
                    .toList());

            logger.debug("Collecting descriptive answers for LLM evaluation");
            List<FormDto.AnswerItem> answerItemsDescriptive = responses.stream().flatMap(List::stream)
                    .filter(an -> "descriptive".equals(an.getType()))
                    .toList();

            logger.debug("Evaluating descriptive answers by LLM");
            List<SurveyResponse.QuestionScore> questionScoresDescriptive = evaluateAnswersByLLM(answerItemsDescriptive, survey, milestone);

            questionScores.addAll(questionScoresDescriptive);

            logger.debug("Retrieving focus areas");
            List<FocusArea> focusAreas = getAllFocusAreaFlat(milestone.getFocusAreas());

            logger.debug("Evaluating focus areas");
            List<SurveyResponse.EvaluationFocusArea> evaluationFocusAreas = focusAreas.stream()
                    .map(fa -> evaluateSingleFocusArea(survey, fa, questionScores))
                    .toList();

            logger.debug("Getting survey response summary");
            String surveyResponseSummary = getSurveyResponseSummary(surveyResponseId, questionScores);

            logger.debug("Creating response evaluation object");
            SurveyResponse.ResponseEvaluation evaluation = new SurveyResponse.ResponseEvaluation();
            evaluation.setSurveyResponseSummary(surveyResponseSummary);
            evaluation.setSurveySummary(survey.getSurveySummary());
            evaluation.setFocusAreas(evaluationFocusAreas);
            evaluation.setQuestionScore(questionScores);

            surveyResponse.setEvaluation(evaluation);

            logger.debug("Saving survey response with evaluation");
            surveyResponseRepository.save(surveyResponse);

            logger.info("Completed evaluateAnswers for surveyResponseId: {}", surveyResponseId);
            return true;
        } catch (Exception e) {

            logger.info("Exception Occurred While Evaluating Survey Response For Id {} : {}", surveyResponseId, e.getMessage());
            SurveyResponse.ResponseEvaluation evaluation = new SurveyResponse.ResponseEvaluation();
            evaluation.setSurveyResponseSummary("");
            evaluation.setSurveySummary(survey.getSurveySummary());
            evaluation.setFocusAreas(new ArrayList<>());
            evaluation.setQuestionScore(new ArrayList<>());
            evaluation.setCompleted(false);
            surveyResponse.setEvaluation(evaluation);

            logger.debug("Saving survey response with empty evaluation");
            surveyResponseRepository.save(surveyResponse);
            return false;
        }
    }

    public SurveyResponse.EvaluationFocusArea evaluateSingleFocusArea(Survey survey, FocusArea focusArea, List<SurveyResponse.QuestionScore> questionScores) {
        logger.info("Starting evaluateSingleFocusArea for focusAreaId: {}", focusArea.getId());
        
        SurveyResponse.EvaluationFocusArea evaluationFocusArea = new SurveyResponse.EvaluationFocusArea();

        AtomicReference<Double> maxScore = new AtomicReference<>(0.0);
        AtomicReference<Double> minScore = new AtomicReference<>(0.0);
        AtomicReference<Double> score = new AtomicReference<>(0.0);

        logger.debug("Filtering question scores for focus area: {}", focusArea.getId());
        List<SurveyResponse.QuestionScore> focusAreaQuestionScores =  questionScores.stream()
                .filter(qs -> qs.getEval().getFocusAreas().contains(focusArea.getId().toString()))
                .peek(qs -> {
                    maxScore.updateAndGet(v -> v + qs.getMaxScore());
                    minScore.updateAndGet(v -> v + qs.getMinScore());
                    score.updateAndGet(v -> v + qs.getScore());
                }).toList();

        logger.debug("Getting focus area evaluation summary");
        String focusAreaEvaluationSummary = getSurveyResponseFocusAreaSummary(survey, focusAreaQuestionScores, focusArea.getId().toString());

        evaluationFocusArea.setFocusAreaId(focusArea.getId().toString());
        evaluationFocusArea.setMaxScore(maxScore.get());
        evaluationFocusArea.setMinScore(minScore.get());
        evaluationFocusArea.setScore(score.get());
        evaluationFocusArea.setFocusAreaPerformanceSummary(focusAreaEvaluationSummary);

        logger.info("Completed evaluateSingleFocusArea for focusAreaId: {}", focusArea.getId());
        return evaluationFocusArea;
    }

    public SurveyResponse.QuestionScore evaluateSingleAnswer(FormDto.AnswerItem answerItem) {
        logger.info("Starting evaluateSingleAnswer for questionId: {}", answerItem.getQuestionId());
        
        SurveyResponse.QuestionScore questionScore = new SurveyResponse.QuestionScore();

        Double maxScore = 10.0;
        Double minScore = 0.0;
        Double score = 0.0;

        if (answerItem.getEval().getNumericScoring()){
            logger.debug("Processing numeric scoring for question type: {}", answerItem.getType());
            String type = answerItem.getType();

            if("rating".equalsIgnoreCase(type)) {
                logger.debug("Evaluating rating type answer");
                score = answerItem.getRating().doubleValue();
                questionScore.setAnswer(answerItem.getRating().toString());

            } else if ("mcq".equalsIgnoreCase(type)) {
                logger.debug("Evaluating MCQ type answer");
                String[] optionsSelected =  (answerItem.getOptionsSelected() == null ? new String[0] : answerItem.getOptionsSelected());
                for (String selected : optionsSelected) {
                    for (int i = 0; i<answerItem.getOptions().length; i++) {
                        if(selected.equalsIgnoreCase(answerItem.getOptions()[i])){
                            score += answerItem.getEval().getOptions().get(i);
                            questionScore.setAnswer(answerItem.getOptions()[i]);
                            break;
                        }
                    }
                    break;
                }

            } else if ("mcq-multiselect".equalsIgnoreCase(type)) {
                logger.debug("Evaluating MCQ-multiselect type answer");
                int count = 0;
                for (String selected : answerItem.getOptionsSelected()) {
                    for (int i = 0; i<answerItem.getOptions().length; i++) {
                        if(selected.equalsIgnoreCase(answerItem.getOptions()[i])){
                            count ++;
                            score += answerItem.getEval().getOptions().get(i);
                            break;
                        }
                    }
                }
                questionScore.setAnswer(String.join(",", answerItem.getOptions()));
                score /= count;
            }

            logger.debug("Applying weight factor to scores");
            maxScore *= answerItem.getEval().getWeight();
            minScore *= answerItem.getEval().getWeight();
            score *= answerItem.getEval().getWeight();

            if (answerItem.getEval().getReverseScoring()) {
                logger.debug("Applying reverse scoring");
                score = ((maxScore-minScore)-(score-minScore)) + minScore; // = maxScore+minScore-score
            }

        } else {
            logger.debug("Non-numeric scoring, setting all scores to 0.0");
            maxScore = 0.0;
            minScore = 0.0;
            score = 0.0;
        }
        
        logger.debug("Setting question metadata");
        questionScore.setQuestionId(answerItem.getQuestionId());
        questionScore.setContent(answerItem.getQuestion());
        questionScore.setType(answerItem.getType());

        questionScore.setMaxScore(maxScore);
        questionScore.setMinScore(minScore);
        questionScore.setScore(score);

        questionScore.setEval(answerItem.getEval());

        logger.info("Completed evaluateSingleAnswer for questionId: {}", answerItem.getQuestionId());
        return questionScore;
    }

    public List<SurveyResponse.QuestionScore> evaluateAnswersByLLM(List<FormDto.AnswerItem> answerItems, Survey survey, ProgramMilestone milestone) {
        logger.info("Starting evaluateAnswersByLLM for {} answers in milestone: {}", answerItems.size(), milestone.getId());
        
        String keyword = "response_evaluator";
        String milestoneId = milestone.getId().toString();

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }
        
        // Get the context list using the selected method
        logger.debug("Retrieving context list for milestoneId: {}", milestoneId);
        List<String> contextList = contextMethod.apply(milestoneId);

        logger.debug("Adding survey summary to context");
        String surveySummary = """
                Below is the brief summary of the survey :
                
                """ + survey.getSurveySummary();

        contextList.add(contextList.size()-2, surveySummary);

        logger.debug("Adding response context to context list");
        String responseContext = """
                Below is the list of questions and their responses as provided by the user which you need to evaluate:
                
                """ + FormDto.getAllAnswerItemContext(answerItems);

        contextList.add(contextList.size()-1, responseContext);

        logger.debug("Requesting evaluation from LLM");
        List<EvaluationResponseFormat> evaluationResponseFormatList = promptLLMForEvaluation(contextList);

        logger.debug("Creating answer item map");
        HashMap<String, FormDto.AnswerItem> answerItemMap = new HashMap<>();
        answerItems.forEach(an -> answerItemMap.put(an.getResponseId(), an));

        logger.debug("Processing evaluation results");
        List<SurveyResponse.QuestionScore> results = evaluationResponseFormatList.stream().filter(ev -> answerItemMap.containsKey(ev.getResponseId())).map(ev -> {
            SurveyResponse.QuestionScore questionScore = new SurveyResponse.QuestionScore();
            FormDto.AnswerItem answerItem = answerItemMap.get(ev.getResponseId());

            Double maxScore = 10.0;
            Double minScore = 0.0;
            Double score = ev.getScore();

            maxScore *= answerItem.getEval().getWeight();
            minScore *= answerItem.getEval().getWeight();
            score *= answerItem.getEval().getWeight();

            if (answerItem.getEval().getReverseScoring()) {
                score = ((maxScore-minScore)-(score-minScore)) + minScore; // = maxScore+minScore-score
            }

            questionScore.setQuestionId(answerItem.getQuestionId());
            questionScore.setContent(answerItem.getQuestion());
            questionScore.setType(answerItem.getType());
            questionScore.setAnswer(answerItem.getAnswer());

            questionScore.setMaxScore(maxScore);
            questionScore.setMinScore(minScore);
            questionScore.setScore(score);

            questionScore.setEval(answerItem.getEval());

            return questionScore;

        }).toList();
        
        logger.info("Completed evaluateAnswersByLLM with {} results", results.size());
        return results;
    }

    public List<EvaluationResponseFormat> promptLLMForEvaluation(List<String> contextList) {
        logger.info("Starting promptLLMForEvaluation with context size: {}", contextList.size());
        
        // Prepare headers
        logger.debug("Preparing HTTP headers");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request using POJO
        logger.debug("Creating OpenAI request for evaluation");
        OpenAiRequest request = OpenAIRequestEvaluation.create(model, contextList);

        // Save request to file
        logger.debug("Saving request to file");
        saveRequestToFile(request);

        // Prepare the request entity
        HttpEntity<OpenAiRequest> requestEntity = new HttpEntity<>(request, headers);

        // Call the API
        logger.debug("Calling OpenAI API for evaluation");
        GPTResponse gptResponse = restTemplate.postForObject(openAiUrl, requestEntity, GPTResponse.class);
        String refusal = gptResponse.getChoices().get(0).getMessage().getRefusal();

        if(refusal == null || "".equals(refusal)){
            logger.debug("Successfully received evaluation response");
            String response = gptResponse.getChoices().get(0).getMessage().getContent();
            logger.debug("Response : {}", response);
            List<EvaluationResponseFormat> result = EvaluationResponseFormat.getItemsByContent(response);
            logger.info("Completed promptLLMForEvaluation with {} evaluation items", result.size());
            return result;
        } else {
            logger.error("Failed to generate evaluations: {}", refusal);
            throw new RuntimeException("Failed to generate evaluations.");
        }
    }

    public List<ReportView.Page> evaluateExerciseResponsePages(ExerciseResponse exerciseResponse){
        logger.info("Starting evaluateExerciseResponsePages for exerciseResponseId: {}", exerciseResponse.getId());

        String keyword = "exercise_response_evaluator";

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }

        // Get the context list using the selected method
        logger.debug("Retrieving context list for exerciseResponseId: {}", exerciseResponse.getId());
        List<String> contextList = contextMethod.apply(exerciseResponse.getId().toString());

        // Prompt LLM for exercise evaluation
        List<ExerciseEvaluationResponseFormat> evaluationResults = promptLLMForExerciseEvaluation(contextList);

        // Convert results to ReportView.Page format
        List<ReportView.Page> pages = new ArrayList<>();
        List<ReportView.Page.Section> sections = new ArrayList<>();
        for (ExerciseEvaluationResponseFormat result : evaluationResults) {
            ReportView.Page.Section section = new ReportView.Page.Section();
            section.setTitle(result.getTitle());
            section.setContent(result.getContent());
            sections.add(section);
        }
        ReportView.Page page = new ReportView.Page();
        page.setTitle("Exercise Evaluation Report");
        page.setSections(sections);
        pages.add(page);

        logger.info("Completed evaluateExerciseResponsePages with {} pages", pages.size());
        return pages;
    }

    public SurveyResponse evaluateSurveyResponsePages(String surveyResponseId){
        logger.info("Starting evaluateSurveyResponse for surveyResponseId: {}", surveyResponseId);

        logger.debug("Fetching survey response data");
        SurveyResponse surveyResponse = surveyResponseRepository.findById(UUID.fromString(surveyResponseId))
                .orElseThrow(() -> new ResourceNotFoundException("Survey Response Not Found"));

        String keyword = "survey_response_evaluator";

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }

        // Get the context list using the selected method
        logger.debug("Retrieving context list for exerciseResponseId: {}", surveyResponse.getId());
        List<String> contextList = contextMethod.apply(surveyResponse.getId().toString());

        logger.debug("Fetching program milestone data");
        ProgramMilestone milestone = programMilestoneRepository.findBySurvey_Id(surveyResponse.getSurvey().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Survey Milestone Not Found"));

        logger.debug("Retrieving focus areas");
        List<FocusArea> focusAreas = getAllFocusAreaFlat(milestone.getFocusAreas());

        String focusAreaContext = """
                Below is the list of focus areas associated with the survey milestone :
                
                """;
        for (FocusArea fa : focusAreas) {
            focusAreaContext += fa.getContext() + "\n";
        }

        contextList.add(contextList.size()-1, focusAreaContext);

        // Prompt LLM for exercise evaluation
        List<ExerciseEvaluationResponseFormat> evaluationResults = promptLLMForExerciseEvaluation(contextList);

        // Convert results to ReportView.Page format
        List<ReportView.Page> pages = new ArrayList<>();

        List<ReportView.Page.Section> sections = new ArrayList<>();
        for (ExerciseEvaluationResponseFormat result : evaluationResults) {
            ReportView.Page.Section section = new ReportView.Page.Section();
            section.setTitle(result.getTitle());
            section.setContent(result.getContent());
            sections.add(section);
        }
        ReportView.Page page = new ReportView.Page();
        page.setTitle("Survey Evaluation");
        page.setSections(sections);
        pages.add(page);

        List<ReportView.Page.Section> focusAreaSections = new ArrayList<>();
        for (SurveyResponse.EvaluationFocusArea focusArea : surveyResponse.getEvaluation().getFocusAreas()) {
            ReportView.Page.Section section = new ReportView.Page.Section();
            section.setTitle(focusAreas.stream().filter(fa -> fa.getId().toString().equalsIgnoreCase(focusArea.getFocusAreaId())).findFirst().orElse(new FocusArea(focusArea.getFocusAreaId())).getName() + " Score : " + focusArea.getScore() + "/" + focusArea.getMaxScore());
            section.setContent(focusArea.getFocusAreaPerformanceSummary());
            focusAreaSections.add(section);
        }
        ReportView.Page focusAreaPage = new ReportView.Page();
        focusAreaPage.setTitle("Focus Area Evaluation");
        focusAreaPage.setSections(focusAreaSections);
        pages.add(focusAreaPage);

        List<ReportView.Page.Section> coachNotesSections = new ArrayList<>();
        ReportView.Page.Section coachNote = new ReportView.Page.Section();
        coachNote.setTitle("Coach Notes");
        coachNote.setContent(surveyResponse.getEvaluation().getSurveyResponseSummary());
        coachNotesSections.add(coachNote);
        ReportView.Page coachNotesPage = new ReportView.Page();
        coachNotesPage.setTitle("Survey Evaluation");
        coachNotesPage.setSections(coachNotesSections);
        pages.add(coachNotesPage);

        surveyResponse.setReportPages(pages);
        logger.info("Completed evaluateSurveyResponsePages with {} pages", pages.size());
        return surveyResponseRepository.save(surveyResponse);
    }


    public List<ExerciseEvaluationResponseFormat> promptLLMForExerciseEvaluation(List<String> contextList) {
        logger.info("Starting promptLLMForExerciseEvaluation with context size: {}", contextList.size());

        // Prepare headers
        logger.debug("Preparing HTTP headers");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request using POJO
        logger.debug("Creating OpenAI request for exercise evaluation");
        OpenAiRequest request = OpenAIExerciseEvaluation.create(model, contextList);

        // Save request to file
        logger.debug("Saving request to file");
        saveRequestToFile(request);

        // Prepare the request entity
        HttpEntity<OpenAiRequest> requestEntity = new HttpEntity<>(request, headers);

        // Call the API
        logger.debug("Calling OpenAI API for evaluation");
        GPTResponse gptResponse = restTemplate.postForObject(openAiUrl, requestEntity, GPTResponse.class);
        String refusal = gptResponse.getChoices().get(0).getMessage().getRefusal();

        if(refusal == null || "".equals(refusal)){
            logger.debug("Successfully received evaluation response");
            String response = gptResponse.getChoices().get(0).getMessage().getContent();
            logger.debug("Response : {}", response);
            List<ExerciseEvaluationResponseFormat> result = ExerciseEvaluationResponseFormat.getItemsByContent(response);
            logger.info("Completed promptLLMForExerciseEvaluation with {} evaluation items", result.size());
            return result;
        } else {
            logger.error("Failed to generate evaluations: {}", refusal);
            throw new RuntimeException("Failed to generate evaluations.");
        }
    }

    public String getSurveySummary(String surveyId){
        logger.info("Starting getSurveySummary for surveyId: {}", surveyId);
        String keyword = "survey_summarizer";
        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }
        // Get the context list using the selected method
        logger.debug("Retrieving context list for surveyId: {}", surveyId);
        List<String> contextList = contextMethod.apply(surveyId);

        logger.debug("Requesting summary from LLM");
        String result = promptLLMForSummary(contextList);
        logger.info("Completed getSurveySummary for surveyId: {}", surveyId);
        return result;
    }

    public String getPeerReviewResponseSummary(String peerReviewId){
        logger.info("Starting getPeerReviewResponseSummary for peer review Id: {}", peerReviewId);
        String keyword = "peer_review_response_summarizer";

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());

        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }
        // Get the context list using the selected method
        logger.debug("Retrieving context list for peer review: {}", peerReviewId);
        List<String> contextList = contextMethod.apply(peerReviewId);

        logger.debug("Requesting summary from LLM");
        String result = promptLLMForSummary(contextList);
        logger.info("Completed getPeerReviewResponseSummary for peer review: {}", peerReviewId);
        return result;
    }

    public String getSurveyResponseSummary(String surveyResponseId, List<SurveyResponse.QuestionScore> questionScores){
        logger.info("Starting getSurveyResponseSummary for surveyResponseId: {}", surveyResponseId);
        
        String keyword = "survey_response_summarizer";

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }
        
        // Get the context list using the selected method
        logger.debug("Retrieving context list for surveyResponseId: {}", surveyResponseId);
        List<String> contextList = contextMethod.apply(surveyResponseId);

        logger.debug("Adding response context with {} question scores", questionScores.size());
        String responseContext = """
                Below is the list of questions and their responses as provided by the user :
                
                """ + SurveyResponse.getQuestionScoresForLLM(questionScores);

        contextList.add(contextList.size()-1, responseContext);

        logger.debug("Requesting summary from LLM");
        String result = promptLLMForSummary(contextList);
        logger.info("Completed getSurveyResponseSummary for surveyResponseId: {}", surveyResponseId);
        return result;
    }

    public String getSurveyResponseFocusAreaSummary(Survey survey, List<SurveyResponse.QuestionScore> questionScores, String focusAreaId){
        logger.info("Starting getSurveyResponseFocusAreaSummary for focusAreaId: {}", focusAreaId);
        
        String keyword = "survey_response_focus_area_summarizer";

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }
        
        // Get the context list using the selected method
        logger.debug("Retrieving context list for focusAreaId: {}", focusAreaId);
        List<String> contextList = contextMethod.apply(focusAreaId);

        logger.debug("Adding survey summary to context");
        String surveySummary = """
                Below is the brief summary of the survey :
                
                """ + survey.getSurveySummary();

        contextList.add(contextList.size()-2, surveySummary);

        logger.debug("Adding response context with {} question scores", questionScores.size());
        String responseContext = """
                Below is the list of questions (Only the questions that are tagged with the above focus area. If there are none then the below content will be empty.) and their responses as provided by the user :
                
                """ + SurveyResponse.getQuestionScoresForLLM(questionScores);

        contextList.add(contextList.size()-1, responseContext);

        logger.debug("Requesting summary from LLM");
        String result = promptLLMForSummary(contextList);
        logger.info("Completed getSurveyResponseFocusAreaSummary for focusAreaId: {}", focusAreaId);
        return result;
    }

    public String getFocusAreaImprovementSummary(ClientReport.FocusAreaImprovementGraph improvementGraph, String focusAreaId, Client client){
        logger.info("Starting getFocusAreaImprovementSummary for focusAreaId: {}", focusAreaId);

        String keyword = "focus_area_improvement_summarizer";

        // Get the appropriate context method based on the keyword
        logger.debug("Getting context method for keyword: {}", keyword);
        Function<String, List<String>> contextMethod = contextMethodMap.get(keyword.toLowerCase());
        if (contextMethod == null) {
            logger.error("Invalid keyword provided: {}", keyword);
            throw new IllegalArgumentException("Invalid keyword: " + keyword);
        }

        // Get the context list using the selected method
        logger.debug("Retrieving context list for focusAreaId: {}", focusAreaId);
        List<String> contextList = contextMethod.apply(focusAreaId);

        logger.debug("Adding client details to context");
        String clientDetails = """
                Below is the details of the client for which the improvement summary is being generated :
                
                """ + client.getIndexData();

        contextList.add(contextList.size()-1, clientDetails);

        logger.debug("Adding graph details to context");
        String surveySummary = """
                Below is the details of the focus area improvement graph :
                
                """ + improvementGraph.getGraphContext();

        contextList.add(contextList.size()-1, surveySummary);

        logger.debug("Requesting summary from LLM");
        String result = promptLLMForSummary(contextList);
        logger.info("Completed getFocusAreaImprovementSummary for focusAreaId: {}", focusAreaId);
        return result;
    }

    public String promptLLMForSummary(List<String> contextList) {
        logger.info("Starting promptLLMForSummary with context size: {}", contextList.size());
        
        // Prepare headers
        logger.debug("Preparing HTTP headers");
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create request using POJO
        logger.debug("Creating OpenAI request for summary");
        OpenAiRequest request = OpenAIRequestSummary.create(model, contextList);

        // Save request to file
        logger.debug("Saving request to file");
        saveRequestToFile(request);

        // Prepare the request entity
        HttpEntity<OpenAiRequest> requestEntity = new HttpEntity<>(request, headers);

        // Call the API
        logger.debug("Calling OpenAI API for summary");
        GPTResponse gptResponse = restTemplate.postForObject(openAiUrl, requestEntity, GPTResponse.class);
        String refusal = gptResponse.getChoices().get(0).getMessage().getRefusal();
        if(refusal == null || "".equals(refusal)){
            logger.debug("Successfully received summary response");
            String response = gptResponse.getChoices().get(0).getMessage().getContent();
            // Remove consecutive asterisks or hash characters (2 or more)
            response = response.replaceAll("\\*{2,}", "");
            response = response.replaceAll("#{2,}", "");
            logger.info("Completed promptLLMForSummary");
            return response;
        } else {
            logger.warn("Received refusal from OpenAI: {}", refusal);
            return gptResponse.getChoices().get(0).getMessage().getRefusal();
        }
    }

    private void saveRequestToFile(OpenAiRequest request) {
        logger.debug("Starting saveRequestToFile");
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/request_%s.json", REQUEST_LOG_DIR, timestamp);

            logger.debug("Writing request to file: {}", filename);
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), request);

            logger.info("Saved OpenAI request to file: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to save request to file", e);
        }
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

}
