package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.cortex.backend.agreements.model.AgreementVersionUserCopy;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementVersionUserCopyResponse {

    private String id;
    private String agreementVersionId;
    private String agreementId;
    private String agreementTitle;
    private Integer versionNumber;
    private String userId;
    private String userName;
    private String userEmail;
    private String userOrganisation;
    private String generatedPdfAssetId;
    private String docSha256;
    private LocalDateTime hashCreatedAt;
    private LocalDateTime createdAt;

    public static AgreementVersionUserCopyResponse fromEntity(AgreementVersionUserCopy userCopy) {
        return AgreementVersionUserCopyResponse.builder()
                .id(userCopy.getId().toString())
                .agreementVersionId(userCopy.getAgreementVersion().getId().toString())
                .agreementId(userCopy.getAgreementVersion().getAgreement().getId().toString())
                .agreementTitle(userCopy.getAgreementVersion().getAgreement().getTitle())
                .versionNumber(userCopy.getAgreementVersion().getVersionNumber())
                .userId(userCopy.getUserId().toString())
                .userName(userCopy.getUserName())
                .userEmail(userCopy.getUserEmail())
                .userOrganisation(userCopy.getUserOrganisation())
                .generatedPdfAssetId(userCopy.getGeneratedPdfAssetId() != null ? 
                        userCopy.getGeneratedPdfAssetId().toString() : null)
                .docSha256(userCopy.getDocSha256())
                .hashCreatedAt(userCopy.getHashCreatedAt())
                .createdAt(userCopy.getCreatedAt())
                .build();
    }
}
