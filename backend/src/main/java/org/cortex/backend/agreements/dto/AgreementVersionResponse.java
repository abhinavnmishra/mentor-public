package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.cortex.backend.agreements.constant.AgreementStatus;
import org.cortex.backend.agreements.model.AgreementVersion;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementVersionResponse {

    private String id;
    private String agreementId;
    private Integer versionNumber;
    private AgreementStatus status;
    private List<AgreementVersion.AgreementPage> pages;
    private String pdfFilePath;
    private String generatedPdfAssetId;
    private String docSha256;
    private LocalDateTime publishedAt;
    private LocalDateTime retiredAt;
    private LocalDateTime effectiveAt;
    private String publishedBy;
    private LocalDateTime createdAt;
    private boolean editable;
    private boolean acceptable;

    public static AgreementVersionResponse fromEntity(AgreementVersion version) {
        return AgreementVersionResponse.builder()
                .id(version.getId().toString())
                .agreementId(version.getAgreement().getId().toString())
                .versionNumber(version.getVersionNumber())
                .status(version.getStatus())
                .pages(version.getPages())
                .pdfFilePath(version.getPdfFilePath())
                .generatedPdfAssetId(version.getGeneratedPdfAssetId() != null ? 
                        version.getGeneratedPdfAssetId().toString() : null)
                .docSha256(version.getDocSha256())
                .publishedAt(version.getPublishedAt())
                .retiredAt(version.getRetiredAt())
                .effectiveAt(version.getEffectiveAt())
                .publishedBy(version.getPublishedBy() != null ? version.getPublishedBy().toString() : null)
                .createdAt(version.getCreatedAt())
                .editable(version.isEditable())
                .acceptable(version.isAcceptable())
                .build();
    }
}
