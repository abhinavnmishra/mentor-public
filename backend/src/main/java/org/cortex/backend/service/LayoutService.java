package org.cortex.backend.service;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.SideNavDto;
import org.cortex.backend.model.TrainerOrganisation;
import org.cortex.backend.repository.TrainerOrganisationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class LayoutService {

    private static final Logger logger = LoggerFactory.getLogger(LayoutService.class);

    @Autowired
    private TrainerOrganisationRepository trainerOrganisationRepository;

    public SideNavDto getSideNavLayout(Claims claims){
        SideNavDto dto = new SideNavDto();
        String organisationId = (String) claims.get("organisationId");

        TrainerOrganisation org = trainerOrganisationRepository.findById(UUID.fromString(organisationId))
                .orElseThrow(() -> {
                    logger.error("Trainer Organisation not found with ID: {}", organisationId);
                    return new RuntimeException("Trainer Organisation not found");
                });
        dto.setLogoImageUrl(org.getLogoImageUrl());
        dto.setOrgName(org.getName());
        dto.setUserRole((String) claims.get("role"));
        return dto;
    }

}
