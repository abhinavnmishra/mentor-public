package org.cortex.backend.service;

import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import org.apache.commons.io.IOUtils;
import org.cortex.backend.dto.ClientReport;
import org.cortex.backend.dto.ReportDto;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.exception.ValidationException;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.exercises.repository.ExerciseResponseRepository;
import org.cortex.backend.model.*;
import org.cortex.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportViewGenerator {

    private static final Logger logger = LoggerFactory.getLogger(ReportViewGenerator.class);

    @Autowired
    private ReportViewRepository reportViewRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private ReportHtmlService reportHtmlService;

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private ExerciseResponseRepository exerciseResponseRepository;

    @Autowired
    private SurveyResponseRepository surveyResponseRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TrainerOrganisationRepository trainerOrganisationRepository;

    @Autowired
    private PublicAssetRepository publicAssetRepository;

    @Autowired
    private ResourceLoader resourceLoader;

    @Value("classpath:email_templates/report_published.html")
    private Resource publishReportResource;

    @Value("${app.base-url}")
    private String backendBaseUrl;

    private String publishReport;
    
    // Template containers loaded from HTML files
    private Map<String, ReportTemplate> templates = new HashMap<>();

    // Template container class
    public static class ReportTemplate {
        private String templateId;
        private String templateName;
        private String bodyContainer;
        private String sectionContainer;
        private String imageContainer;
        private String tableContainer;
        private String sectionRowContainer;
        private String pageRowContainer;

        // Getters and setters
        public String getTemplateId() { return templateId; }
        public void setTemplateId(String templateId) { this.templateId = templateId; }
        public String getTemplateName() { return templateName; }
        public void setTemplateName(String templateName) { this.templateName = templateName; }
        public String getBodyContainer() { return bodyContainer; }
        public void setBodyContainer(String bodyContainer) { this.bodyContainer = bodyContainer; }
        public String getSectionContainer() { return sectionContainer; }
        public void setSectionContainer(String sectionContainer) { this.sectionContainer = sectionContainer; }
        public String getImageContainer() { return imageContainer; }
        public void setImageContainer(String imageContainer) { this.imageContainer = imageContainer; }
        public String getTableContainer() { return tableContainer; }
        public void setTableContainer(String tableContainer) { this.tableContainer = tableContainer; }
        public String getSectionRowContainer() { return sectionRowContainer; }
        public void setSectionRowContainer(String sectionRowContainer) { this.sectionRowContainer = sectionRowContainer; }
        public String getPageRowContainer() { return pageRowContainer; }
        public void setPageRowContainer(String pageRowContainer) { this.pageRowContainer = pageRowContainer; }
    }

    @PostConstruct
    public void init() throws IOException {
        logger.info("Entering init - Loading email templates and report templates");
        try {
            logger.debug("Reading report publish template");
            publishReport = IOUtils.toString(publishReportResource.getInputStream(), StandardCharsets.UTF_8);

            // Load report templates
            loadReportTemplates();

            logger.info("Successfully loaded all email templates and report templates");
        } catch (IOException e) {
            logger.error("Failed to initialize templates: {}", e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting init");
        }
    }

    private void loadReportTemplates() throws IOException {
        logger.info("Loading report templates from classpath");
        
        // Load available templates
        String[] templateFiles = {"sample_mentorAI_report.html", "modern_template.html"};
        
        for (String templateFile : templateFiles) {
            try {
                Resource templateResource = resourceLoader.getResource("classpath:report_templates/" + templateFile);
                if (templateResource.exists()) {
                    String templateContent = IOUtils.toString(templateResource.getInputStream(), StandardCharsets.UTF_8);
                    ReportTemplate template = parseTemplate(templateContent);
                    if (template != null) {
                        templates.put(template.getTemplateId(), template);
                        logger.debug("Loaded template: {} - {}", template.getTemplateId(), template.getTemplateName());
                    }
                }
            } catch (IOException e) {
                logger.warn("Failed to load template {}: {}", templateFile, e.getMessage());
            }
        }
        
        logger.info("Loaded {} report templates", templates.size());
    }

    private ReportTemplate parseTemplate(String templateContent) {
        try {
            ReportTemplate template = new ReportTemplate();
            
            // Extract template ID and name
            template.setTemplateId(extractCommentValue(templateContent, "TEMPLATE_ID"));
            template.setTemplateName(extractCommentValue(templateContent, "TEMPLATE_NAME"));
            
            // Extract template sections
            template.setBodyContainer(extractSection(templateContent, "BODY_CONTAINER"));
            template.setSectionContainer(extractSection(templateContent, "SECTION_CONTAINER"));
            template.setImageContainer(extractSection(templateContent, "IMAGE_CONTAINER"));
            template.setTableContainer(extractSection(templateContent, "TABLE_CONTAINER"));
            template.setSectionRowContainer(extractSection(templateContent, "SECTION_ROW_CONTAINER"));
            template.setPageRowContainer(extractSection(templateContent, "PAGE_ROW_CONTAINER"));
            
            return template;
        } catch (Exception e) {
            logger.error("Failed to parse template: {}", e.getMessage());
            return null;
        }
    }

    private String extractCommentValue(String content, String commentKey) {
        String pattern = "<!-- " + commentKey + ": ([^\\s]+) -->";
        java.util.regex.Pattern regex = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher matcher = regex.matcher(content);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String extractSection(String content, String sectionName) {
        String startMarker = "<!-- " + sectionName + "_START -->";
        String endMarker = "<!-- " + sectionName + "_END -->";
        
        int startIndex = content.indexOf(startMarker);
        int endIndex = content.indexOf(endMarker);
        
        if (startIndex != -1 && endIndex != -1) {
            return content.substring(startIndex + startMarker.length(), endIndex).trim();
        }
        
        return "";
    }

    public Set<String> getAvailableTemplates() {
        return templates.keySet();
    }

    public ReportTemplate getTemplate(String templateId) {
        return templates.get(templateId);
    }

    public Map<String, String> getAvailableTemplatesWithNames() {
        Map<String, String> templateInfo = new HashMap<>();
        templates.forEach((id, template) -> templateInfo.put(id, template.getTemplateName()));
        return templateInfo;
    }

    public List<ReportView> getAllReportViews(String reportId, Claims claims){
        return getAllReportViews(reportId, claims, "classic_template"); // Default template
    }

    public List<ReportView> getAllReportViews(String reportId, Claims claims, String templateId){

        logger.info("Starting getOrGenerateReportViewList for report ID: {} with template: {}", reportId, templateId);

        Report report = reportRepository.findById(UUID.fromString(reportId)).orElseThrow(() -> {
            logger.error("Report not found with ID: {}", reportId);
            return new ResourceNotFoundException("Report Not Found");
        });
        logger.debug("Found report with ID: {}", reportId);

        List<ClientReport> clientList = report.getClientReportList();

        if (report.getPublished()) {
            List<ReportView> response = new ArrayList<>();
            clientList.forEach(clientReport -> {
                Optional<ReportView> reportViewForClient = reportViewRepository.findById(reportId + "-" + clientReport.getClient().getClientId());
                if (reportViewForClient.isPresent()){
                    response.add(reportViewForClient.get());
                } else {
                    response.add(getReportViewForClient(report, clientReport, claims, templateId));
                }
            });

            return response;

        } else {
            return clientList.stream().map(clientReport -> getReportViewForClient(report, clientReport, claims, templateId)).collect(Collectors.toList());
        }
    }

    public List<ReportView> saveAllReportViews(List<ReportView> reportViews) {
        return reportViews.stream().map(reportView -> {
            Optional<ReportView> reportViewForClient = reportViewRepository.findById(reportView.getId());
            if (reportViewForClient.isPresent()){
                reportView.setPublished(reportViewForClient.get().getPublished());
                reportView.setReportVersion(reportViewForClient.get().getReportVersion());
                reportView.setTemplate(reportViewForClient.get().getTemplate());
                reportView.setClientId(reportViewForClient.get().getClientId());
                reportView.setClientName(reportViewForClient.get().getClientName());
                return reportViewRepository.save(reportView);
            } else return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public List<ReportView> publishAllReportViews(List<ReportView> reportViews, String type, Claims claims) {
        if(reportViews.isEmpty()) return new ArrayList<>();

        if("report".equals(type)){
            Report report = reportRepository.findById(UUID.fromString(reportViews.get(0).getReportId())).orElseThrow(() -> {
                logger.error("Report not found with ID: {}", reportViews.get(0).getReportId());
                return new ResourceNotFoundException("Report Not Found");
            });

            if (!report.getPublished()) throw new ValidationException("Parent Report Is Not Locked Yet");
        }

        return reportViews.stream().map(reportView -> {
            Optional<ReportView> reportViewForClient = reportViewRepository.findById(reportView.getId());
            if (reportViewForClient.isPresent()){
                reportView.setPublished(true);
                reportView.setReportVersion(reportViewForClient.get().getReportVersion());
                reportView.setTemplate(reportViewForClient.get().getTemplate());
                reportView.setClientId(reportViewForClient.get().getClientId());
                reportView.setClientName(reportViewForClient.get().getClientName());
                reportView = reportViewRepository.save(reportView);
                try {
//                    reportPdfService.convertReportViewToPdf(reportView);
                    reportHtmlService.convertReportViewToHtml(reportView);
                    if("exercise-response".equals(type) || "exercise".equals(type)){
                        Optional<ExerciseResponse> exerciseResponseOptional = exerciseResponseRepository.findById(UUID.fromString(reportView.getId()));
                        if (exerciseResponseOptional.isPresent()) {
                            ExerciseResponse exerciseResponse = exerciseResponseOptional.get();
                            exerciseResponse.setReportUrl(reportView.getLatestHtmlAssetId().toString());
                            exerciseResponseRepository.save(exerciseResponse);
                        } else {
                            throw new ResourceNotFoundException("Exercise Response Not Found");
                        }
                    } else if("survey-response".equals(type) || "survey".equals(type)){
                        Optional<SurveyResponse> surveyResponseOptional = surveyResponseRepository.findById(UUID.fromString(reportView.getId()));
                        if (surveyResponseOptional.isPresent()) {
                            SurveyResponse surveyResponse = surveyResponseOptional.get();
                            surveyResponse.setReportUrl(reportView.getLatestHtmlAssetId().toString());
                            surveyResponseRepository.save(surveyResponse);
                        } else {
                            throw new ResourceNotFoundException("Exercise Response Not Found");
                        }
                    }
//                    sendPublishedReport(reportView, claims);
                } catch (Exception e) {
                    throw new RuntimeException("Error sending report : " + e.getMessage());
                }
                return reportView;
            } else return null;
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    public ReportView getReportViewForClient(Report report, ClientReport clientReport, Claims claims){
        return getReportViewForClient(report, clientReport, claims, "classic_template"); // Default template
    }

    public ReportView getReportViewForClient(Report report, ClientReport clientReport, Claims claims, String templateId){

        String clientId = clientReport.getClient().getClientId();
        logger.info("Starting getReportViewForClient for client ID: {} and report ID: {} with template: {}", clientId, report.getId(), templateId);

        // Get the selected template
        ReportTemplate selectedTemplate = templates.get(templateId);
        if (selectedTemplate == null) {
            logger.warn("Template {} not found, using default classic_template", templateId);
            selectedTemplate = templates.get("classic_template");
        }
        final ReportTemplate template = selectedTemplate;

        logger.debug("Converting report entity to DTO");
        ReportDto reportDto = ReportDto.fromEntity(report);

        ReportView reportView = new ReportView();
        List<ReportView.ReportViewPage> reportViewPages = new ArrayList<>();

        String organisationId = (String) claims.get("organisationId");
        logger.debug("Fetching trainer organisation for ID: {}", organisationId);
        TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString(organisationId))
                .orElseThrow(() -> {
                    logger.error("Trainer organisation not found with ID: {}", organisationId);
                    return new RuntimeException("Trainer Organisation Not Found");
                });

        String today = getTodayDateFormatted();
        String clientName = clientReport.getClient().getClientName();
        String header = backendBaseUrl + "/public/" + trainerOrganisation.getHeaderImageId();
        String footer = backendBaseUrl + "/public/" + trainerOrganisation.getFooterImageId();

        logger.debug("Creating template with trainer organisation details");
        reportView.setTemplate(extractPage("<section><heading>##TITLE##</heading><content>##BODY##</content></section>", header, footer, "##TITLE##", today, clientName, template));

        logger.debug("Adding Executive Summary page");
        reportViewPages.add(createPage("Executive Summary", "Executive Summary",
                extractPage(reportDto.getExecutiveSummary().getContent(), header, footer, "Executive Summary", today, clientName, template)));


        logger.debug("Processing {} focus areas", reportDto.getFocusAreas().size());
        reportDto.getFocusAreas().forEach(fa -> {
            logger.debug("Adding focus area page: {}", fa.getName());
            StringBuilder internalContent = new StringBuilder();
            internalContent.append(fa.getContent());

            logger.trace("Filtering focus area client data for client ID: {}", clientId);
            fa.getClientData().stream().filter(far -> far.getClientId().equals(clientId))
                    .forEach(focusAreaReport -> {
                        logger.trace("Adding client focus area content for focus area ID: {}", focusAreaReport.getFocusAreaId());
                        logger.trace("Generating graph image for focus area");
                        internalContent.append(focusAreaReport.getContent().replaceAll("<<image_url_focusAreaImprovementGraph>>", getImageUrl(report.getId().toString() + "-" + clientId + "-" + focusAreaReport.getFocusAreaId() + "-growth-graph-v" + report.getVersion().getCount())));
                    });

            reportViewPages.add(createPage("Focus Areas", "Focus Area : " + fa.getName(),
                    extractPage(internalContent.toString(), header, footer, "Focus Area : " + fa.getName(), today, clientName, template)));
        });

        logger.debug("Processing improvement summaries for client ID: {}", clientId);
        reportDto.getImprovementSummaries().stream().filter(is -> is.getClientId().equals(clientId)).forEach(is -> {
            logger.debug("Adding improvement summary page");

            reportViewPages.add(createPage("Improvement Summary", "Development Progress Graph",
                    extractPage(is.getContentForImprovementGraph()
                            .replaceAll("<<image_url_improvementGraph>>", getImageUrl(report.getId().toString() + "-" + clientId + "-development-progress-graph-v" + report.getVersion().getCount())),
                            header, footer, "Improvement Summary", today, clientName, template)));

            reportViewPages.add(createPage("Improvement Summary", "Peer Review Comparison Graph",
                    extractPage(is.getContentForPeerComparisonGraph()
                            .replaceAll("<<image_url_peerReviewComparisonGraph>>", getImageUrl(report.getId().toString() + "-" + clientId + "-peer-review-comparison-graph-v" + report.getVersion().getCount())),
                            header, footer, "Improvement Summary", today, clientName, template)));

        });

        logger.debug("Adding conclusion page");
        reportViewPages.add(createPage("Conclusion", "Conclusion",
                extractPage("<section><heading>Conclusion</heading><content><<CONCLUSION>></content></section>".replaceAll("<<CONCLUSION>>", reportDto.getConclusion()), header, footer, "Conclusion", today, clientName, template)));

        reportViewPages.add(0, getContentsPage(reportViewPages, header, footer, today, clientName, template));

        logger.debug("Setting report view metadata");
        reportView.setReportId(report.getId().toString());
        reportView.setReportVersion(report.getVersion().getCount());
        reportView.setClientId(clientId);
        reportView.setPages(reportViewPages);
        reportView.setClientName(clientName);
        reportView.setId(report.getId().toString() + "-" + clientId);

        logger.info("Completed getReportViewForClient for client ID: {} with {} pages", clientId, reportViewPages.size());

        return reportViewRepository.save(reportView);
    }

    public ReportView createInstantReportView(List<ReportView.Page> pages, String reportViewId, String reportId, String templateId, String clientId, String clientName, Claims claims) {
        logger.info("Creating instant report view for report with ID: {} and client ID: {}", reportViewId, clientId);

        Optional<ReportView> reportViewOptional = reportViewRepository.findById(reportViewId);
        if (reportViewOptional.isPresent()) {
            logger.warn("Report view with ID {} already exists, returning existing report view", reportViewId);
            return reportViewOptional.get();
        }

        ReportView reportView = new ReportView();
        reportView.setReportId(reportId);
        reportView.setClientId(clientId);
        reportView.setClientName(clientName);
        reportView.setPublished(false);
        reportView.setReportVersion(1); // Default version for instant reports
        reportView.setId(reportViewId);

        // Get the selected template
        ReportTemplate selectedTemplate = templates.get(templateId);
        if (selectedTemplate == null) {
            logger.warn("Template {} not found, using default classic_template", templateId);
            selectedTemplate = templates.get("classic_template");
        }
        final ReportTemplate template = selectedTemplate;

        List<ReportView.ReportViewPage> reportViewPages = new ArrayList<>();

        String organisationId = (String) claims.get("organisationId");
        logger.debug("Fetching trainer organisation for ID: {}", organisationId);
        TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString(organisationId))
                .orElseThrow(() -> {
                    logger.error("Trainer organisation not found with ID: {}", organisationId);
                    return new RuntimeException("Trainer Organisation Not Found");
                });

        String today = getTodayDateFormatted();
        String header = backendBaseUrl + "/public/" + trainerOrganisation.getHeaderImageId();
        String footer = backendBaseUrl + "/public/" + trainerOrganisation.getFooterImageId();

        logger.debug("Creating template with trainer organisation details");
        reportView.setTemplate(extractPage("<section><heading>##TITLE##</heading><content>##BODY##</content></section>", header, footer, "##TITLE##", today, clientName, template));

        for (ReportView.Page page : pages){
            logger.debug("Adding {} page", page.getTitle());
            reportViewPages.add(createPage(page.getTitle(), page.getTitle(),
                    extractPage(page.toXml(backendBaseUrl), header, footer, (page.getTitle() == null ? "" : page.getTitle()), today, clientName, template)));

        }

        reportViewPages.add(0, getContentsPage(reportViewPages, header, footer, today, clientName, template));

        reportView.setPages(reportViewPages);

        logger.info("Instant report view created with ID: {}", reportView.getId());

        return reportViewRepository.save(reportView);
    }

    public ReportView.ReportViewPage createPage(String section, String title, String content) {
        ReportView.ReportViewPage page = new ReportView.ReportViewPage();
        page.setId(UUID.randomUUID());
        page.setSection(section);
        page.setTitle(title);
        page.setContent(content);

        return page;
    }

    public String extractPage(String content, String header, String footer, String pageTitle, String date, String client, ReportTemplate template) {

        StringBuilder sections = new StringBuilder();
        extractAllTagValues(content, "section").forEach(sc -> sections.append(extractSection(sc, template)));

        sections.append("<br>");

        return template.getBodyContainer()
                .replaceAll("\\{\\{PRIMARY_HEADER\\}\\}", header)
                .replaceAll("\\{\\{PRIMARY_FOOTER\\}\\}", footer)
                .replaceAll("\\{\\{PAGE_TITLE\\}\\}", pageTitle)
                .replaceAll("\\{\\{DATE\\}\\}", date)
                .replaceAll("\\{\\{CLIENT_NAME_DESIGNATION\\}\\}", client)
                .replaceAll("\\{\\{BODY\\}\\}", sections.toString())
                .replaceAll("\\{\\{PAGE_NUMBER\\}\\}", "##PAGE_NUMBER##");

    }

    public ReportView.ReportViewPage getContentsPage(List<ReportView.ReportViewPage> pages, String header, String footer, String date, String client, ReportTemplate template) {

        StringBuilder tableRows = new StringBuilder();
        String section = "";

        for(int i = 0; i<pages.size(); i++){
            ReportView.ReportViewPage page = pages.get(i);

            if(!page.getSection().isEmpty()){
                if(!section.equals(page.getSection())){
                    section = page.getSection();
                    tableRows.append(template.getSectionRowContainer()
                            .replaceAll("\\{\\{NAME\\}\\}", section)
                            .replaceAll("\\{\\{PAGE_NUMBER\\}\\}", String.valueOf(i+1)));
                }
                tableRows.append(template.getPageRowContainer()
                        .replaceAll("\\{\\{NAME\\}\\}", page.getTitle())
                        .replaceAll("\\{\\{PAGE_NUMBER\\}\\}", String.valueOf(i+1)));

            }
        }

        String table = template.getTableContainer().replaceAll("\\{\\{TABLE_ROWS\\}\\}", tableRows.toString());

        String pageString = template.getBodyContainer()
                .replaceAll("\\{\\{PRIMARY_HEADER\\}\\}", header)
                .replaceAll("\\{\\{PRIMARY_FOOTER\\}\\}", footer)
                .replaceAll("\\{\\{PAGE_TITLE\\}\\}", "INDEX")
                .replaceAll("Page \\{\\{PAGE_NUMBER\\}\\}", "")
                .replaceAll("\\{\\{DATE\\}\\}", date)
                .replaceAll("\\{\\{CLIENT_NAME_DESIGNATION\\}\\}", client)
                .replaceAll("\\{\\{BODY\\}\\}", table);

        ReportView.ReportViewPage page = new ReportView.ReportViewPage();
        page.setSection("");
        page.setTitle("Table Of Contents");
        page.setContent(pageString);
        page.setId(UUID.randomUUID());

        return page;

    }

    public String extractSection(String content, ReportTemplate template) {

        List<String> titleList = extractAllTagValues(content, "heading");
        String title = !titleList.isEmpty() ? titleList.get(0) : "";

        StringBuilder images = new StringBuilder();
        extractAllTagValues(content, "image").forEach(img -> images.append(extractImage(img, template)));

        if(!images.toString().isEmpty()) images.append("<br>");

        StringBuilder text = new StringBuilder();
        extractAllTagValues(content, "content").forEach(text::append);

        return "<br>" + template.getSectionContainer()
                .replaceAll("\\{\\{HEADING\\}\\}", title)
                .replaceAll("\\{\\{CONTENT\\}\\}", images.toString() + text);

    }


    public String extractImage(String content, ReportTemplate template) {

        List<String> titleList = extractAllTagValues(content, "image_title");
        String title = !titleList.isEmpty() ? titleList.get(0) : "";

        List<String> urlList = extractAllTagValues(content, "image_url");
        String url = !urlList.isEmpty() ? urlList.get(0) : "";

        return template.getImageContainer()
                .replaceAll("\\{\\{IMAGE_TITLE\\}\\}", title)
                .replaceAll("\\{\\{IMAGE_URL\\}\\}", url);

    }


    public static List<String> extractAllTagValues(String xmlString, String tagName) {
        List<String> results = new ArrayList<>();
        String openingTag = "<" + tagName + ">";
        String closingTag = "</" + tagName + ">";

        int startIndex = 0;
        int openingTagPos;

        while ((openingTagPos = xmlString.indexOf(openingTag, startIndex)) != -1) {
            int contentStart = openingTagPos + openingTag.length();
            int closingTagPos = xmlString.indexOf(closingTag, contentStart);

            if (closingTagPos == -1) break; // No matching closing tag

            String value = xmlString.substring(contentStart, closingTagPos);
            results.add(value);

            startIndex = closingTagPos + closingTag.length();
        }

        return results;
    }

    public String getTodayDateFormatted() {
        LocalDate today = LocalDate.now();

        // Format the date without the day number first
        String month = today.format(DateTimeFormatter.ofPattern("MMMM", Locale.ENGLISH));
        int year = today.getYear();
        int day = today.getDayOfMonth();

        // Add the appropriate suffix to the day number
        String dayWithSuffix = day + getDaySuffix(day);

        // Combine all parts
        return dayWithSuffix + " " + month + ", " + year;
    }

    private String getDaySuffix(int day) {
        if (day >= 11 && day <= 13) {
            return "th";
        }

        switch (day % 10) {
            case 1:  return "st";
            case 2:  return "nd";
            case 3:  return "rd";
            default: return "th";
        }
    }

    private String getImageUrl(String entityId){
        logger.debug("Entity Id : {}", entityId);
        List<PublicAsset> publicAssetList = publicAssetRepository.findAllByEntityIdOrderByUpdatedAtDesc(entityId);
        if (publicAssetList.isEmpty()) return "";
        else return backendBaseUrl + "/public/" + publicAssetList.get(0).getId().toString();
    }

    public void sendPublishedReport(ReportView reportView, Claims claims) throws Exception {
        logger.info("Entering sendPublishedReport for report view ID: {}",reportView.getId());
        try {

            logger.debug("Fetching trainer details");
            Trainer trainer = trainerRepository.findByUser_Id(UUID.fromString((String) claims.get("userId")))
                    .orElseThrow(() -> {
                        logger.error("Trainer not found for id: {}", reportView.getReportId());
                        return new RuntimeException("Trainer Not Found");
                    });

            logger.debug("Fetching client details");
            Client client = clientRepository.findById(UUID.fromString(reportView.getClientId()))
                    .orElseThrow(() -> {
                        logger.error("Client not found for id: {}", reportView.getClientId());
                        return new RuntimeException("Client Not Found");
                    });

            logger.debug("Sending report publish email to: {}", client.getEmail());
            logger.debug("getImageUrl(reportView.getId()) : {}", getImageUrl(reportView.getId()));

            emailService.sendEmailWithBranding(
                    client.getEmail(),
                    trainer.getFirstName() + " Has Published A Report",
                    publishReport
                            .replaceAll("<<client_name>>", client.getFirstName())
                            .replaceAll("<<coach_name>>", trainer.getFirstName())
                            .replaceAll("<<report_link>>", getImageUrl(reportView.getId())),
                    claims
            );

            logger.info("Successfully sent publish report email");
        } catch (Exception e) {
            throw new Exception("");
        } finally {
            logger.info("Exiting sendPublishedReport");
        }
    }

}
