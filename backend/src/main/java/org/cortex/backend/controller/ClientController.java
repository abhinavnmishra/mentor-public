package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.ClientRequestDTO;
import org.cortex.backend.dto.ClientOrganisationDTO;
import org.cortex.backend.dto.MenteeMetadataDto;
import org.cortex.backend.model.Client;
import org.cortex.backend.model.ClientOrganisation;
import org.cortex.backend.service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
public class ClientController {

    @Autowired
    private ClientService clientService;

    @PostMapping
    public ResponseEntity<Client> createOrUpdateClient(@RequestBody ClientRequestDTO request, @AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(clientService.createOrUpdateClientWithSession(request, claims));
    }

    @PostMapping("/organisations")
    public ResponseEntity<ClientOrganisation> createOrUpdateClientOrganisation(
        @AuthenticationPrincipal Claims claims,
        @RequestBody ClientOrganisationDTO request
    ) {
        return ResponseEntity.ok(clientService.createOrUpdateClientOrganisation(request, (String) claims.get("organisationId")));
    }


    @GetMapping("/organisations")
    public ResponseEntity<List<ClientOrganisation>> getAllClientOrganisations(@AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(clientService.getAllClientOrganisations((String) claims.get("organisationId")).reversed());
    }

    @GetMapping("/organisations/{organisationId}")
    public ResponseEntity<ClientOrganisation> getClientOrganisation(
        @PathVariable String organisationId
    ) {
        return ResponseEntity.ok(clientService.getClientOrganisation(organisationId));
    }

    @GetMapping("/tagging/{surveyId}")
    public ResponseEntity<List<MenteeMetadataDto>> getMenteesForTagging(
            @PathVariable String surveyId
    ) {
        return ResponseEntity.ok(clientService.getClientsForTagging(surveyId));
    }
} 