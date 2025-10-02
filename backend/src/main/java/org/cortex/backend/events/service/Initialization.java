package org.cortex.backend.events.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.cortex.backend.events.model.EventType;
import org.cortex.backend.events.model.NotificationTrigger;
import org.cortex.backend.events.model.RuleTemplate;
import org.cortex.backend.events.repository.EventTypeRepository;
import org.cortex.backend.events.repository.NotificationTriggerRepository;
import org.cortex.backend.events.repository.RuleTemplateRepository;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class Initialization {

    private final EventTypeRepository eventTypeRepository;
    private final NotificationTriggerRepository notificationTriggerRepository;
    private final RuleTemplateRepository ruleTemplateRepository;
    private final ObjectMapper objectMapper;

    @PostConstruct
    public void initializeEventData() {
        initializeEventTypes();
        initializeNotificationTriggers();
        initializeRuleTemplates();
    }

    private void initializeEventTypes() {
        try {
            ClassPathResource resource = new ClassPathResource("event/event_types.json");
            InputStream inputStream = resource.getInputStream();
            
            List<Map<String, Object>> eventTypeData = objectMapper.readValue(
                    inputStream, 
                    new TypeReference<List<Map<String, Object>>>() {}
            );
            
            for (Map<String, Object> data : eventTypeData) {
                String uniqueName = (String) data.get("uniqueName");
                
                // Skip if event type already exists
                if (eventTypeRepository.findById(uniqueName).isPresent()) {
                    log.info("EventType with uniqueName '{}' already exists, skipping", uniqueName);
                    continue;
                }
                
                EventType eventType = new EventType();
                eventType.setUniqueName(uniqueName);
                eventType.setDisplayName((String) data.get("displayName"));
                eventType.setDescription((String) data.get("description"));
                eventType.setEntityOperation((String) data.get("entityOperation"));
                
                // Load the class from the className field
                String className = (String) data.get("className");
                try {
                    Class<?> entityClass = Class.forName(className);
                    eventType.setEntityClass(entityClass);
                    eventType.setEntityOperation("CREATE"); // Default operation
                    
                    eventTypeRepository.save(eventType);
                    log.info("Created EventType: {}", uniqueName);
                } catch (ClassNotFoundException e) {
                    log.error("Failed to load class for EventType {}: {}", uniqueName, e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Failed to initialize EventTypes: {}", e.getMessage());
        }
    }
    
    private void initializeNotificationTriggers() {
        try {
            ClassPathResource resource = new ClassPathResource("event/notification_trigger.json");
            InputStream inputStream = resource.getInputStream();
            
            List<Map<String, Object>> triggerData = objectMapper.readValue(
                    inputStream, 
                    new TypeReference<List<Map<String, Object>>>() {}
            );
            
            for (Map<String, Object> data : triggerData) {
                String eventTypeUniqueName = (String) data.get("eventTypeUniqueName");
                
                // Check if the event type exists
                Optional<EventType> eventType = eventTypeRepository.findById(eventTypeUniqueName);
                if (eventType.isEmpty()) {
                    log.warn("EventType with uniqueName '{}' not found, skipping trigger", eventTypeUniqueName);
                    continue;
                }
                
                // Check if notification trigger with same event type already exists
                List<NotificationTrigger> existingTriggers = 
                        notificationTriggerRepository.findAllByEventTypeUniqueName(eventTypeUniqueName);
                
                if (!existingTriggers.isEmpty()) {
                    log.info("NotificationTrigger for eventType '{}' already exists, skipping", eventTypeUniqueName);
                    continue;
                }
                
                NotificationTrigger trigger = new NotificationTrigger();
                trigger.setEventTypeUniqueName(eventTypeUniqueName);
                trigger.setMessage((String) data.get("message"));
                trigger.setCta((String) data.get("cta"));
                trigger.setSeverity((String) data.get("severity"));
                trigger.setIsEmailEnabled((Boolean) data.get("isEmailEnabled"));
                
                notificationTriggerRepository.save(trigger);
                log.info("Created NotificationTrigger for eventType: {}", eventTypeUniqueName);
            }
        } catch (IOException e) {
            log.error("Failed to initialize NotificationTriggers: {}", e.getMessage());
        }
    }
    
    private void initializeRuleTemplates() {
        try {
            ClassPathResource resource = new ClassPathResource("event/rules.json");
            InputStream inputStream = resource.getInputStream();
            
            List<Map<String, Object>> ruleData = objectMapper.readValue(
                    inputStream, 
                    new TypeReference<List<Map<String, Object>>>() {}
            );
            
            for (Map<String, Object> data : ruleData) {
                String title = (String) data.get("title");
                String eventType = (String) data.get("eventType");
                
                // Check if the event type exists
                Optional<EventType> eventTypeEntity = eventTypeRepository.findById(eventType);
                if (eventTypeEntity.isEmpty()) {
                    log.warn("EventType with uniqueName '{}' not found, skipping rule template: {}", 
                            eventType, title);
                    continue;
                }
                
                // Check if rule with same title already exists
                List<RuleTemplate> existingRules = ruleTemplateRepository.findAll();
                boolean exists = existingRules.stream()
                        .anyMatch(rule -> rule.getTitle().equals(title) && rule.getEventType().equals(eventType));
                
                if (exists) {
                    log.info("RuleTemplate with title '{}' for eventType '{}' already exists, skipping", 
                            title, eventType);
                    continue;
                }
                
                RuleTemplate ruleTemplate = new RuleTemplate();
                ruleTemplate.setTitle(title);
                ruleTemplate.setEventType(eventType);
                ruleTemplate.setDescription((String) data.get("description"));
                ruleTemplate.setEntityType((String) data.get("entityType"));
                
                ruleTemplateRepository.save(ruleTemplate);
                log.info("Created RuleTemplate: {} for eventType: {}", title, eventType);
            }
        } catch (IOException e) {
            log.error("Failed to initialize RuleTemplates: {}", e.getMessage());
        }
    }
}
