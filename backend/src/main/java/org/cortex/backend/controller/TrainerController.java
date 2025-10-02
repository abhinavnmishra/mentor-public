package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.TrainerRequestDTO;
import org.cortex.backend.dto.TrainerResponseDTO;
import org.cortex.backend.dto.TrainerUpdateDTO;
import org.cortex.backend.dto.TrainerOrganisationDTO;
import org.cortex.backend.model.Trainer;
import org.cortex.backend.model.TrainerOrganisation;
import org.cortex.backend.service.TrainerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
public class TrainerController {

    @Autowired
    private TrainerService trainerService;

    @PostMapping
    public ResponseEntity<Trainer> createOrUpdateTrainer(@AuthenticationPrincipal Claims claims, @RequestBody TrainerRequestDTO request) {
        return ResponseEntity.ok(trainerService.createOrUpdateTrainer(request, claims));
    }

    @GetMapping
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"})
    public ResponseEntity<List<TrainerResponseDTO>> getTrainersByOrganisation(
        @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(trainerService.getTrainersByOrganisation((String) claims.get("organisationId")).reversed());
    }

    @GetMapping("/profile/{userId}")
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"})
    public ResponseEntity<TrainerResponseDTO> getTrainerProfile(
            @PathVariable String userId
    ) {
        return ResponseEntity.ok(trainerService.getTrainerProfile(userId));
    }

    @GetMapping("/signature/generate/{userId}")
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"})
    public ResponseEntity<String> generateSignature(@PathVariable String userId) {
        return ResponseEntity.ok(trainerService.generateSignature(userId));
    }

    @PutMapping("/profile/{userId}")
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"})
    public ResponseEntity<TrainerResponseDTO> updateTrainerProfile(
        @PathVariable String userId,
        @RequestBody TrainerUpdateDTO request
    ) {
        return ResponseEntity.ok(trainerService.setTrainerProfile(request, userId));
    }

    @PostMapping("/organisations")
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"})
    public ResponseEntity<TrainerOrganisation> createTrainerOrganisation(
        @RequestBody TrainerOrganisationDTO request
    ) {
        return ResponseEntity.ok(trainerService.createTrainerOrganisation(request));
    }

    @GetMapping("/organisations")
    @Secured({"ROLE_MODERATOR"})
    public ResponseEntity<List<TrainerOrganisation>> getAllTrainerOrganisations() {
        return ResponseEntity.ok(trainerService.getAllTrainerOrganisations());
    }

    @GetMapping("/organisations/profile")
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER"})
    public ResponseEntity<TrainerOrganisation> getTrainerOrganisationProfile(
            @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(trainerService.getTrainerOrganisationProfile((String) claims.get("organisationId")));
    }

    @PutMapping("/organisations/profile")
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR"})
    public ResponseEntity<TrainerOrganisation> updateTrainerOrganisationProfile(
            @AuthenticationPrincipal Claims claims,
        @RequestBody TrainerOrganisationDTO request
    ) {
        return ResponseEntity.ok(trainerService.updateTrainerOrganisationProfile((String) claims.get("organisationId"), request));
    }
} 