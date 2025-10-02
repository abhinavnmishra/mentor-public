package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.llm.Reports.pojo.ChatItem;
import org.cortex.backend.llm.pojo.PromptDto;
import org.cortex.backend.model.FocusArea;
import org.cortex.backend.model.Report;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ReportDto {

    private String id;
    private Boolean published;
    private ExecutiveSummary executiveSummary;
    private List<ClientImprovementSummary> improvementSummaries;
    private List<FocusAreaReport> focusAreas;
    private String conclusion;
    private List<ClientDto> clients;
    private List<ChatItem> chatItems;
    private PromptDto promptDto;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientDto {
        private String id;
        private String name;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExecutiveSummary {
        private String programName;
        private String programDescription;
        private String programObjective;
        private String aboutTheTrainer;

        @JsonIgnore
        public String getContent() {

            return """
                    
                    <section>
                    
                    <heading><<program_name>></heading>
                    
                    <content><<program_description>></content>
                    
                    </section>
                    
                    <section>
                    
                    <heading>Program Objective</heading>
                    
                    <content><<program_objective>></content>
                    
                    </section>
                    
                    <section>
                    
                    <heading>About The Trainer</heading>
                    
                    <content><<about_trainer>></content>
                    
                    </section>
                    
                    """.replaceAll("<<program_name>>", this.programName != null ? this.programName : "")
                    .replaceAll("<<program_description>>", this.programDescription != null ? this.programDescription : "")
                    .replaceAll("<<program_objective>>", this.programObjective != null ? this.programObjective : "")
                    .replaceAll("<<about_trainer>>", this.aboutTheTrainer != null ? this.aboutTheTrainer : "");
        }

    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientImprovementSummary {
        private String clientId;
        private ClientReport.RadarGraph improvementGraph;
        private ClientReport.RadarGraph peerReviewComparisonGraph;

        @JsonIgnore
        public String getContent() {
            return """
                    
                    <section>
                    
                    <heading>Improvement Graph Across Focus Areas</heading>
                    
                    <image>
                    <image_url><<image_url_improvementGraph>></image_url>
                    <image_title>The radar graph compares how the mentee performs in various focus areas now with the scores from very initial assessments.</image_title>
                    </image>
                                        
                    </section>
                    
                    <section>
                    
                    <heading>Peer Review Comparison Graph Across Focus Areas</heading>
                    
                    <image>
                    <image_url><<image_url_peerReviewComparisonGraph>></image_url>
                    <image_title>The radar graph compares how the mentee performs in various focus areas with how their peer views it.</image_title>
                    </image>
                    
                    </section>
                    
                    """;
        }

        @JsonIgnore
        public String getContentForImprovementGraph() {
            return """
                    <section>
                    
                    <heading>Improvement Graph Across Focus Areas</heading>
                    
                    <image>
                    <image_url><<image_url_improvementGraph>></image_url>
                    <image_title>The radar graph compares how the mentee performs in various focus areas now with the scores from very initial assessments.</image_title>
                    </image>
                                        
                    </section>
                    
                    """;
        }

        @JsonIgnore
        public String getContentForPeerComparisonGraph() {
            return """
                    <section>
                    
                    <heading>Peer Review Comparison Graph Across Focus Areas</heading>
                    
                    <image>
                    <image_url><<image_url_peerReviewComparisonGraph>></image_url>
                    <image_title>The radar graph compares how the mentee performs in various focus areas with how their peer views it.</image_title>
                    </image>
                    
                    </section>
                    
                    """;
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusAreaReport {
        private String id;
        private String name;
        private String focusAreaDescriptionSummary;
        private String focusAreaObjectiveSummary;
        private String focusAreaCriteria;
        private List<ClientFocusAreaReport> clientData;
        private FocusArea.Eval eval;
        private Boolean isParent;
        private String parentFocusAreaId;

        @JsonIgnore
        public String getContent() {
            return """
                    
                    <section>
                    
                    <heading><<focus_area_name>></heading>
                    
                    <content><<focus_area_description>></content>
                    
                    </section>
                    
                    <section>
                    
                    <heading>Objectives</heading>
                    
                    <content> <<focus_area_objectives>> </content>
                    
                    </section>
                    
                    <section>
                    
                    <heading>Evaluation Criteria</heading>
                    
                    <content><<focus_area_criteria>></content>
                    
                    </section>
                   
                    
                    """.replaceAll("<<focus_area_name>>", this.name != null ? this.name : "")
                    .replaceAll("<<focus_area_description>>", this.focusAreaDescriptionSummary != null ? this.focusAreaDescriptionSummary : "")
                    .replaceAll("<<focus_area_objectives>>", this.focusAreaObjectiveSummary != null ? this.focusAreaObjectiveSummary : "")
                    .replaceAll("<<focus_area_criteria>>", this.focusAreaCriteria != null ? this.focusAreaCriteria : "");
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientFocusAreaReport {
        private String clientId;
        private String focusAreaId;
        private String focusAreaImprovementSummary;
        private ClientReport.FocusAreaImprovementGraph focusAreaImprovementGraph;

        @JsonIgnore
        public String getContent() {
            return """
                    
                    <section>
                    
                    <heading>Focus Area Improvement Graph</heading>
                    
                    <image>
                    <image_url><<image_url_focusAreaImprovementGraph>></image_url>
                    <image_title>Focus Area Improvement Graph</image_title>
                    </image>
                    
                    </section>
                    
                    <section>
                    
                    <heading>Improvement Summary</heading>
                    
                    <content><<improvement_summary>></content>
                    
                    </section>
                    
                    """
                    .replaceAll("<<improvement_summary>>", this.focusAreaImprovementSummary != null ? this.focusAreaImprovementSummary : "");
        }
    }

    public static ReportDto fromEntity(Report report) {
        ReportDto dto = new ReportDto();

        // Set basic fields
        dto.setId(report.getId().toString());
        dto.setConclusion(report.getConclusion());
        dto.setPublished(report.getPublished());

        // Set executive summary
        ExecutiveSummary summary = new ExecutiveSummary(
            report.getProgramName(),
            report.getProgramDescription(),
            report.getProgramObjective(),
            report.getAboutTheTrainer()
        );
        dto.setExecutiveSummary(summary);

        // Create client list from client reports
        List<ClientDto> clients = report.getClientReportList().stream()
            .map(cr -> {
                ClientReport.Client clientInfo = cr.getClient();
                return new ClientDto(
                    clientInfo.getClientId(),
                    clientInfo.getClientName()
                );
            })
            .collect(Collectors.toList());
        dto.setClients(clients);

        // Create client list from client reports
        List<ClientImprovementSummary> clientImprovementSummaryList = report.getClientReportList().stream()
                .map(cr -> {
                    return new ClientImprovementSummary(
                            cr.getClient().getClientId(),
                            cr.getImprovementGraph(),
                            cr.getPeerReviewComparisonGraph()
                    );
                })
                .collect(Collectors.toList());
        dto.setImprovementSummaries(clientImprovementSummaryList);


        // Process focus areas
        Map<String, List<ClientReport.ClientFocusAreaReport>> clientFocusAreaMap = new HashMap<>();
        report.getClientReportList().forEach(cr -> {
            cr.getFocusAreas().forEach(fa -> {
                clientFocusAreaMap.computeIfAbsent(fa.getFocusAreaId(), k -> new ArrayList<>()).add(fa);
            });
        });

        List<FocusAreaReport> focusAreaReports = report.getFocusAreas().stream()
            .map(fa -> {
                List<ClientFocusAreaReport> clientData = clientFocusAreaMap
                    .getOrDefault(fa.getFocusAreaId(), new ArrayList<>())
                    .stream()
                    .map(cfa -> new ClientFocusAreaReport(
                        cfa.getClientId(),
                        cfa.getFocusAreaId(),
                        cfa.getFocusAreaImprovementSummary(),
                        cfa.getFocusAreaImprovementGraph()
                    ))
                    .collect(Collectors.toList());

                return new FocusAreaReport(
                    fa.getFocusAreaId(),
                    fa.getName(),
                    fa.getFocusAreaDescriptionSummary(),
                    fa.getFocusAreaObjectiveSummary(),
                    fa.getFocusAreaCriteria(),
                    clientData,
                    fa.getEval(),
                        fa.getIsParent(),
                        fa.getParentFocusAreaId()
                );
            })
            .collect(Collectors.toList());
        dto.setFocusAreas(focusAreaReports);
        dto.setChatItems(report.getReportWizardChat() == null ? List.of(new ChatItem("assistant", "Error loading messages")): (report.getReportWizardChat().getChats(Report.chatCount)));

        return dto;
    }

    public Report toEntity() {
        Report report = new Report();

        // Set basic fields
        if (this.id != null) {
            report.setId(UUID.fromString(this.id));
        }
        report.setConclusion(this.conclusion);

        // Set program details from executive summary
        if (this.executiveSummary != null) {
            report.setProgramName(this.executiveSummary.getProgramName());
            report.setProgramDescription(this.executiveSummary.getProgramDescription());
            report.setProgramObjective(this.executiveSummary.getProgramObjective());
            report.setAboutTheTrainer(this.executiveSummary.getAboutTheTrainer());
        }

        // Convert focus areas
        if (this.focusAreas != null) {
            List<Report.FocusAreaReport> focusAreaReports = this.focusAreas.stream()
                .map(fa -> new Report.FocusAreaReport(
                    fa.getId(),
                    fa.getName(),
                    fa.getFocusAreaDescriptionSummary(),
                    fa.getFocusAreaObjectiveSummary(),
                        fa.getFocusAreaCriteria(),
                        fa.getEval(),
                        fa.getIsParent(),
                        fa.getParentFocusAreaId()
                ))
                .collect(Collectors.toList());
            report.setFocusAreas(focusAreaReports);
        }

        HashMap<String, ClientImprovementSummary> clientImprovementSummaryHashMap = new HashMap<>();
        for(ClientImprovementSummary improvementSummary : this.improvementSummaries) {
            clientImprovementSummaryHashMap.put(improvementSummary.getClientId(), improvementSummary);
        }

        // Create client reports
        if (this.clients != null && this.focusAreas != null) {
            List<ClientReport> clientReports = this.clients.stream()
                .map(client -> {
                    ClientReport clientReport = new ClientReport();
                    ClientReport.Client clientInfo = new ClientReport.Client(client.getId(), client.getName());
                    clientReport.setClient(clientInfo);
                    clientReport.setImprovementGraph(clientImprovementSummaryHashMap.get(client.getId()).getImprovementGraph());
                    clientReport.setPeerReviewComparisonGraph(clientImprovementSummaryHashMap.get(client.getId()).getPeerReviewComparisonGraph());

                    // Map focus area client data
                    List<ClientReport.ClientFocusAreaReport> focusAreaReports = this.focusAreas.stream()
                        .filter(fa -> fa.getClientData() != null)
                        .flatMap(fa -> fa.getClientData().stream()
                            .filter(cd -> cd.getClientId().equals(client.getId()))
                            .map(cd -> new ClientReport.ClientFocusAreaReport(
                                cd.getFocusAreaId(),
                                cd.getClientId(),
                                cd.getFocusAreaImprovementSummary(),
                                cd.getFocusAreaImprovementGraph()
                            )))
                        .collect(Collectors.toList());
                    clientReport.setFocusAreas(focusAreaReports);

                    return clientReport;
                })
                .collect(Collectors.toList());
            report.setClientReportList(clientReports);
        }

        return report;
    }

}
