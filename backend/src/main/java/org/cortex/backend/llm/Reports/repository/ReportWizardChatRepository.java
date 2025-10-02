package org.cortex.backend.llm.Reports.repository;

import org.cortex.backend.llm.Reports.model.ReportWizardChat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReportWizardChatRepository extends JpaRepository<ReportWizardChat, UUID> {
}
