package org.cortex.backend.events.service;

import org.cortex.backend.events.model.EventType;
import org.cortex.backend.events.repository.EventTypeRepository;
import org.cortex.backend.model.CoachingProgram;
import org.cortex.backend.model.MilestoneTracker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;

@Service
public class EventService {

    private static final Logger logger = LoggerFactory.getLogger(EventService.class);

    @Autowired
    private EventTypeRepository eventTypeRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private RuleService ruleService;

    private final Map<Class<?>, BiConsumer<Object, String>> HANDLERS = Map.of(
            CoachingProgram.class, (entity, operation) -> {
                logger.info("Handling {} event for CoachingProgram", operation);
                CoachingProgram program = (CoachingProgram) entity;
                List<EventType> eventTypeList = eventTypeRepository.findByEntityClassAndEntityOperation(CoachingProgram.class, operation);
                logger.debug("Found {} event types for CoachingProgram and operation {}", eventTypeList.size(), operation);
                for (EventType eventType : eventTypeList) {
                    logger.debug("Found EventType: {}", eventType.getUniqueName());
                    notificationService.notifyForCoachingProgram(eventType.getUniqueName(), program);
                    ruleService.ruleForCoachingProgram(eventType.getUniqueName(), program);
                }
            },
            MilestoneTracker.class, (entity, operation) -> {
                logger.info("Handling {} event for MilestoneTracker", operation);
                MilestoneTracker milestoneTracker = (MilestoneTracker) entity;
                List<EventType> eventTypeList = eventTypeRepository.findByEntityClassAndEntityOperation(MilestoneTracker.class, operation);
                logger.debug("Found {} event types for MilestoneTracker and operation {}", eventTypeList.size(), operation);
                for (EventType eventType : eventTypeList) {
                    logger.debug("Found EventType: {}", eventType.getUniqueName());
                    notificationService.notifyForMilestoneTracker(eventType.getUniqueName(), milestoneTracker);
                    ruleService.ruleForMilestoneTracker(eventType.getUniqueName(), milestoneTracker);
                }
            }
    );


    @Async
    public void handlePostUpdateEvent(Object entity) {
        try {
            logger.info("Handling post-update event for entity: {}", entity.getClass().getSimpleName());
            // Logic to handle post-update events
            Class<?> clazz = entity.getClass();
            HANDLERS.getOrDefault(clazz, (e, s) -> {
            }).accept(entity, "UPDATE");
        } catch (Exception e) {
            logger.error("Error handling post-update event: {}", e.getMessage(), e);
        }
    }

    @Async
    public void handlePostCreateEvent(Object entity) {
        try {
            logger.info("Handling post-create event for entity: {}", entity.getClass().getSimpleName());
            // Logic to handle post-update events
            Class<?> clazz = entity.getClass();
            HANDLERS.getOrDefault(clazz, (e, s) -> {
            }).accept(entity, "CREATE");
        } catch (Exception e){
            logger.error("Error handling post-create event: {}", e.getMessage(), e);
        }
    }

}
