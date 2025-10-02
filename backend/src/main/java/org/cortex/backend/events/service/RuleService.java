package org.cortex.backend.events.service;

import org.cortex.backend.constant.TaskType;
import org.cortex.backend.dto.TaskDto;
import org.cortex.backend.events.dto.RuleInstanceDto;
import org.cortex.backend.events.model.RuleInstance;
import org.cortex.backend.events.model.RuleTemplate;
import org.cortex.backend.events.repository.RuleInstanceRepository;
import org.cortex.backend.events.repository.RuleTemplateRepository;
import org.cortex.backend.model.CoachingProgram;
import org.cortex.backend.model.MilestoneTracker;
import org.cortex.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class RuleService {

    @Autowired
    private TaskService taskService;

    @Autowired
    private RuleInstanceRepository ruleInstanceRepository;

    @Autowired
    private RuleTemplateRepository ruleTemplateRepository;

    public void assignContractOnProgramCreation(CoachingProgram coachingProgram, String contractId){
        TaskDto taskDto = new TaskDto();
        taskDto.setTaskType(TaskType.AGREEMENT);
        taskDto.setTitle("Assigned Contract");
        taskDto.setInstructions("Please review and accept the assigned contract.");
        taskDto.setCoachingProgramId(coachingProgram.getId());
        taskDto.setResourceId(java.util.UUID.fromString(contractId));
        taskService.createTask(taskDto);
    }

    public void assignFormOnProgramCreation(CoachingProgram coachingProgram, String formId){
        TaskDto taskDto = new TaskDto();
        taskDto.setTaskType(TaskType.FORM);
        taskDto.setTitle("Assigned Form");
        taskDto.setInstructions("Please complete the assigned form.");
        taskDto.setCoachingProgramId(coachingProgram.getId());
        taskDto.setResourceId(java.util.UUID.fromString(formId));
        taskService.createTask(taskDto);
    }

    public void ruleForCoachingProgram(String eventType, CoachingProgram coachingProgram){
        List<RuleInstance> ruleInstances = ruleInstanceRepository.findAllByRuleTemplate_EventTypeAndEnabledAndOrganisationId(eventType, true, coachingProgram.getTrainer().getTrainerOrganisation().getId());
        for(RuleInstance ruleInstance : ruleInstances){
            if(ruleInstance.getRuleTemplate().getEntityType().equalsIgnoreCase("AGREEMENT")){
                assignContractOnProgramCreation(coachingProgram, ruleInstance.getEntityId());
            } else if(ruleInstance.getRuleTemplate().getEntityType().equalsIgnoreCase("FORM")){
                assignFormOnProgramCreation(coachingProgram, ruleInstance.getEntityId());
            }
        }
    }

    public void ruleForMilestoneTracker(String eventType, MilestoneTracker milestoneTracker){
//
    }

    public List<RuleTemplate> getAllRuleTemplates() {
        return ruleTemplateRepository.findAll();
    }

    public List<RuleInstance> getAllRuleInstances(String organisationId) {
        return ruleInstanceRepository.findAllByOrganisationId(UUID.fromString(organisationId));
    }

    public RuleInstance createRuleInstance(RuleInstanceDto ruleInstanceDto, String organisationId) {
        RuleInstance ruleInstance = new RuleInstance();
        ruleInstance.setRuleTemplate(ruleTemplateRepository.findById(UUID.fromString(ruleInstanceDto.getRuleTemplateId())).orElseThrow(() -> new RuntimeException("RuleTemplate not found")));
        ruleInstance.setEntityId(ruleInstanceDto.getEntityId());
        ruleInstance.setEntityDisplayName(ruleInstanceDto.getEntityDisplayName());
        ruleInstance.setEnabled((ruleInstanceDto.getEntityId() != null && !ruleInstanceDto.getEntityId().isEmpty()) ? ruleInstanceDto.getEnabled() : false);
        ruleInstance.setOrganisationId(UUID.fromString(organisationId));
        return ruleInstanceRepository.save(ruleInstance);
    }

    public RuleInstance updateRuleInstance(RuleInstanceDto ruleInstanceDto, String organisationId) {
        RuleInstance ruleInstance = ruleInstanceRepository.findById(UUID.fromString(ruleInstanceDto.getId()))
                .orElseThrow(() -> new RuntimeException("RuleInstance not found"));
        ruleInstance.setEnabled((ruleInstanceDto.getEntityId() != null && !ruleInstanceDto.getEntityId().isEmpty()) ? ruleInstanceDto.getEnabled() : false);
        ruleInstance.setEntityId(ruleInstanceDto.getEntityId());
        ruleInstance.setEntityDisplayName(ruleInstanceDto.getEntityDisplayName());
        ruleInstance.setOrganisationId(UUID.fromString(organisationId));
        return ruleInstanceRepository.save(ruleInstance);
    }

}
