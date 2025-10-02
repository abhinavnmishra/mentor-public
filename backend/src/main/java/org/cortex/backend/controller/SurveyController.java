package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.FormDto;
import org.cortex.backend.dto.PeerDto;
import org.cortex.backend.dto.SurveyWizardDto;
import org.cortex.backend.model.SurveyResponse;
import org.cortex.backend.model.Survey;
import org.cortex.backend.service.SurveyWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/surveys")
public class SurveyController {

    @Autowired
    private SurveyWizardService surveyWizardService;

    @GetMapping("/{surveyId}/responses/latest")
    public ResponseEntity<SurveyResponse> getLatestResponse(
        @PathVariable String surveyId,
        @RequestParam String respondentEmail
    ) {
        return ResponseEntity.ok(surveyWizardService.getLatestResponse(surveyId, respondentEmail));
    }

    @GetMapping("/milestone-trackers/{milestoneTrackerId}/responses")
    public ResponseEntity<List<SurveyResponse>> getSurveyResponsesByMilestoneTrackerAndSurvey(
        @PathVariable String milestoneTrackerId,
        @RequestParam String surveyId
    ) {
        return ResponseEntity.ok(surveyWizardService.getSurveyResponsesByMilestoneTrackerAndSurvey(
            milestoneTrackerId, surveyId));
    }

    @PutMapping("/wizard/{surveyId}")
    public ResponseEntity<SurveyWizardDto> updateSurveyWizard(
            @PathVariable String surveyId,
            @RequestBody SurveyWizardDto request
    ) {
        return ResponseEntity.ok(surveyWizardService.updateSurveyWizard(
                surveyId,
                request
        ));
    }

    @PostMapping("/publish/{surveyId}")
    public ResponseEntity<?> publishSurvey(
            @PathVariable String surveyId,
            @RequestBody SurveyWizardDto request,
            @AuthenticationPrincipal Claims claims
    ) {
        try {
            return ResponseEntity.ok(surveyWizardService.publishSurvey(
                    surveyId, true, request, claims
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/edit/{surveyId}")
    public ResponseEntity<?> editSurvey(
            @PathVariable String surveyId,
            @RequestBody SurveyWizardDto request,
            @AuthenticationPrincipal Claims claims
    ) {
        try {
            return ResponseEntity.ok(surveyWizardService.publishSurvey(
                    surveyId, false, request, claims
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{surveyId}")
    public ResponseEntity<Survey> getSurveyDetails(
            @PathVariable String surveyId) {
        return ResponseEntity.ok(surveyWizardService.getSurveyDetails(
                surveyId
        ));
    }

    @GetMapping("/wizard/{surveyId}")
    public ResponseEntity<SurveyWizardDto> getSurveyWizard(
            @PathVariable String surveyId) {
        return ResponseEntity.ok(surveyWizardService.getSurveyWizard(
                surveyId
        ));
    }

    @GetMapping("/form/{surveyResponseId}")
    public ResponseEntity<FormDto> getForm(
            @PathVariable String surveyResponseId) {
        return ResponseEntity.ok(surveyWizardService.getForm(
                surveyResponseId
        ));
    }

    @PutMapping("/form/{surveyResponseId}")
    public ResponseEntity<FormDto> updateForm(
            @PathVariable String surveyResponseId,
            @RequestBody FormDto request
    ) {
        return ResponseEntity.ok(surveyWizardService.updateForm(
                surveyResponseId,
                request
        ));
    }

    @PostMapping ("/form/{surveyResponseId}")
    public ResponseEntity<FormDto> submitForm(
            @PathVariable String surveyResponseId,
            @RequestBody FormDto request
    ) {
        return ResponseEntity.ok(surveyWizardService.submitForm(
                surveyResponseId,
                request
        ));
    }

    @PutMapping ("/evaluation/{surveyResponseId}")
    public ResponseEntity<FormDto> saveEvaluation(
            @PathVariable String surveyResponseId,
            @RequestBody SurveyResponse request
    ) {
        surveyWizardService.saveSurveyEvaluation(
                surveyResponseId,
                request
        );
        return getForm(surveyResponseId);
    }

    @GetMapping ("/peer/{peerReviewId}")
    public ResponseEntity<?> getAllPeer(
            @PathVariable String peerReviewId
    ) {
        return ResponseEntity.ok(surveyWizardService.getAllPeerStatus(
                peerReviewId
        ));
    }

    @GetMapping ("/peer/remind/{surveyResponseId}")
    public ResponseEntity<?> remindPeer(
            @PathVariable String surveyResponseId,
            @AuthenticationPrincipal Claims claims
    ) {
        try {
            surveyWizardService.sendReminderToPeer(
                    surveyResponseId,
                    claims
            );
            return ResponseEntity.ok("Sent");
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping ("/peer/{peerReviewId}")
    public ResponseEntity<?> invitePeer(
            @PathVariable String peerReviewId,
            @RequestBody PeerDto request,
            @AuthenticationPrincipal Claims claims
    ) {
        try {
            return ResponseEntity.ok(surveyWizardService.invitePeer(
                    peerReviewId,
                    request,
                    claims
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping ("/list/{trainerOrganisationId}")
    public ResponseEntity<?> listAvailableSurveys(
            @PathVariable String trainerOrganisationId
    ) {
        try {
            return ResponseEntity.ok(surveyWizardService.listAvailableSurveys(trainerOrganisationId));
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/import/{cloneSurveyId}")
    public ResponseEntity<SurveyWizardDto> importQuestions(
            @PathVariable String cloneSurveyId, @RequestBody SurveyWizardDto request) {
        return ResponseEntity.ok(surveyWizardService.importQuestions(
                cloneSurveyId, request
        ));
    }

} 