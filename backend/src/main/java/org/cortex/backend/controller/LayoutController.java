package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.ClientRequestDTO;
import org.cortex.backend.dto.SideNavDto;
import org.cortex.backend.model.Client;
import org.cortex.backend.service.LayoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/layout")
public class LayoutController {

    @Autowired
    private LayoutService layoutService;

    @GetMapping
    @Secured({"ROLE_ADMIN", "ROLE_MODERATOR", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<SideNavDto> createOrUpdateClient(@AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(layoutService.getSideNavLayout(claims));
    }

}
