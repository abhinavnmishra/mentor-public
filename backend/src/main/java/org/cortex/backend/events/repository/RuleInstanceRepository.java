package org.cortex.backend.events.repository;

import org.cortex.backend.events.model.RuleInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RuleInstanceRepository extends JpaRepository<RuleInstance, UUID> {

    List<RuleInstance> findAllByRuleTemplate_EventTypeAndEnabledAndOrganisationId(String eventType, boolean enabled, UUID organisationId);

    List<RuleInstance> findAllByOrganisationId(UUID organisationId);

}
