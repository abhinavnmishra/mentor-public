package org.cortex.backend.events.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.events.dto.RuleInstanceDto;
import org.cortex.backend.events.service.RuleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rules")
public class RuleController {

    @Autowired
    private RuleService ruleService;

    @GetMapping("/templates")
    public ResponseEntity<?> fetchAllRuleTemplates(
            @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(ruleService.getAllRuleTemplates());
    }

    @GetMapping("/")
    public ResponseEntity<?> fetchAllRuleInstances(
            @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(ruleService.getAllRuleInstances((String) claims.get("organisationId")));
    }

    @PostMapping("/")
    public ResponseEntity<?> createRuleInstance(
            @AuthenticationPrincipal Claims claims,
            @RequestBody RuleInstanceDto dto
            ) {
        return ResponseEntity.ok(ruleService.createRuleInstance(dto, (String) claims.get("organisationId")));
    }

    @PutMapping("/")
    public ResponseEntity<?> updateRuleInstance(
            @AuthenticationPrincipal Claims claims,
            @RequestBody RuleInstanceDto dto
    ) {
        return ResponseEntity.ok(ruleService.updateRuleInstance(dto, (String) claims.get("organisationId")));
    }

}
