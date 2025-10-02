package org.cortex.backend.events.repository;

import org.cortex.backend.events.model.RuleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RuleTemplateRepository extends JpaRepository<RuleTemplate, UUID> {
    
    List<RuleTemplate> findByEventType(String eventType);
    
}
