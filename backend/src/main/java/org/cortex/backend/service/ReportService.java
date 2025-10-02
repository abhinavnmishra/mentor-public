package org.cortex.backend.service;

import org.cortex.backend.constant.MilestoneType;
import org.cortex.backend.dto.ClientReport;
import org.cortex.backend.dto.ReportDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exception.ValidationException;
import org.cortex.backend.llm.Evaluations.EvaluationService;
import org.cortex.backend.llm.Reports.model.ReportWizardChat;
import org.cortex.backend.llm.Reports.repository.ReportWizardChatRepository;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.OrderComparator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private static final Logger logger = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private CoachingProgramRepository coachingProgramRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private ProgramMilestoneRepository programMilestoneRepository;

    @Autowired
    private MilestoneTrackerRepository milestoneTrackerRepository;

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private ProgramService programService;

    @Autowired
    private EvaluationService evaluationService;

    @Autowired
    private PeerReviewRepository peerReviewRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ReportWizardChatRepository reportWizardChatRepository;

    @Transactional
    public ReportDto initializeReport (String programId){
        logger.info("Starting report initialization for program ID: {}", programId);
        Report report = new Report();
        report.setPublished(false);
        CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        logger.debug("Found coaching program with title: {}", coachingProgram.getTitle());

        List<Client> clients = coachingSessionRepository.findDistinctClientsByProgramId(coachingProgram.getId());
        logger.debug("Found {} clients for program", clients.size());

        List<FocusArea> focusAreas = programService.getAllFocusAreaFlat(coachingProgram.getFocusAreas());
        logger.debug("Found {} focus areas for program", focusAreas.size());

        report.setCoachingProgramId(coachingProgram.getId().toString());
        report.setProgramName(coachingProgram.getTitle());
        report.setProgramDescription(coachingProgram.getDescription());
        report.setAboutTheTrainer(coachingProgram.getTrainer().getShortDescription());
        report.setProgramObjective(getReportProgramObjective(coachingProgram));
        report.setConclusion(getReportConclusion(coachingProgram));
        logger.debug("Set basic report information");

        ReportWizardChat chat = new ReportWizardChat();
        chat = reportWizardChatRepository.save(chat);
        report.setReportWizardChat(chat);

        report = reportRepository.save(report);
        logger.debug("Saved initial report with ID: {}", report.getId());

        coachingProgram.setReport(report);
        coachingProgram = coachingProgramRepository.save(coachingProgram);
        logger.debug("Updated coaching program with report reference");

        List<Report.Version> versions = fetchReportVersions(programId);
        Report.Version version = new Report.Version();
        if(versions.isEmpty()){
            version.setCount(1);
            logger.debug("Creating first version of report");
        } else {
            version.setCount(versions.get(0).getCount() + 1);
            logger.debug("Creating version {} of report", version.getCount());
        }
        version.setReportId(report.getId().toString());
        version.setCoachingProgramId(programId);
        report.setVersion(version);

        List<ClientReport> clientReportList = new ArrayList<>();
        for(Client client : clients){
            logger.debug("Processing report for client ID: {}", client.getId());
            ClientReport clientReport = getClientReport(client, focusAreas, coachingProgram);
            clientReportList.add(clientReport);
        }
        report.setClientReportList(clientReportList);
        logger.debug("Added {} client reports", clientReportList.size());

        report.setFocusAreas(getFocusAreaReportList(focusAreas));
        logger.debug("Added focus area reports");

        report = reportRepository.save(report);
        logger.info("Successfully initialized report with ID: {}", report.getId());
        return ReportDto.fromEntity(report);
    }

    @Transactional
    public ReportDto cloneReport (String programId, int v){
        logger.info("Starting report cloning for program ID: {} version: {}", programId, v);
        ReportDto reportDto = fetchReport(programId, v);
        logger.debug("Fetched source report version {} for cloning", v);

        Report report = reportDto.toEntity();

        report.setId(null);
        report.setPublished(false);
        logger.debug("Created new report entity from DTO");

        CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        logger.debug("Found coaching program with title: {}", coachingProgram.getTitle());

        List<Client> clients = coachingSessionRepository.findDistinctClientsByProgramId(coachingProgram.getId());
        logger.debug("Found {} clients for program", clients.size());

        List<FocusArea> focusAreas = programService.getAllFocusAreaFlat(coachingProgram.getFocusAreas());
        logger.debug("Found {} focus areas for program", focusAreas.size());

        ReportWizardChat chat = new ReportWizardChat();
        chat = reportWizardChatRepository.save(chat);
        report.setReportWizardChat(chat);
        report.setCoachingProgramId(coachingProgram.getId().toString());

        report = reportRepository.save(report);
        logger.debug("Saved initial cloned report with ID: {}", report.getId());

        coachingProgram.setReport(report);
        coachingProgram = coachingProgramRepository.save(coachingProgram);
        logger.debug("Updated coaching program with cloned report reference");

        List<Report.Version> versions = fetchReportVersions(programId);
        Report.Version version = new Report.Version();
        if(versions.isEmpty()){
            version.setCount(1);
            logger.debug("Creating first version of cloned report");
        } else {
            version.setCount(versions.get(0).getCount() + 1);
            logger.debug("Creating version {} of cloned report", version.getCount());
        }
        version.setReportId(report.getId().toString());
        version.setCoachingProgramId(programId);
        report.setVersion(version);

        HashMap<String, Report.FocusAreaReport> existingFocusAreas = new HashMap<>();
        for(Report.FocusAreaReport focusAreaReport : report.getFocusAreas()) {
            existingFocusAreas.put(focusAreaReport.getFocusAreaId(), focusAreaReport);
        }
        logger.debug("Created map of {} existing focus area reports", existingFocusAreas.size());

        List<ClientReport> existingClientReportList = report.getClientReportList();
        HashMap<String, ClientReport> existingClientReportMap = new HashMap<>();
        HashMap<String, ClientReport.ClientFocusAreaReport> existingClientFocusAreaMap = new HashMap<>();
        for (ClientReport clientReport : existingClientReportList){
            logger.debug("Processing existing client report for client ID: {}", clientReport.getClient().getClientId());
            existingClientReportMap.put(clientReport.getClient().getClientId(), clientReport);

            for(ClientReport.ClientFocusAreaReport focusAreaReport : clientReport.getFocusAreas()) {
                existingClientFocusAreaMap.put(clientReport.getClient().getClientId() + focusAreaReport.getFocusAreaId(), focusAreaReport);
            }
        }
        logger.debug("Created maps of {} existing client focus area reports",
            existingClientFocusAreaMap.size());

        List<ClientReport> clientReportList = new ArrayList<>();
        for(Client client : clients){
            logger.debug("Processing cloned report for client ID: {}", client.getId());
            ClientReport clientReport = getClientReportForClone(client, focusAreas, coachingProgram, existingClientReportMap, existingClientFocusAreaMap);
            clientReportList.add(clientReport);
        }
        report.setClientReportList(clientReportList);
        logger.debug("Added {} client reports to cloned report", clientReportList.size());

        report.setFocusAreas(getFocusAreaReportListForClone(focusAreas, existingFocusAreas));
        logger.debug("Added cloned focus area reports");

        report = reportRepository.save(report);
        logger.info("Successfully cloned report with new ID: {}", report.getId());
        return ReportDto.fromEntity(report);
    }

    @Transactional
    public ReportDto fetchReport(String programId, int version){
        logger.info("Fetching report for program ID: {} version: {}", programId, version);
        CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        logger.debug("Found coaching program with title: {}", coachingProgram.getTitle());
     
        if (coachingProgram.getReport() == null) {
            logger.debug("No report exists for program, initializing new report");
            return initializeReport(programId);
        }
        if(version == 0){
            logger.debug("Returning latest report version");
            return ReportDto.fromEntity(coachingProgram.getReport());
        }
        logger.debug("Searching for report version: {}", version);
        List<Report> report = reportRepository.findAllByVersion_CoachingProgramIdAndVersion_Count(programId, version);
        if(report.isEmpty()) throw new ResourceNotFoundException("Report Version Not Found");
        logger.info("Successfully fetched report version {} for program ID: {}", version, programId);
        return ReportDto.fromEntity(report.get(0));
    }

    public List<Report.Version> fetchReportVersions(String programId){
        logger.info("Fetching report versions for program ID: {}", programId);
        List<Report> reports = reportRepository.findAllByVersion_CoachingProgramId(programId);
        logger.debug("Found {} report versions", reports.size());
        List<Report.Version> versions = reports.stream().map(Report::getVersion)
                .sorted((v1, v2) -> Integer.compare(v2.getCount(), v1.getCount()))
                .collect(Collectors.toList());
        logger.debug("Sorted versions in descending order, latest version is {}", 
            versions.isEmpty() ? "none" : versions.get(0).getCount());
        return versions;
    }

    @Transactional
    public ReportDto saveReport(String programId, ReportDto reportDto){
        logger.info("Saving report for program ID: {}", programId);
        CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        Report oldReport = coachingProgram.getReport();
        if (oldReport.getPublished()) {
            logger.info("Resource Already Published");
            throw new ValidationException("Resource Already Published");
        }
        logger.debug("Found coaching program with title: {}", coachingProgram.getTitle());
        if (!coachingProgram.getReport().getId().toString().equals(reportDto.getId())){
            logger.warn("Report ID mismatch. Expected: {}, Got: {}", coachingProgram.getReport().getId(), reportDto.getId());
            throw new ValidationException("Report ID mismatch");
        }
        
        Report report = reportDto.toEntity();
        report.setCoachingProgramId(coachingProgram.getId().toString());
        report.setVersion(oldReport.getVersion());
        report.setPublished(oldReport.getPublished());
        report.setReportWizardChat(oldReport.getReportWizardChat());
        report = reportRepository.save(report);
        logger.info("Successfully saved report with ID: {}", report.getId());
        return ReportDto.fromEntity(report);
    }

    @Transactional
    public ReportDto saveAndPublishReport(String programId, ReportDto reportDto){
        logger.info("Saving report for program ID: {}", programId);
        CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(programId)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
        Report oldReport = coachingProgram.getReport();
        if (oldReport.getPublished()) {
            logger.info("Resource Already Published");
            throw new ValidationException("Resource Already Published");
        }
        logger.debug("Found coaching program with title: {}", coachingProgram.getTitle());
        if (!coachingProgram.getReport().getId().toString().equals(reportDto.getId())){
            logger.warn("Report ID mismatch. Expected: {}, Got: {}", coachingProgram.getReport().getId(), reportDto.getId());
            return ReportDto.fromEntity(oldReport);
        }

        Report report = reportDto.toEntity();
        report.setCoachingProgramId(coachingProgram.getId().toString());
        report.setVersion(oldReport.getVersion());
        report.setReportWizardChat(oldReport.getReportWizardChat());
        report.setPublished(true);
        report = reportRepository.save(report);
        logger.info("Successfully saved report with ID: {}", report.getId());
        return ReportDto.fromEntity(report);
    }

    public List<Report.FocusAreaReport> getFocusAreaReportList(List<FocusArea> focusAreas){
        logger.debug("Creating focus area report list for {} focus areas", focusAreas.size());
        List<Report.FocusAreaReport> focusAreaReportList = new ArrayList<>();
        
        for(FocusArea focusArea : focusAreas) {
            logger.debug("Processing focus area: {} ({})", focusArea.getName(), focusArea.getId());
            Report.FocusAreaReport focusAreaReport = new Report.FocusAreaReport();
            focusAreaReport.setFocusAreaId(focusArea.getId().toString());
            focusAreaReport.setName(focusArea.getName());
            focusAreaReport.setFocusAreaObjectiveSummary(focusArea.getObjective());
            focusAreaReport.setFocusAreaDescriptionSummary(focusArea.getDescription());
            focusAreaReport.setFocusAreaCriteria(focusArea.getCriteria());
            focusAreaReport.setIsParent(focusArea.getIsParent());
            focusAreaReport.setParentFocusAreaId(focusArea.getParent() == null ? null : focusArea.getParent().getId().toString());
            focusAreaReportList.add(focusAreaReport);
        }
        
        logger.debug("Completed focus area report list with {} entries", focusAreaReportList.size());
        return focusAreaReportList;
    }

    public List<Report.FocusAreaReport> getFocusAreaReportListForClone(List<FocusArea> focusAreas, HashMap<String, Report.FocusAreaReport> existing){
        logger.debug("Creating cloned focus area report list for {} focus areas with {} existing reports", focusAreas.size(), existing.size());
        List<Report.FocusAreaReport> focusAreaReportList = new ArrayList<>();
        for(FocusArea focusArea : focusAreas) {
            String focusAreaId = focusArea.getId().toString();
            if (existing.containsKey(focusAreaId)) {
                logger.debug("Using existing focus area report for: {} ({})", focusArea.getName(), focusAreaId);
                focusAreaReportList.add(existing.get(focusAreaId));
            } else {
                logger.debug("Creating new focus area report for: {} ({})", focusArea.getName(), focusAreaId);
                Report.FocusAreaReport focusAreaReport = new Report.FocusAreaReport();
                focusAreaReport.setFocusAreaId(focusAreaId);
                focusAreaReport.setName(focusArea.getName());
                focusAreaReport.setFocusAreaObjectiveSummary(focusArea.getObjective());
                focusAreaReport.setFocusAreaDescriptionSummary(focusArea.getDescription());
                focusAreaReportList.add(focusAreaReport);
            }
        }
        logger.debug("Completed cloned focus area report list with {} entries", focusAreaReportList.size());
        return focusAreaReportList;
    }

    private ClientReport getClientReport(Client client, List<FocusArea> focusAreas, CoachingProgram coachingProgram){
        logger.debug("Creating client report for client ID: {} in program: {}", client.getId(), coachingProgram.getId());
        ClientReport clientReport = new ClientReport();
        ClientReport.Client clientObject = new ClientReport.Client(client.getId().toString(), client.fullName());
        clientReport.setClient(clientObject);

        HashMap<String,FocusArea> focusAreaMap = new HashMap<>();
        focusAreas.forEach(focusArea -> focusAreaMap.put(focusArea.getId().toString(), focusArea));

        List<ClientReport.ClientFocusAreaReport> focusAreaReportList = new ArrayList<>();
        logger.debug("Processing {} focus areas for client report", focusAreas.size());
        for(FocusArea focusArea : focusAreas) {
            logger.debug("Processing focus area ID: {} name: {} for client ID: {}",
                    focusArea.getId(), focusArea.getName(), client.getId());
            ClientReport.ClientFocusAreaReport focusAreaReport = new ClientReport.ClientFocusAreaReport();
            ClientReport.FocusAreaImprovementGraph focusAreaImprovementGraph = getFocusAreaImprovementGraphForClient(client, focusArea, coachingProgram);
            focusAreaReport.setFocusAreaId(focusArea.getId().toString());
            focusAreaReport.setClientId(client.getId().toString());
            focusAreaReport.setFocusAreaImprovementGraph(focusAreaImprovementGraph);
            focusAreaReport.setFocusAreaImprovementSummary(getFocusAreaImprovementSummaryForClient(focusAreaImprovementGraph, focusArea.getId().toString(), client));
            focusAreaReportList.add(focusAreaReport);
        }
        clientReport.setFocusAreas(focusAreaReportList);
        logger.debug("Added {} focus area reports to client report", focusAreaReportList.size());

        clientReport.setImprovementGraph(getImprovementRadarGraph(focusAreaReportList, focusAreaMap));
        clientReport.setPeerReviewComparisonGraph(getPeerReviewComparisonRadarGraph(focusAreaReportList, focusAreaMap));
        logger.debug("Completed client report for client ID: {}", client.getId());
        return clientReport;
    }

    private ClientReport getClientReportForClone(Client client, List<FocusArea> focusAreas, CoachingProgram coachingProgram, HashMap<String, ClientReport> existingClientReportMap, HashMap<String, ClientReport.ClientFocusAreaReport> existingFocusAreas ){
        logger.debug("Creating cloned client report for client ID: {} in program: {} with {} existing focus areas",
                client.getId(), coachingProgram.getId(), existingFocusAreas.size());
        ClientReport clientReport = new ClientReport();
        ClientReport.Client clientObject = new ClientReport.Client(client.getId().toString(), client.fullName());
        clientReport.setClient(clientObject);
        clientReport.setImprovementGraph(existingClientReportMap.get(client.getId().toString()).getImprovementGraph());
        clientReport.setPeerReviewComparisonGraph(existingClientReportMap.get(client.getId().toString()).getPeerReviewComparisonGraph());

        List<ClientReport.ClientFocusAreaReport> focusAreaReportList = new ArrayList<>();
        logger.debug("Processing {} focus areas for cloned client report", focusAreas.size());
        for(FocusArea focusArea : focusAreas) {
            if(existingFocusAreas.containsKey(client.getId().toString() + focusArea.getId().toString())){
                logger.debug("Using existing focus area report for client ID: {} and focus area ID: {}", client.getId(), focusArea.getId());
                focusAreaReportList.add(existingFocusAreas.get(client.getId().toString() + focusArea.getId().toString()));
            } else {
                logger.debug("Creating new focus area report for client ID: {} and focus area: {} ({})",
                        client.getId(), focusArea.getName(), focusArea.getId());
                ClientReport.ClientFocusAreaReport focusAreaReport = new ClientReport.ClientFocusAreaReport();
                ClientReport.FocusAreaImprovementGraph focusAreaImprovementGraph = getFocusAreaImprovementGraphForClient(client, focusArea, coachingProgram);
                focusAreaReport.setFocusAreaId(focusArea.getId().toString());
                focusAreaReport.setClientId(client.getId().toString());
                focusAreaReport.setFocusAreaImprovementGraph(focusAreaImprovementGraph);
                focusAreaReport.setFocusAreaImprovementSummary(getFocusAreaImprovementSummaryForClient(focusAreaImprovementGraph, focusArea.getId().toString(), client));
                focusAreaReportList.add(focusAreaReport);
            }
        }
        clientReport.setFocusAreas(focusAreaReportList);
        logger.debug("Added {} focus area reports to cloned client report", focusAreaReportList.size());
        logger.debug("Completed cloned client report for client ID: {}", client.getId());
        return clientReport;
    }

    public String getFocusAreaImprovementSummaryForClient(ClientReport.FocusAreaImprovementGraph focusAreaImprovementGraph, String focusAreaId, Client client){

        if(focusAreaImprovementGraph.isEmpty()) {
            return "No evaluation data available for this focus area.";
        }

        return evaluationService.getFocusAreaImprovementSummary(focusAreaImprovementGraph, focusAreaId, client);

    }

    public ClientReport.FocusAreaImprovementGraph getFocusAreaImprovementGraphForClient(Client client, FocusArea focusArea, CoachingProgram coachingProgram){

        List<String> types = List.of("survey", "peer");

        ClientReport.FocusAreaImprovementGraph focusAreaImprovementGraph = new ClientReport.FocusAreaImprovementGraph();
        focusAreaImprovementGraph.setLabel("Focus Area Growth For " + focusArea.getName());
        focusAreaImprovementGraph.setMinScore(focusArea.getEval().getMinScore());
        focusAreaImprovementGraph.setMaxScore(focusArea.getEval().getMaxScore());

        focusAreaImprovementGraph.setThreshold1(focusArea.getEval().getThreshold1());
        focusAreaImprovementGraph.setThreshold2(focusArea.getEval().getThreshold2());
        focusAreaImprovementGraph.setThreshold3(focusArea.getEval().getThreshold3());

        focusAreaImprovementGraph.setTypes(types);
        focusAreaImprovementGraph.setSelectedTypes(types);

        //For Survey
        List<ProgramMilestone> milestones = programMilestoneRepository.findAllByCoachingProgramId(coachingProgram.getId());
        milestones = milestones.stream().filter(ml -> ml.getType().equals(MilestoneType.SURVEY) || ml.getType().equals(MilestoneType.PEER_REVIEW)).sorted(Comparator.comparing(ProgramMilestone::getIndex)).toList();

        AtomicInteger index = new AtomicInteger();
        List<Integer> selectedIndices = new ArrayList<>();

        List<ClientReport.DataPoint> clientResponseDataPoints = milestones.stream().map(ml -> {

            ClientReport.DataPoint dataPoint = null;

            if(ml.getType().equals(MilestoneType.SURVEY)) {
                dataPoint =  getFocusAreaImprovementGraphDataPointForSurvey(client, ml, focusArea, index);
            } else if (ml.getType().equals(MilestoneType.PEER_REVIEW)) {
                dataPoint =  getFocusAreaImprovementGraphDataPointForPeerReview(client, ml, focusArea, index);
            }

            if (dataPoint == null) return null;

            selectedIndices.add(index.getAndIncrement());

            dataPoint.setScore(getNormalizedScore(focusArea.getEval().getMinScore(), focusArea.getEval().getMaxScore(), dataPoint.getMinScore(), dataPoint.getMaxScore(), dataPoint.getScore()));
            dataPoint.setMinScore(focusArea.getEval().getMinScore());
            dataPoint.setMaxScore(focusArea.getEval().getMaxScore());

            return dataPoint;

        }).filter(dp -> !(dp == null)).toList();

        focusAreaImprovementGraph.setDataPoints(clientResponseDataPoints);
        focusAreaImprovementGraph.setSelectedIndices(selectedIndices);

        return focusAreaImprovementGraph;
    }

    public ClientReport.DataPoint getFocusAreaImprovementGraphDataPointForSurvey(Client client, ProgramMilestone ml, FocusArea focusArea, AtomicInteger index) {

        Optional<SurveyResponse> surveyResponseOptional = surveyResponseRepository.findLatestBySurveyIdAndClientId(ml.getSurvey().getId(), client.getId());
        if (surveyResponseOptional.isEmpty()) return null;

        SurveyResponse surveyResponse = surveyResponseOptional.get();
        SurveyResponse.ResponseEvaluation responseEvaluation = surveyResponse.getEvaluation();

        List<SurveyResponse.EvaluationFocusArea> evaluationFocusAreaList = responseEvaluation.getFocusAreas().stream().filter(efa -> efa.getFocusAreaId().equalsIgnoreCase(focusArea.getId().toString())).toList();
        if (evaluationFocusAreaList.isEmpty()) return null;

        SurveyResponse.EvaluationFocusArea evaluationFocusArea = evaluationFocusAreaList.get(0);

        ClientReport.DataPoint dataPoint = new ClientReport.DataPoint();
        dataPoint.setType("survey");
        dataPoint.setLabel("Evaluation " + (index.get() + 1));
        dataPoint.setIndex(index.get());
        dataPoint.setMaxScore(evaluationFocusArea.getMaxScore());
        dataPoint.setMinScore(evaluationFocusArea.getMinScore());
        dataPoint.setScore(evaluationFocusArea.getScore());

        return dataPoint;

    }

    public ClientReport.DataPoint getFocusAreaImprovementGraphDataPointForPeerReview(Client client, ProgramMilestone ml, FocusArea focusArea, AtomicInteger index) {

        MilestoneTracker milestoneTracker = milestoneTrackerRepository.findByProgramMilestone_IdAndCoachingSession_Client_Id(ml.getId(), client.getId())
                .orElseThrow(() -> {
                    logger.error("Milestone tracker not found for client ID: {} and milestone ID {}", client.getId(), ml.getId());
                    return new RuntimeException("Milestone Tracker not found");
                });

        PeerReview peerReview = peerReviewRepository.findByMilestoneTracker_Id(milestoneTracker.getId())
                .orElseThrow(() -> {
                    logger.error("Peer Review not found for milestone tracker ID {}", milestoneTracker.getId());
                    return new RuntimeException("Peer Review not found");
                });

        List<SurveyResponse> surveyResponseList = surveyResponseRepository.findByPeerReview_Id(peerReview.getId());

        if (surveyResponseList.isEmpty()) return null;

        ClientReport.DataPoint dataPoint = new ClientReport.DataPoint();
        dataPoint.setType("peer");
        dataPoint.setLabel("Evaluation " + (index.get() + 1));
        dataPoint.setIndex(index.get());

        Double maxScore = 0.0;
        Double minScore = 0.0;
        Double score = 0.0;

        for (SurveyResponse surveyResponse : surveyResponseList) {
            SurveyResponse.ResponseEvaluation responseEvaluation = surveyResponse.getEvaluation();

            List<SurveyResponse.EvaluationFocusArea> evaluationFocusAreaList = responseEvaluation.getFocusAreas().stream().filter(efa -> efa.getFocusAreaId().equalsIgnoreCase(focusArea.getId().toString())).toList();
            if (evaluationFocusAreaList.isEmpty()) return null;

            SurveyResponse.EvaluationFocusArea evaluationFocusArea = evaluationFocusAreaList.get(0);

            maxScore += evaluationFocusArea.getMaxScore();
            minScore += evaluationFocusArea.getMinScore();
            score += evaluationFocusArea.getScore();

        }

        dataPoint.setMaxScore(maxScore);
        dataPoint.setMinScore(minScore);
        dataPoint.setScore(score);

        return dataPoint;
    }

    public ClientReport.RadarGraph getImprovementRadarGraph(List<ClientReport.ClientFocusAreaReport> focusAreaReportList, HashMap<String,FocusArea> focusAreaMap){
        logger.debug("Creating improvement radar graph for {} focus areas", focusAreaReportList.size());
        ClientReport.RadarGraph radarGraph = new ClientReport.RadarGraph();
        radarGraph.setLabel("Development Progress Across Key Focus Areas");

        radarGraph.setMinScore(0.0);
        radarGraph.setMaxScore(100.0);
        radarGraph.setThreshold1(20.0);
        radarGraph.setThreshold2(50.0);
        radarGraph.setThreshold3(80.0);
        radarGraph.setFocusAreas(focusAreaMap.values().stream().map(FocusArea::getHierarchicalName).toList());
        logger.debug("Set radar graph thresholds and score ranges");

        ClientReport.RadarLine line1 = new ClientReport.RadarLine();
        line1.setLabel("Initial Assessment Scores");
        logger.debug("Creating initial assessment scores line");

        List<ClientReport.RadarFocusArea> radarFocusAreas1 = focusAreaReportList.stream()
                        .map(cfar -> {
                            String focusAreaId = cfar.getFocusAreaId();
                            String focusAreaName = focusAreaMap.get(focusAreaId).getHierarchicalName();
                            logger.debug("Processing focus area: {} ({})", focusAreaName, focusAreaId);
                            
                            ClientReport.RadarFocusArea radarFocusArea = new ClientReport.RadarFocusArea();
                            radarFocusArea.setLabel(focusAreaName);
                            radarFocusArea.setSelectedIndex(0);
                            
                            List<ClientReport.RadarDataPoint> dataPoints = cfar.getFocusAreaImprovementGraph().getDataPoints()
                                    .stream().filter(dp -> "survey".equalsIgnoreCase(dp.getType())).map(cdp -> {
                                        ClientReport.RadarDataPoint dataPoint = new ClientReport.RadarDataPoint();
                                        dataPoint.setLabel(cdp.getLabel());
                                        double score = getNormalizedScore(radarGraph.getMinScore(),
                                                                            radarGraph.getMaxScore(),
                                                                            cdp.getMinScore(),
                                                                         cdp.getMaxScore(), 
                                                                         cdp.getScore());
                                        dataPoint.setScore(score);
                                        logger.debug("Focus area: {}, data point label: {}, normalized score: {}",
                                                    focusAreaName, cdp.getLabel(), score);
                                        return dataPoint;
                                    }).toList();
                            radarFocusArea.setDataPoints(dataPoints);
                            logger.debug("Added {} data points for focus area: {}", dataPoints.size(), focusAreaName);
                            return radarFocusArea;
                        }).toList();

        line1.setFocusAreas(radarFocusAreas1);
        radarGraph.setLine1(line1);
        logger.debug("Completed initial assessment scores line with {} focus areas", radarFocusAreas1.size());

        ClientReport.RadarLine line2 = new ClientReport.RadarLine();
        line2.setLabel("Latest Assessment Scores");
        logger.debug("Creating latest assessment scores line");

        List<ClientReport.RadarFocusArea> radarFocusAreas2 = focusAreaReportList.stream()
                .map(cfar -> {
                    String focusAreaId = cfar.getFocusAreaId();
                    String focusAreaName = focusAreaMap.get(focusAreaId).getHierarchicalName();
                    logger.debug("Processing focus area: {} ({})", focusAreaName, focusAreaId);
                    
                    ClientReport.RadarFocusArea radarFocusArea = new ClientReport.RadarFocusArea();
                    radarFocusArea.setLabel(focusAreaName);
                    radarFocusArea.setSelectedIndex(0);
                    
                    List<ClientReport.RadarDataPoint> dataPoints = cfar.getFocusAreaImprovementGraph().getDataPoints()
                            .stream().filter(dp -> "survey".equalsIgnoreCase(dp.getType())).map(cdp -> {
                                ClientReport.RadarDataPoint dataPoint = new ClientReport.RadarDataPoint();
                                dataPoint.setLabel(cdp.getLabel());
                                double score = getNormalizedScore(radarGraph.getMinScore(),
                                                                    radarGraph.getMaxScore(),
                                                                    cdp.getMinScore(),
                                                                 cdp.getMaxScore(), 
                                                                 cdp.getScore());
                                dataPoint.setScore(score);
                                logger.debug("Focus area: {}, data point label: {}, normalized score: {}",
                                            focusAreaName, cdp.getLabel(), score);
                                return dataPoint;
                            }).collect(Collectors.toList());

                    Collections.reverse(dataPoints);

                    radarFocusArea.setDataPoints(dataPoints);
                    logger.debug("Added {} data points for focus area: {}", dataPoints.size(), focusAreaName);
                    return radarFocusArea;
                }).toList();

        line2.setFocusAreas(radarFocusAreas2);
        radarGraph.setLine2(line2);
        logger.debug("Completed latest assessment scores line with {} focus areas", radarFocusAreas2.size());

        logger.debug("Completed improvement radar graph construction");
        return radarGraph;
    }

    public ClientReport.RadarGraph getPeerReviewComparisonRadarGraph(List<ClientReport.ClientFocusAreaReport> focusAreaReportList, HashMap<String,FocusArea> focusAreaMap){
        logger.debug("Creating peer review comparison radar graph for {} focus areas", focusAreaReportList.size());
        ClientReport.RadarGraph radarGraph = new ClientReport.RadarGraph();
        radarGraph.setLabel("Comparison Of Key Focus Areas With Peer Assessment");

        radarGraph.setMinScore(0.0);
        radarGraph.setMaxScore(100.0);
        radarGraph.setThreshold1(20.0);
        radarGraph.setThreshold2(50.0);
        radarGraph.setThreshold3(80.0);
        radarGraph.setFocusAreas(focusAreaMap.values().stream().map(FocusArea::getHierarchicalName).toList());
        logger.debug("Set radar graph thresholds and score ranges");

        ClientReport.RadarLine line1 = new ClientReport.RadarLine();
        line1.setLabel("Self Assessment Scores");
        logger.debug("Creating self assessment scores line");

        List<ClientReport.RadarFocusArea> radarFocusAreas1 = focusAreaReportList.stream()
                .map(cfar -> {
                    String focusAreaId = cfar.getFocusAreaId();
                    String focusAreaName = focusAreaMap.get(focusAreaId).getHierarchicalName();
                    logger.debug("Processing focus area: {} ({})", focusAreaName, focusAreaId);
                    
                    ClientReport.RadarFocusArea radarFocusArea = new ClientReport.RadarFocusArea();
                    radarFocusArea.setLabel(focusAreaName);
                    radarFocusArea.setSelectedIndex(0);
                    
                    List<ClientReport.RadarDataPoint> dataPoints = cfar.getFocusAreaImprovementGraph().getDataPoints()
                            .stream().filter(dp -> "survey".equalsIgnoreCase(dp.getType())).map(cdp -> {
                                ClientReport.RadarDataPoint dataPoint = new ClientReport.RadarDataPoint();
                                dataPoint.setLabel(cdp.getLabel());

                                double score = getNormalizedScore(radarGraph.getMinScore(),
                                                                 radarGraph.getMaxScore(),
                                                                 cdp.getMinScore(), 
                                                                 cdp.getMaxScore(), 
                                                                 cdp.getScore());
                                dataPoint.setScore(score);

                                logger.debug("Focus area: {}, data point label: {}, normalized score: {}",
                                            focusAreaName, cdp.getLabel(), score);
                                return dataPoint;
                            }).collect(Collectors.toList());

                    Collections.reverse(dataPoints);
                    radarFocusArea.setDataPoints(dataPoints);
                    logger.debug("Added {} data points for focus area: {}", dataPoints.size(), focusAreaName);
                    return radarFocusArea;
                }).toList();

        line1.setFocusAreas(radarFocusAreas1);
        radarGraph.setLine1(line1);
        logger.debug("Completed self assessment scores line with {} focus areas", radarFocusAreas1.size());

        ClientReport.RadarLine line2 = new ClientReport.RadarLine();
        line2.setLabel("Peer Review Scores");
        logger.debug("Creating peer review scores line");

        List<ClientReport.RadarFocusArea> radarFocusAreas2 = focusAreaReportList.stream()
                .map(cfar -> {
                    String focusAreaId = cfar.getFocusAreaId();
                    String focusAreaName = focusAreaMap.get(focusAreaId).getHierarchicalName();
                    logger.debug("Processing focus area: {} ({})", focusAreaName, focusAreaId);
                    
                    ClientReport.RadarFocusArea radarFocusArea = new ClientReport.RadarFocusArea();
                    radarFocusArea.setLabel(focusAreaName);
                    radarFocusArea.setSelectedIndex(0);
                    
                    List<ClientReport.RadarDataPoint> dataPoints = cfar.getFocusAreaImprovementGraph().getDataPoints()
                            .stream().filter(dp -> "peer".equalsIgnoreCase(dp.getType())).map(cdp -> {
                                ClientReport.RadarDataPoint dataPoint = new ClientReport.RadarDataPoint();
                                dataPoint.setLabel(cdp.getLabel());
                                double score = getNormalizedScore(radarGraph.getMinScore(),
                                                                  radarGraph.getMaxScore(),
                                                                  cdp.getMinScore(),
                                                                 cdp.getMaxScore(), 
                                                                 cdp.getScore());
                                dataPoint.setScore(score);
                                logger.debug("Focus area: {}, data point label: {}, normalized score: {}",
                                            focusAreaName, cdp.getLabel(), score);
                                return dataPoint;
                            }).collect(Collectors.toList());

                    Collections.reverse(dataPoints);
                    radarFocusArea.setDataPoints(dataPoints);
                    logger.debug("Added {} data points for focus area: {}", dataPoints.size(), focusAreaName);
                    return radarFocusArea;
                }).toList();

        line2.setFocusAreas(radarFocusAreas2);
        radarGraph.setLine2(line2);
        logger.debug("Completed peer review scores line with {} focus areas", radarFocusAreas2.size());

        logger.debug("Completed peer review comparison radar graph construction");
        return radarGraph;
    }

    public Double getNormalizedScore(Double globalMin, Double globalMax, Double localMin, Double localMax, Double score){

        //    1. Factor = ((maxScore - minScore)/(dataPoint.maxScore - dataPoint.minScore))
        //    2. Final Score = (dataPoint.score * Factor) - (dataPoint.minScore * Factor) + minScore
        Double factor = ((globalMax - globalMin)/(localMax - localMin));
        Double result = (score * factor) - (localMin * factor) + globalMin;

        logger.info("Normalization : CFAR Min Score - {} CFAR Max Score - {} CDP Min Score - {} CDP Max Score - {} CDP SCORE - {} Normalized Score - {}",
                globalMin,
                globalMax,
                localMin,
                localMax,
                score,
                result);

        return result;
    }

    public String getReportConclusion(CoachingProgram coachingProgram){
        return "";
    }

    public String getReportProgramObjective(CoachingProgram coachingProgram){
        return "";
    }

}
