package org.cortex.backend.clients.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.clients.service.ClientPortalService;
import org.cortex.backend.model.CoachingProgram;
import org.cortex.backend.model.CoachingSession;
import org.cortex.backend.model.MilestoneTracker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/client/portal")
public class ClientPortalController {

    @Autowired
    private ClientPortalService clientPortalService;

    @GetMapping("/programs")
    public ResponseEntity<List<CoachingSession.ClientProgramView>> getAllClientPrograms(@AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(clientPortalService.getAllClientPrograms(claims));
    }

    @GetMapping("/milestones/{coachingProgramId}")
    public ResponseEntity<List<MilestoneTracker.ClientMilestoneView>> getAllClientPrograms(@AuthenticationPrincipal Claims claims, @PathVariable String coachingProgramId) {
        return ResponseEntity.ok(clientPortalService.getAllClientMilestones(coachingProgramId, claims));
    }

    @GetMapping("/program/{coachingProgramId}")
    public ResponseEntity<CoachingSession.ClientProgramView> getClientProgram(@AuthenticationPrincipal Claims claims, @PathVariable String coachingProgramId) {
        return ResponseEntity.ok(clientPortalService.getClientProgram(claims, coachingProgramId));
    }

}
