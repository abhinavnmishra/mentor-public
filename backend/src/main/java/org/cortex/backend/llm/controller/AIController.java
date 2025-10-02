package org.cortex.backend.llm.controller;

import lombok.RequiredArgsConstructor;
import org.cortex.backend.dto.ReportDto;
import org.cortex.backend.llm.Completions.TextCompletionService;
import org.cortex.backend.llm.Completions.pojo.TextCompletionDto;
import org.cortex.backend.llm.Evaluations.EvaluationService;
import org.cortex.backend.llm.Reports.AskReportWizardService;
import org.cortex.backend.llm.Surveys.pojo.ChatItem;
import org.cortex.backend.llm.pojo.PromptDto;
import org.cortex.backend.llm.Surveys.AskWizardService;
import org.cortex.backend.model.SurveyResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    @Autowired
    private final AskWizardService askWizardService;

    @Autowired
    private final AskReportWizardService askReportWizardService;

    @Autowired
    private final TextCompletionService textCompletionService;

    @Autowired
    private final EvaluationService evaluationService;


    @PostMapping("/chat/survey/{chatId}")
    public ResponseEntity<List<ChatItem>> structured(
            @PathVariable String chatId,
            @RequestBody PromptDto request
    ) {
        return ResponseEntity.ok(askWizardService.askSurveyWizard(chatId, request.getPrompt(), request.getCount()));
    }

    @GetMapping("/chat/survey/{chatId}/{count}")
    public ResponseEntity<List<ChatItem>> structured(
            @PathVariable String chatId,
            @PathVariable int count
    ) {
        return ResponseEntity.ok(askWizardService.retrieveSurveyWizardChat(chatId, count));
    }

    @GetMapping("/evaluate/{surveyResponseId}")
    public ResponseEntity<Boolean> evaluate(
            @PathVariable String surveyResponseId
    ) {
        return ResponseEntity.ok(evaluationService.evaluateAnswers(surveyResponseId));
    }

    @GetMapping("/survey/report/{surveyResponseId}")
    public ResponseEntity<SurveyResponse> evaluateSurveyForReport(
            @PathVariable String surveyResponseId
    ) {
        return ResponseEntity.ok(evaluationService.evaluateSurveyResponsePages(surveyResponseId));
    }

    @PostMapping("/completion")
    public ResponseEntity<String> completion(@RequestBody TextCompletionDto dto) {
        return ResponseEntity.ok(textCompletionService.generateText(dto.getKeyword(), dto.getId(), dto.getCurrentText()));
    }

        /**
         * Retrieve chat history for a report
         *
         * @param reportId The report ID
         * @param count Number of messages to retrieve (default 50)
         * @return List of chat messages
         */
    @GetMapping("/chat/report/{reportId}")
    public ResponseEntity<List<org.cortex.backend.llm.Reports.pojo.ChatItem>> getChatHistory(
            @PathVariable UUID reportId,
            @RequestParam(defaultValue = "20") int count) {

        List<org.cortex.backend.llm.Reports.pojo.ChatItem> chatHistory = askReportWizardService.retrieveReportChat(reportId, count);
        return ResponseEntity.ok(chatHistory);
    }

    /**
     * Process a user query about a report
     *
     * @param request ReportDto containing report object and prompt
     * @return List of operations (messages, read operations, write operations)
     */
    @PostMapping("/chat/report")
    public ResponseEntity<ReportDto> processReportAgentQuery(
            @RequestBody ReportDto request) {

        String query = request.getPromptDto().getPrompt();
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(askReportWizardService.processUserQuery(request.toEntity(), query, request.getPromptDto().getCount()));
    }

} 