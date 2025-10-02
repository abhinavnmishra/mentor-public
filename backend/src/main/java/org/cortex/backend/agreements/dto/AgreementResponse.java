package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.cortex.backend.agreements.model.Agreement;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementResponse {

    private String id;
    private String title;
    private String description;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AgreementVersionResponse> versions;
    private AgreementVersionResponse latestVersion;
    private AgreementVersionResponse currentPublishedVersion;

    public static AgreementResponse fromEntity(Agreement agreement) {
        return AgreementResponse.builder()
                .id(agreement.getId().toString())
                .title(agreement.getTitle())
                .description(agreement.getDescription())
                .createdBy(agreement.getCreatedBy().toString())
                .createdAt(agreement.getCreatedAt())
                .updatedAt(agreement.getUpdatedAt())
                .versions(agreement.getVersions().stream()
                        .map(AgreementVersionResponse::fromEntity)
                        .collect(Collectors.toList()))
                .latestVersion(agreement.getLatestVersion() != null ?
                        AgreementVersionResponse.fromEntity(agreement.getLatestVersion()) : null)
                .currentPublishedVersion(agreement.getCurrentPublishedVersion() != null ?
                        AgreementVersionResponse.fromEntity(agreement.getCurrentPublishedVersion()) : null)
                .build();
    }
}
