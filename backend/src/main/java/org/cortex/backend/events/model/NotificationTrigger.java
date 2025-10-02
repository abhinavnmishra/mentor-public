package org.cortex.backend.events.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Entity
@Table(name = "meta_notification_trigger")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class NotificationTrigger {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String eventTypeUniqueName;
    private String message;
    private String cta;
    private String severity; // e.g., "INFO", "WARNING", "CRITICAL"
    private Boolean isEmailEnabled;

    public Notifications toNotification(UUID userId, Map<String, String> arguments) {
        String finalMessage = this.message;
        for (Map.Entry<String, String> entry : arguments.entrySet()) {
            finalMessage = finalMessage.replaceAll(Pattern.quote("{{" + entry.getKey().toUpperCase() + "}}"), entry.getValue());
        }

        Notifications notification = new Notifications();
        notification.setMessage(finalMessage);
        notification.setCta(this.cta);
        notification.setSeverity(this.severity);
        notification.setUserId(userId);
        notification.setIsAcknowledged(false);
        return notification;
    }

}
