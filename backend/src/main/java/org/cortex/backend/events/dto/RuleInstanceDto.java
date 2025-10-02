package org.cortex.backend.events.dto;

import lombok.Data;

@Data
public class RuleInstanceDto {

    private String id;

    private String ruleTemplateId;

    private Boolean enabled;

    private String entityId;

    private String entityDisplayName;

}
