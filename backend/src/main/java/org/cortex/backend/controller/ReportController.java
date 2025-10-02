package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.ReportDto;
import org.cortex.backend.exercises.model.ExerciseResponse;
import org.cortex.backend.exercises.service.ExerciseService;
import org.cortex.backend.model.Report;
import org.cortex.backend.model.ReportView;
import org.cortex.backend.model.PublicAsset;
import org.cortex.backend.service.*;
import org.cortex.backend.repository.ReportViewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Set;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private static final Logger logger = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    @Autowired
    private ReportViewGenerator reportViewGenerator;

    @Autowired
    private PublicAssetService publicAssetService;

    @Autowired
    private ReportPdfService reportPdfService;

    @Autowired
    private ReportHtmlService reportHtmlService;

    @Autowired
    private ReportViewRepository reportViewRepository;

    @Autowired
    private ExerciseService exerciseService;

    @Autowired
    private SurveyWizardService surveyWizardService;

    @GetMapping("/initialize/{programId}")
    public ResponseEntity<ReportDto> initializeReport(@PathVariable String programId, @RequestParam(name = "version", required = false, defaultValue = "0") String version) {
        int v = Integer.parseInt(version);
        if (v == 0) {
            return ResponseEntity.ok(reportService.initializeReport(programId));
        } else {
            return ResponseEntity.ok(reportService.cloneReport(programId, v));
        }
    }

    @GetMapping("/fetch/{programId}")
    public ResponseEntity<ReportDto> fetchReport(@PathVariable String programId, @RequestParam(name = "version", required = false, defaultValue = "0") String version) {
        return ResponseEntity.ok(reportService.fetchReport(programId, Integer.parseInt(version)));
    }

    @GetMapping("/versions/{programId}")
    public ResponseEntity<List<Report.Version>> fetchReportVersions(@PathVariable String programId) {
        return ResponseEntity.ok(reportService.fetchReportVersions(programId));
    }

    @PostMapping("/save/{programId}")
    public ResponseEntity<ReportDto> saveReport(@PathVariable String programId, @RequestBody ReportDto reportDto) {
        return ResponseEntity.ok(reportService.saveReport(programId, reportDto));
    }

    @PostMapping("/publish/{programId}")
    public ResponseEntity<ReportDto> saveAndPublishReport(@PathVariable String programId, @RequestBody ReportDto reportDto) {
        return ResponseEntity.ok(reportService.saveAndPublishReport(programId, reportDto));
    }

    @GetMapping("/view/{reportId}")
    public ResponseEntity<List<ReportView>> getOrCreateReportView(@AuthenticationPrincipal Claims claims, @PathVariable String reportId) {
        return ResponseEntity.ok(reportViewGenerator.getAllReportViews(reportId, claims));
    }

    @GetMapping("/view/{reportId}/template/{templateId}")
    public ResponseEntity<List<ReportView>> getOrCreateReportViewWithTemplate(@AuthenticationPrincipal Claims claims, @PathVariable String reportId, @PathVariable String templateId, @RequestParam(name = "type", defaultValue = "report", required = false) String type) {
        if("exercise-response".equals(type)) {
            logger.info("Fetching exercise views for exercise response ID: {} with template ID: {}", reportId, templateId);
            return ResponseEntity.ok(exerciseService.getAllReportViewsByExerciseResponseId(reportId, templateId, claims));
        } else if("exercise".equals(type)) {
            logger.info("Fetching exercise views for exercise ID: {} with template ID: {}", reportId, templateId);
            return ResponseEntity.ok(exerciseService.getAllReportViewsByExerciseId(reportId, templateId, claims));
        } else if("survey-response".equals(type)) {
            logger.info("Fetching survey views for survey response ID: {} with template ID: {}", reportId, templateId);
            return ResponseEntity.ok(surveyWizardService.getAllReportViewsBySurveyResponseId(reportId, templateId, claims));
        } else if("survey".equals(type)) {
            logger.info("Fetching survey views for survey ID: {} with template ID: {}", reportId, templateId);
            return ResponseEntity.ok(surveyWizardService.getAllReportViewsBySurveyId(reportId, templateId, claims));
        } else {
            logger.info("Fetching report views for report ID: {} with template ID: {}", reportId, templateId);
            return ResponseEntity.ok(reportViewGenerator.getAllReportViews(reportId, claims, templateId));
        }
    }

    @GetMapping("/templates")
    public ResponseEntity<Set<String>> getAvailableTemplates() {
        return ResponseEntity.ok(reportViewGenerator.getAvailableTemplates());
    }

    @GetMapping("/templates/info")
    public ResponseEntity<Map<String, String>> getAvailableTemplatesWithInfo() {
        return ResponseEntity.ok(reportViewGenerator.getAvailableTemplatesWithNames());
    }

    @GetMapping("/view/{reportId}/exists")
    public ResponseEntity<Map<String, Object>> checkReportExists(@PathVariable String reportId) {
        logger.info("Checking if report views exist for report ID: {}", reportId);
        
        try {
            // Check if any report views exist for this report ID
            List<ReportView> existingViews = reportViewRepository.findByReportId(reportId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("exists", !existingViews.isEmpty());
            response.put("count", existingViews.size());
            
            if (!existingViews.isEmpty()) {
                // Get the template ID from the first report view (they should all use the same template)
                ReportView firstView = existingViews.get(0);
                // Extract template ID from the report view - we'll need to add this info
                response.put("templateId", getTemplateIdFromReportView(firstView));
                response.put("clientCount", existingViews.size());
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error checking report existence for ID {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    private String getTemplateIdFromReportView(ReportView reportView) {
        // For now, we'll determine the template based on the content structure
        // In a future enhancement, we could store the template ID directly in ReportView
        if (reportView.getTemplate() != null) {
            String template = reportView.getTemplate();
            // Check for modern template characteristics
            if (template.contains("linear-gradient") && template.contains("box-shadow")) {
                return "modern_template";
            }
        }
        // Default to classic template
        return "classic_template";
    }

    @PutMapping("/view")
    public ResponseEntity<ReportView> saveSingleReportView(@RequestBody ReportView reportView) {
        List<ReportView> response = reportViewGenerator.saveAllReportViews(List.of(reportView));
        if (response.isEmpty()) return new ResponseEntity<>(reportView, HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.ok(response.get(0));
    }

    @PostMapping("/view")
    public ResponseEntity<ReportView> saveAndPublishSingleReportView(@AuthenticationPrincipal Claims claims, @RequestBody ReportView reportView, @RequestParam(name = "type", defaultValue = "report", required = false) String type) {
        List<ReportView> response = reportViewGenerator.publishAllReportViews(List.of(reportView), type, claims);
        if (response.isEmpty()) return new ResponseEntity<>(reportView, HttpStatus.INTERNAL_SERVER_ERROR);
        return ResponseEntity.ok(response.get(0));
    }

    @PutMapping("/view/all")
    public ResponseEntity<List<ReportView>> saveReportView(@RequestBody List<ReportView> reportViews) {
        return ResponseEntity.ok(reportViewGenerator.saveAllReportViews(reportViews));
    }

    @PostMapping("/view/all")
    public ResponseEntity<List<ReportView>> saveAndPublishReportView(@AuthenticationPrincipal Claims claims, @RequestBody List<ReportView> reportViews, @RequestParam(name = "type", defaultValue = "report", required = false) String type) {
        return ResponseEntity.ok(reportViewGenerator.publishAllReportViews(reportViews, type, claims));
    }

    /**
     * Generate PDF from a report view and return the asset ID
     */
    @PostMapping("/generate-pdf/{reportViewId}")
    public ResponseEntity<UUID> generatePdf(@PathVariable String reportViewId) {
        logger.info("Request to generate PDF for report view: {}", reportViewId);
        
        try {
            // Fetch the report view from repository
            ReportView reportView = reportViewRepository.findById(reportViewId)
                .orElseThrow(() -> new RuntimeException("Report view not found: " + reportViewId));
                
            UUID assetId = reportPdfService.convertReportViewToPdf(reportView);
            return ResponseEntity.ok(assetId);
        } catch (Exception e) {
            logger.error("Error generating PDF: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate HTML from a report view and return the asset ID
     */
    @PostMapping("/generate-html/{reportViewId}")
    public ResponseEntity<UUID> generateHtml(@PathVariable String reportViewId) {
        logger.info("Request to generate HTML for report view: {}", reportViewId);
        
        try {
            // Fetch the report view from repository
            ReportView reportView = reportViewRepository.findById(reportViewId)
                .orElseThrow(() -> new RuntimeException("Report view not found: " + reportViewId));
                
            UUID assetId = reportHtmlService.convertReportViewToHtml(reportView);
            return ResponseEntity.ok(assetId);
        } catch (Exception e) {
            logger.error("Error generating HTML: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Regenerate HTML from a report view and return the asset ID
     */
    @PostMapping("/regenerate-html/{reportViewId}")
    public ResponseEntity<UUID> regenerateHtml(@PathVariable String reportViewId) {
        logger.info("Request to regenerate HTML for report view: {}", reportViewId);
        
        try {
            // Fetch the report view from repository
            ReportView reportView = reportViewRepository.findById(reportViewId)
                .orElseThrow(() -> new RuntimeException("Report view not found: " + reportViewId));
                
            UUID assetId = reportHtmlService.convertReportViewToHtml(reportView);
            return ResponseEntity.ok(assetId);
        } catch (Exception e) {
            logger.error("Error regenerating HTML: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Generate PDFs for all report views associated with a report ID
     * @param reportId The ID of the report to generate PDFs for
     * @return Map of report view IDs to their corresponding PDF asset IDs
     */
    @PostMapping("/generate-pdf/report/{reportId}")
    public ResponseEntity<Map<String, UUID>> generatePdfsForReport(@PathVariable String reportId) {
        logger.info("Request to generate PDFs for all views of report: {}", reportId);
        
        try {
            // Get all report views for this report
            List<ReportView> reportViews = reportViewGenerator.getAllReportViews(reportId, null);
            
            if (reportViews.isEmpty()) {
                logger.warn("No report views found for report: {}", reportId);
                return ResponseEntity.noContent().build();
            }
            
            // Generate PDFs for each view
            Map<String, UUID> result = new HashMap<>();
            for (ReportView view : reportViews) {
                UUID assetId = reportPdfService.convertReportViewToPdf(view);
                result.put(view.getId(), assetId);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error generating PDFs for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Generate HTMLs for all report views associated with a report ID
     * @param reportId The ID of the report to generate HTMLs for
     * @return Map of report view IDs to their corresponding HTML asset IDs
     */
    @PostMapping("/generate-html/report/{reportId}")
    public ResponseEntity<Map<String, UUID>> generateHtmlsForReport(@PathVariable String reportId) {
        logger.info("Request to generate HTMLs for all views of report: {}", reportId);
        
        try {
            // Get all report views for this report
            List<ReportView> reportViews = reportViewGenerator.getAllReportViews(reportId, null);
            
            if (reportViews.isEmpty()) {
                logger.warn("No report views found for report: {}", reportId);
                return ResponseEntity.noContent().build();
            }
            
            // Generate HTMLs for each view
            Map<String, UUID> result = new HashMap<>();
            for (ReportView view : reportViews) {
                UUID assetId = reportHtmlService.convertReportViewToHtml(view);
                result.put(view.getId(), assetId);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error generating HTMLs for report {}: {}", reportId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Download a generated PDF by its asset ID
     */
    @GetMapping("/download/{assetId}")
    public ResponseEntity<Resource> downloadPdf(@PathVariable UUID assetId) {
        logger.info("Request to download PDF with asset ID: {}", assetId);
        
        Optional<PublicAsset> assetOpt = publicAssetService.getAssetById(assetId);
        
        if (assetOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        PublicAsset asset = assetOpt.get();
        ByteArrayResource resource = new ByteArrayResource(asset.getData());
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + asset.getFileName() + "\"")
                .body(resource);
    }

    /**
     * Download a generated HTML by its asset ID
     */
    @GetMapping("/download-html/{assetId}")
    public ResponseEntity<Resource> downloadHtml(@PathVariable UUID assetId) {
        logger.info("Request to download HTML with asset ID: {}", assetId);
        
        Optional<PublicAsset> assetOpt = publicAssetService.getAssetById(assetId);
        
        if (assetOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        PublicAsset asset = assetOpt.get();
        ByteArrayResource resource = new ByteArrayResource(asset.getData());
        
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + asset.getFileName() + "\"")
                .body(resource);
    }

}
