package org.cortex.backend.agreements.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.cortex.backend.agreements.model.AgreementVersion.AgreementPage;

import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateVersionRequest {

    private String agreementId;

    private List<AgreementPage> pages; // For rich text content

    private String pdfFilePath; // For PDF uploads
}
