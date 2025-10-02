package org.cortex.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.llm.Image.ImageAnalysis;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrainerOrganisationDTO {
    private String name;
    private String email;
    private String website;
    private String about;
    private String header;
    private String headerImageId;
    private String footer;
    private String footerImageId;
    private String logoImageUrl;
    private ImageAnalysis.ImageAnalysisResponse logoImageDescription;
    private String primaryBrandColor;
    private String secondaryBrandColor;
} 