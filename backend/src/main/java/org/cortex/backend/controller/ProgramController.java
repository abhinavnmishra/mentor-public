package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.*;
import org.cortex.backend.model.*;
import org.cortex.backend.service.ProgramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    @Autowired
    private ProgramService programService;

    @GetMapping("/organisation")
    public ResponseEntity<List<CoachingProgram>> getProgramsByTrainerOrganisation(
        @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(programService.getProgramsByTrainerOrganisation(claims));
    }

    @PostMapping
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR"})
    public ResponseEntity<CoachingProgram> createProgram(
        @RequestBody CreateProgramRequest request
    ) {
        return ResponseEntity.ok(programService.createProgram(
            request.getProgramId(),
            request.getTrainerId(),
            request.getClientOrganisationId(),
            request.getTitle(),
            request.getStartDate()
        ));
    }

    @GetMapping("/{programId}")
    public ResponseEntity<CoachingProgram> getProgram(
            @PathVariable String programId
    ) {
        return ResponseEntity.ok(programService.getProgram(programId));
    }

    @GetMapping("/{programId}/clients")
    public ResponseEntity<List<Client>> getClientsByProgram(
        @PathVariable String programId
    ) {
        return ResponseEntity.ok(programService.getClientsByProgram(programId));
    }

    @PutMapping("/{programId}")
    public ResponseEntity<CoachingProgram> updateProgram(
        @PathVariable String programId,
        @RequestBody UpdateProgramRequest request
    ) {
        return ResponseEntity.ok(programService.updateProgram(
            programId,
            request.getDescription(),
            request.getStatus()
        ));
    }

    @PutMapping("/calendly/{programId}")
    public ResponseEntity<CoachingProgram> updateProgramCalendlyEventType(
            @PathVariable String programId,
            @RequestParam(required = false, defaultValue = "") String eventType,
            @RequestParam(required = false, defaultValue = "") String eventTypeUrl
    ) {
        return ResponseEntity.ok(programService.updateProgramCalendlyEventType(
                programId,
                eventType,
                eventTypeUrl
        ));
    }

    @PostMapping("/focusAreas")
    public ResponseEntity<List<FocusAreaDto>> createFocusArea(
            @RequestBody CreateFocusAreaRequest request
    ) {
        return ResponseEntity.ok(programService.createFocusArea(
                request.getId(),
                request.getParentId(),
                request.getName(),
                request.getObjective(),
                request.getDescription(),
                request.getCriteria(),
                request.getCoachingProgram()
        ));
    }

    @PutMapping("/focusAreas/{programId}")
    public ResponseEntity<List<FocusAreaDto>> updateProgramFocusAreas(
            @PathVariable String programId,
            @RequestBody UpdateProgramFocusAreasRequest request
    ) {
        return ResponseEntity.ok(programService.updateProgramFocusAreas(
                programId,
                request.getFocusAreaIds()
        ));
    }

    @PutMapping("/focusAreas/{areaId}/eval")
    public ResponseEntity<List<FocusAreaDto>> updateFocusAreaEval(
        @PathVariable String areaId,
        @RequestBody FocusArea.Eval eval
    ) {
        return ResponseEntity.ok(programService.updateFocusAreaEval(
            areaId,
            eval
        ));
    }

    @DeleteMapping("/focusAreas/{areaId}")
    public ResponseEntity<List<FocusAreaDto>> deleteFocusArea(
            @PathVariable String areaId
    ) {
        return ResponseEntity.ok(programService.deleteFocusArea(areaId));
    }

    @GetMapping("/focusAreas")
    public ResponseEntity<List<FocusArea>> getAllFocusAreas() {
        return ResponseEntity.ok(programService.getAllFocusAreas());
    }

    @GetMapping("/focusAreas/{programId}")
    public ResponseEntity<List<FocusAreaDto>> getAllFocusAreasByProgramId(@PathVariable String programId) {
        return ResponseEntity.ok(programService.getAllFocusAreasForProgramId(programId));
    }

    @GetMapping("/focusAreas/responseId/{surveyResponseId}")
    public ResponseEntity<List<FocusAreaDto>> getAllFocusAreasBySurveyResponseId(@PathVariable String surveyResponseId) {
        return ResponseEntity.ok(programService.getAllFocusAreasBySurveyResponseId(surveyResponseId));
    }

    @GetMapping("/focusAreas/metadata/{programId}")
    public ResponseEntity<List<SurveyWizardDto.FocusArea>> getAllFocusAreasForProgramIdForSelection(@PathVariable String programId) {
        return ResponseEntity.ok(programService.getAllFocusAreasForProgramIdForSelection(programId));
    }

    @PutMapping("/milestoneTrackers/{trackerId}/notes")
    public ResponseEntity<MilestoneTracker> updateTrainerNotes(
        @PathVariable String trackerId,
        @RequestBody UpdateTrainerNotesRequest request
    ) {
        return ResponseEntity.ok(programService.updateTrainerNotes(trackerId, request.getTrainerNotes(), request.getIsTrainerNotesVisible()));
    }

    @PostMapping("/{programId}/milestones")
    public ResponseEntity<ProgramMilestone> createMilestone(
        @PathVariable String programId,
        @RequestBody CreateMilestoneRequest request
    ) {
        return ResponseEntity.ok(programService.createMilestone(programId, request.getType(), request.getTitle()));
    }

    @PutMapping("/milestones/{milestoneId}/status")
    public ResponseEntity<List<ProgramMilestone>> updateMilestoneStatus(
        @PathVariable String milestoneId,
        @RequestBody UpdateMilestoneStatusRequest request,
        @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(programService.updateMilestoneStatus(milestoneId, request.getStatus(), claims));
    }

    @PutMapping("/milestones/{milestoneId}")
    public ResponseEntity<ProgramMilestone> updateMilestoneDetails(
            @PathVariable String milestoneId,
            @RequestBody UpdateMilestoneDetailsRequest request
    ) {
        return ResponseEntity.ok(programService.updateMilestoneDetails(
                milestoneId,
                request.getTitle(),
                request.getStartDate(),
                request.getDueDate(),
                request.getDescription(),
                request.getFocusAreaIds()
        ));
    }

    @GetMapping("/{programId}/milestones/reset")
    public ResponseEntity<List<ProgramMilestone>> resetMilestonesByProgram(
            @PathVariable String programId
    ) {
        return ResponseEntity.ok(programService.resetMilestonesByProgram(programId));
    }

    @GetMapping("/{programId}/milestones")
    public ResponseEntity<List<ProgramMilestone>> getMilestonesByProgram(
        @PathVariable String programId
    ) {
        return ResponseEntity.ok(programService.getMilestonesByProgram(programId));
    }

    @PutMapping("/activities/{activityId}")
    public ResponseEntity<Activity> updateActivity(
        @PathVariable String activityId,
        @RequestBody UpdateActivityRequest request
    ) {
        return ResponseEntity.ok(programService.updateActivity(
            activityId,
            request.getName(),
            request.getNotes(),
            request.getDescription(),
            request.getFiles()
        ));
    }

    @GetMapping("/activities/{sessionId}")
    public ResponseEntity<List<MilestoneTracker.MilestoneDropDownView>> getActivityTrackerList(
            @PathVariable String sessionId
    ) {
        try {
            return ResponseEntity.ok(programService.getActivityTrackerList(sessionId));
        } catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ArrayList<>());
        }
    }

} 