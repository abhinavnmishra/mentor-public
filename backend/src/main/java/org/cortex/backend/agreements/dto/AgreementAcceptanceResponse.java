package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.cortex.backend.agreements.model.AgreementAcceptance;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgreementAcceptanceResponse {

    private String id;
    private String userId;
    private String agreementVersionId;
    private String agreementId;
    private String agreementTitle;
    private Integer versionNumber;
    private String docSha256;
    private String ipAddress;
    private String userAgent;
    private String correlationId;
    private LocalDateTime acceptedAt;
    private String acceptanceMethod;
    private boolean documentHashValid;

    public static AgreementAcceptanceResponse fromEntity(AgreementAcceptance acceptance) {
        return AgreementAcceptanceResponse.builder()
                .id(acceptance.getId().toString())
                .userId(acceptance.getUserId().toString())
                .agreementVersionId(acceptance.getAgreementVersionUserCopy().getAgreementVersion().getId().toString())
                .agreementId(acceptance.getAgreementVersionUserCopy().getAgreementVersion().getAgreement().getId().toString())
                .agreementTitle(acceptance.getAgreementVersionUserCopy().getAgreementVersion().getAgreement().getTitle())
                .versionNumber(acceptance.getAgreementVersionUserCopy().getAgreementVersion().getVersionNumber())
                .docSha256(acceptance.getDocSha256())
                .ipAddress(acceptance.getIpAddress())
                .userAgent(acceptance.getUserAgent())
                .correlationId(acceptance.getCorrelationId())
                .acceptedAt(acceptance.getAcceptedAt())
                .acceptanceMethod(acceptance.getAcceptanceMethod())
                .documentHashValid(acceptance.isDocumentHashValid())
                .build();
    }
}
