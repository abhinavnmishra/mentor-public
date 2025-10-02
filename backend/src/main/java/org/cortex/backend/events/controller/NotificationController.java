package org.cortex.backend.events.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.events.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/close/{id}")
    public ResponseEntity<?> acknowledgeNotification(
            @PathVariable String id,
            @AuthenticationPrincipal Claims claims
            ) {
        notificationService.acknowledgeNotification(id, (String) claims.get("userId"));
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/close")
    public ResponseEntity<?> acknowledgeAllNotifications(
            @AuthenticationPrincipal Claims claims
    ) {
        notificationService.acknowledgeAllNotifications((String) claims.get("userId"));
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/fetch")
    public ResponseEntity<?> fetchAllNotifications(
            @AuthenticationPrincipal Claims claims
    ) {
        return ResponseEntity.ok(notificationService.getAllNotificationsByUserId((String) claims.get("userId")));
    }

}
