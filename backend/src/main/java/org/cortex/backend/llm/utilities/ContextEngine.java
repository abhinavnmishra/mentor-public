package org.cortex.backend.llm.utilities;

import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class ContextEngine {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private ClientOrganisationRepository clientOrganisationRepository;

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
    private TrainerOrganisationRepository trainerOrganisationRepository;

    @Autowired
    private PeerReviewRepository peerReviewRepository;


    //get program context by program ID (program specific metadata)
    @Cacheable(value = "ProgramContext", key = "#id")
    public String getProgramContext(String id){
        try {
            CoachingProgram coachingProgram = coachingProgramRepository.findById(UUID.fromString(id)).orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
            return """
                    Below are the details of this coaching program :
                    <<>>
                    """.replace("<<>>", coachingProgram.getContext());
        } catch (Exception e){
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "ProgramContext", key = "#id")
    public String updateProgramContext(String id){
        return getProgramContext(id);
    }

    //get focus area context by focus area ID (focus area specific metadata)
    @Cacheable(value = "FocusAreaContext", key = "#id")
    public String getFocusAreaContext(String id) {
        try {
            return """
                    Below are the details of the focus area :
                    <<>>
                    """.replace("<<>>", focusAreaRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Focus Area Not Found"))
                    .getContext());
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "FocusAreaContext", key = "#id")
    public String updateFocusAreaContext(String id) {
        return getFocusAreaContext(id);
    }

    //get client context by client ID (client specific metadata)
    @Cacheable(value = "ClientContext", key = "#id")
    public String getClientContext(String id) {
        try {
            return """
                    Below are the details of the client/mentee :
                    <<>>
                    """.replace("<<>>", clientRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Client Not Found"))
                    .getContext());
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "ClientContext", key = "#id")
    public String updateClientContext(String id) {
        return getClientContext(id);
    }

    @CacheEvict(value = "ClientContext", key = "#id", allEntries = true )
    public void evictClientContext(String id) {
    }

    //get trainer context by trainer ID (trainer specific metadata)
    @Cacheable(value = "TrainerContext", key = "#id")
    public String getTrainerContext(String id) {
        try {
            return """
                    Below are the details of the trainer :
                    <<>>
                    """.replace("<<>>", trainerRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer Not Found"))
                    .getContext());
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "TrainerContext", key = "#id")
    public String updateTrainerContext(String id) {
        return getTrainerContext(id);
    }

    //get all focus areas context by program ID (focus area specific metadata)
    @Cacheable(value = "ProgramFocusAreasContext", key = "#programId")
    public String getAllFocusAreasByProgramContext(String programId) {
        try {
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                .orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
            StringBuilder context = new StringBuilder("[");
            if (program.getFocusAreas() != null && !program.getFocusAreas().isEmpty()) {
                program.getFocusAreas().forEach(area -> {
                    context.append(area.getContext()).append(",");
                });
                context.setLength(context.length() - 1); // Remove last comma
            }
            context.append("]");

            return """
                    Below are the details of the focus areas part of the coaching program :
                    <<>>
                    """.replace("<<>>",context.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ProgramFocusAreasContext", key = "#programId")
    public String updateAllFocusAreasByProgramContext(String programId) {
        return getAllFocusAreasByProgramContext(programId);
    }

    //get all milestones context by program ID (milestone specific metadata, no survey/activity)
    @Cacheable(value = "ProgramMilestonesContext", key = "#programId")
    public String getAllMilestonesByProgramContext(String programId) {
        try {
            List<ProgramMilestone> milestones = programMilestoneRepository.findAllByCoachingProgramId(UUID.fromString(programId));
            StringBuilder context = new StringBuilder("[");
            if (!milestones.isEmpty()) {
                milestones.forEach(milestone -> {
                    context.append(milestone.getContext()).append(",");
                });
                context.setLength(context.length() - 1); // Remove last comma
            }
            context.append("]");
            return """
                    Below are the details of the milestones of the coaching program :
                    <<>>
                    """.replace("<<>>", context.toString());

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ProgramMilestonesContext", key = "#programId")
    public String updateAllMilestonesByProgramContext(String programId) {
        return getAllMilestonesByProgramContext(programId);
    }

    //get trainer organisation context by trainer organisation ID (trainer organisation specific metadata)
    @Cacheable(value = "TrainerOrgContext", key = "#id")
    public String getTrainerOrganisationContext(String id) {
        try {
            return """
                    Below are the details of the Trainer Organisation using the tool :
                    <<>>
                    """.replace("<<>>", trainerOrganisationRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Trainer Organisation Not Found"))
                    .getContext());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "TrainerOrgContext", key = "#id")
    public String updateTrainerOrganisationContext(String id) {
        return getTrainerOrganisationContext(id);
    }

    //get all client context by program ID (client specific metadata)
    @Cacheable(value = "ProgramClientsContext", key = "#programId")
    public String getAllClientsByProgramContext(String programId) {
        try {
            List<CoachingSession> sessions = coachingSessionRepository.findByCoachingProgramId(UUID.fromString(programId));
            StringBuilder context = new StringBuilder("[");
            if (!sessions.isEmpty()) {
                sessions.forEach(session -> {
                    if (session.getClient() != null) {
                        context.append(session.getClient().getContext()).append(",");
                    }
                });
                if (context.charAt(context.length() - 1) == ',') {
                    context.setLength(context.length() - 1); // Remove last comma
                }
            }
            context.append("]");
            return """
                    Below are the details of all the clients/mentees who are part of the coaching program :
                    <<>>
                    """.replace("<<>>", context.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ProgramClientsContext", key = "#programId")
    public String updateAllClientsByProgramContext(String programId) {
        return getAllClientsByProgramContext(programId);
    }


    //get all client response summaries by client ID (client survey response summaries)
    @Cacheable(value = "ClientResponsesContext", key = "#clientId")
    public String getAllClientResponseSummariesByClientId(String clientId) {
        try {
            Client client = clientRepository.findById(UUID.fromString(clientId)).orElseThrow(() -> new ResourceNotFoundException("Client Not Found"));
            List<SurveyResponse> responses = surveyResponseRepository.findAllByClientId(client.getId());
            StringBuilder summaries = new StringBuilder("[");
            if (!responses.isEmpty()) {
                responses.forEach(response -> {
                    summaries.append("'").append(response.getEvaluation().getSurveyResponseSummary()).append("'").append(",");
                });
                summaries.setLength(summaries.length() - 1); // Remove last comma
            }
            summaries.append("]");
            return """
                    Below is the list of summaries of all the surveys and the responses provided by the client/mentee <<client>> :
                    <<>>
                    """.replace("<<>>", summaries.toString())
                        .replace("<<client>>", client.fullName() + "( " + client.getEmail() + " )");

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ClientResponsesContext", key = "#clientId")
    public String updateAllClientResponseSummariesByClientId(String clientId) {
        return getAllClientResponseSummariesByClientId(clientId);
    }

    @Cacheable(value = "ClientPeerReviewResponsesContext", key = "#peerReviewId")
    public String getAllClientPeerResponseSummariesByPeerReviewId(String peerReviewId) {
        try {
            PeerReview peerReview = peerReviewRepository.findById(UUID.fromString(peerReviewId)).orElseThrow(() -> new ResourceNotFoundException("Peer Review Not Found"));
            List<SurveyResponse> responses = surveyResponseRepository.findByPeerReview_Id(peerReview.getId());
            Client client = peerReview.getMilestoneTracker().getCoachingSession().getClient();
            StringBuilder summaries = new StringBuilder("[");
            if (!responses.isEmpty()) {
                responses.forEach(response -> {
                    summaries.append("'").append(response.getEvaluation().getSurveyResponseSummary()).append("'").append(",");
                });
                summaries.setLength(summaries.length() - 1); // Remove last comma
            }
            summaries.append("]");
            return """
                    Below is the list of summaries of all the surveys responses provided by the peers of the client/mentee <<client>> :
                    <<>>
                    """.replace("<<>>", summaries.toString())
                    .replace("<<client>>", client.fullName() + "( " + client.getEmail() + " )");

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ClientPeerReviewResponsesContext", key = "#peerReviewId")
    public String updateAllClientPeerResponseSummariesByPeerReviewId(String peerReviewId) {
        return getAllClientResponseSummariesByClientId(peerReviewId);
    }

    //get all focus areas context by milestone ID (focus area specific metadata)
    @Cacheable(value = "MilestoneFocusAreasContext", key = "#milestoneId")
    public String getAllFocusAreasByMilestoneContext(String milestoneId) {
        try {
            ProgramMilestone milestone = programMilestoneRepository.findById(UUID.fromString(milestoneId))
                .orElseThrow(() -> new ResourceNotFoundException("Milestone Not Found"));
            StringBuilder context = new StringBuilder("[");

            List<FocusArea> focusAreas = getAllFocusAreaFlat(milestone.getFocusAreas());

            if (focusAreas != null && !focusAreas.isEmpty()) {
                focusAreas.forEach(area -> {
                    context.append(area.getContext()).append(",");
                });
                context.setLength(context.length() - 1); // Remove last comma
            }
            context.append("]");
            return """
                    Below are the details of the focus areas that are part of the program milestone :
                    <<>>
                    """.replace("<<>>",context.toString());

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "MilestoneFocusAreasContext", key = "#milestoneId")
    public String updateAllFocusAreasByMilestoneContext(String milestoneId) {
        return getAllFocusAreasByMilestoneContext(milestoneId);
    }

    //get milestone context by milestone ID (milestone specific metadata)
    @Cacheable(value = "MilestoneContext", key = "#id")
    public String getMilestoneContext(String id) {
        try {
            return """
                    Below are the details of the program milestone :
                    <<>>
                    """.replace("<<>>",programMilestoneRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Milestone Not Found"))
                    .getContext());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "MilestoneContext", key = "#id")
    public String updateMilestoneContext(String id) {
        return getMilestoneContext(id);
    }

    //get survey context by survey ID (survey metadata)
    @Cacheable(value = "SurveyContext", key = "#id")
    public String getSurveyContext(String id) {
        try {
            return """
                    Below are the details of the survey :
                    <<>>
                    """.replace("<<>>",surveyRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Survey Not Found"))
                    .getIndexData());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "SurveyContext", key = "#id")
    public String updateSurveyContext(String id) {
        return getSurveyContext(id);
    }

    //get survey context by survey ID (survey metadata)
    @Cacheable(value = "SurveySummaryContext", key = "#id")
    public String getSurveySummaryContext(String id) {
        try {
            return """
                    Below is the summary of the survey :
                    <<>>
                    """.replace("<<>>",surveyRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Survey Not Found"))
                    .getSurveySummary());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "SurveySummaryContext", key = "#id")
    public String updateSurveySummaryContext(String id) {
        return getSurveyContext(id);
    }


    //get survey context with questions by survey ID (survey metadata)
    @Cacheable(value = "SurveyWithQuestionsContext", key = "#id")
    public String getSurveyWithQuestionsContext(String id) {
        try {
            return """
                    Below are the details of the survey :
                    <<>>
                    """.replace("<<>>",surveyRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Survey Not Found"))
                    .getContext());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "SurveyWithQuestionsContext", key = "#id")
    public String updateSurveyWithQuestionsContext(String id) {
        return getSurveyContext(id);
    }


    //get activity context by activity ID (activity specific metadata)
    @Cacheable(value = "ActivityContext", key = "#id")
    public String getActivityContext(String id) {
        try {
            return """
                    Below are the details of the activity :
                    <<>>
                    """.replace("<<>>",activityRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Activity Not Found"))
                    .getContext());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "ActivityContext", key = "#id")
    public String updateActivityContext(String id) {
        return getActivityContext(id);
    }

    //get client organisation context by client organisation ID (client organisation specific metadata)
    @Cacheable(value = "ClientOrgContext", key = "#id")
    public String getClientOrganisationContext(String id) {
        try {
            return """
                    Below are the details of the client organisation :
                    <<>>
                    """.replace("<<>>", clientOrganisationRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Client Organisation Not Found"))
                    .getContext());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "ClientOrgContext", key = "#id")
    public String updateClientOrganisationContext(String id) {
        return getClientOrganisationContext(id);
    }

    //get survey response summary by survey response ID (summarised survey response)
    @Cacheable(value = "SurveyResponseSummaryContext", key = "#id")
    public String getSurveyResponseSummaryContext(String id) {
        try {
            return """
                    Below is the summary of the survey response :
                    <<>>
                    """.replace("<<>>", surveyResponseRepository.findById(UUID.fromString(id))
                    .orElseThrow(() -> new ResourceNotFoundException("Survey Response Not Found"))
                    .getEvaluation().getSurveyResponseSummary());

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    @CachePut(value = "SurveyResponseSummaryContext", key = "#id")
    public String updateSurveyResponseSummaryContext(String id) {
        return getSurveyResponseSummaryContext(id);
    }



    @Cacheable(value = "ProgramMilestonesIndex", key = "#programId")
    public String getAllMilestonesIndexByProgram(String programId) {
        try {
            List<ProgramMilestone> milestones = programMilestoneRepository.findAllByCoachingProgramId(UUID.fromString(programId));
            StringBuilder context = new StringBuilder("[");
            if (!milestones.isEmpty()) {
                milestones.forEach(milestone -> {
                    context.append(milestone.getIndexData()).append(",");
                });
                context.setLength(context.length() - 1); // Remove last comma
            }
            context.append("]");
            return """
                    Below are the id, name and some details of all the milestones of the coaching program :
                    <<>>
                    """.replace("<<>>", context.toString());

        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ProgramMilestonesIndex", key = "#programId")
    public String updateAllMilestonesIndexByProgram(String programId) {
        return getAllMilestonesIndexByProgram(programId);
    }


    @Cacheable(value = "ProgramFocusAreasIndex", key = "#programId")
    public String getAllFocusAreasIndexByProgram(String programId) {
        try {
            CoachingProgram program = coachingProgramRepository.findById(UUID.fromString(programId))
                    .orElseThrow(() -> new ResourceNotFoundException("Program Not Found"));
            StringBuilder context = new StringBuilder("[");
            if (program.getFocusAreas() != null && !program.getFocusAreas().isEmpty()) {
                program.getFocusAreas().forEach(area -> {
                    context.append(area.getIndexData()).append(",");
                });
                context.setLength(context.length() - 1); // Remove last comma
            }
            context.append("]");

            return """
                    Below are the details of the focus areas part of the coaching program :
                    <<>>
                    """.replace("<<>>",context.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ProgramFocusAreasIndex", key = "#programId")
    public String updateAllFocusAreasIndexByProgram(String programId) {
        return getAllFocusAreasIndexByProgram(programId);
    }


    //get all client context by program ID (client specific metadata)
    @Cacheable(value = "ProgramClientsIndex", key = "#programId")
    public String getAllClientsIndexByProgram(String programId) {
        try {
            List<CoachingSession> sessions = coachingSessionRepository.findByCoachingProgramId(UUID.fromString(programId));
            StringBuilder context = new StringBuilder("[");
            if (!sessions.isEmpty()) {
                sessions.forEach(session -> {
                    if (session.getClient() != null) {
                        context.append(session.getClient().getIndexData()).append(",");
                    }
                });
                if (context.charAt(context.length() - 1) == ',') {
                    context.setLength(context.length() - 1); // Remove last comma
                }
            }
            context.append("]");
            return """
                    Below are the details of all the clients/mentees who are part of the coaching program :
                    <<>>
                    """.replace("<<>>", context.toString());
        } catch (Exception e) {
            e.printStackTrace();
            return "[]";
        }
    }

    @CachePut(value = "ProgramClientsIndex", key = "#programId")
    public String updateAllClientsIndexByProgram(String programId) {
        return getAllClientsIndexByProgram(programId);
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
