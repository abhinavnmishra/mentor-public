package org.cortex.backend.events.service;

import org.cortex.backend.events.model.EventType;
import org.cortex.backend.events.model.NotificationTrigger;
import org.cortex.backend.events.model.Notifications;
import org.cortex.backend.events.repository.NotificationTriggerRepository;
import org.cortex.backend.events.repository.NotificationsRepository;
import org.cortex.backend.model.CoachingProgram;
import org.cortex.backend.model.MilestoneTracker;
import org.cortex.backend.model.Trainer;
import org.cortex.backend.model.TrainerOrganisation;
import org.cortex.backend.repository.TrainerRepository;
import org.cortex.backend.security.constant.Role;
import org.cortex.backend.security.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private NotificationsRepository notificationsRepository;

    @Autowired
    private NotificationTriggerRepository notificationTriggerRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Async
    public void notifyForCoachingProgram(String eventId, CoachingProgram coachingProgram){
        try {
            logger.info("Notifying for event: {} and CoachingProgram: {}", eventId, coachingProgram.getId());
            List<NotificationTrigger> notificationTriggers = notificationTriggerRepository.findAllByEventTypeUniqueName(eventId);
            logger.debug("Found {} notification triggers for event: {}", notificationTriggers.size(), eventId);

            List<UUID> userList = new ArrayList<>();
            userList.add(coachingProgram.getTrainer().getUser().getId());

            TrainerOrganisation trainerOrganisation = coachingProgram.getTrainer().getTrainerOrganisation();
            List<UUID> adminUserIds = trainerRepository.findByTrainerOrganisation_Id(trainerOrganisation.getId())
                    .stream().filter(t -> t.getUser().getRole().equals(Role.ROLE_ADMIN)).map(t -> t.getUser().getId()).toList();
            userList.addAll(adminUserIds);

            Set<UUID> uuidSet = new HashSet<>(userList);

            List<Notifications> notifications = new ArrayList<>();

            for (NotificationTrigger notificationTrigger : notificationTriggers) {
                for (UUID userId : uuidSet) {
                    logger.debug("Creating notification for user: {}", userId);
                    Map<String, String> arguments = new HashMap<>();
                    arguments.put("NAME", coachingProgram.getTitle());
                    notifications.add(notificationTrigger.toNotification(userId, arguments));
                }
            }
            notificationsRepository.saveAll(notifications);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Error while notifying for CoachingProgram: {}", e.getMessage());
        }
    }


    @Async
    public void notifyForMilestoneTracker(String eventId, MilestoneTracker milestoneTracker){
        try {
            logger.info("Notifying for event: {} and MilestoneTracker: {}", eventId, milestoneTracker.getId());
            List<NotificationTrigger> notificationTriggers = notificationTriggerRepository.findAllByEventTypeUniqueName(eventId);
            logger.debug("Found {} notification triggers for event: {}", notificationTriggers.size(), eventId);

            List<UUID> userList = new ArrayList<>();
            userList.add(milestoneTracker.getCoachingSession().getClient().getUser().getId());

            Set<UUID> uuidSet = new HashSet<>(userList);

            List<Notifications> notifications = new ArrayList<>();

            for (NotificationTrigger notificationTrigger : notificationTriggers) {
                for (UUID userId : uuidSet) {
                    logger.debug("Creating notification for user: {}", userId);
                    Map<String, String> arguments = new HashMap<>();
                    arguments.put("NAME", milestoneTracker.getProgramMilestone().getType().toString());
                    notifications.add(notificationTrigger.toNotification(userId, arguments));
                }
            }
            notificationsRepository.saveAll(notifications);
        } catch (Exception e) {
            e.printStackTrace();
            logger.error("Error while notifying for MilestoneTracker: {}", e.getMessage());
        }
    }

    public List<Notifications> getAllNotificationsByUserId(String userId){
        return notificationsRepository.findAllByUserIdAndIsAcknowledgedOrderByCreatedAtDesc(UUID.fromString(userId), false);
    }

    public void acknowledgeNotification(String notificationId, String userId){
        Optional<Notifications> optionalNotifications = notificationsRepository.findByIdAndUserId(UUID.fromString(notificationId), UUID.fromString(userId));
        if(optionalNotifications.isPresent()){
            Notifications notifications = optionalNotifications.get();
            notifications.setIsAcknowledged(true);
            notificationsRepository.save(notifications);
        }
    }

    public void acknowledgeAllNotifications(String userId){
        List<Notifications> openNotifications = notificationsRepository.findAllByUserIdAndIsAcknowledgedOrderByCreatedAtDesc(UUID.fromString(userId), false);
        for (Notifications notifications : openNotifications){
            notifications.setIsAcknowledged(true);
            notificationsRepository.save(notifications);
        }
    }

}
