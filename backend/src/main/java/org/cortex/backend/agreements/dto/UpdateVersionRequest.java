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
public class UpdateVersionRequest {

    @NotNull(message = "Version ID is required")
    private String versionId;

    private List<AgreementPage> pages; // For rich text content

    private String pdfFilePath; // For PDF uploads
}
