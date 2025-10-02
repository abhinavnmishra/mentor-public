package org.cortex.backend.events.service;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PostUpdate;
import org.cortex.backend.events.utils.EntityListenerDelegate;
import org.cortex.backend.events.utils.SpringContextBridge;

public class EventListener {

    @PostPersist
    public void postPersist(Object entity) {
        EntityListenerDelegate delegate = SpringContextBridge.getBean(EntityListenerDelegate.class);
        delegate.eventService.handlePostCreateEvent(entity);
    }

    @PostUpdate
    public void afterUpdate(Object entity) {
        EntityListenerDelegate delegate = SpringContextBridge.getBean(EntityListenerDelegate.class);
        delegate.eventService.handlePostUpdateEvent(entity);
    }
}

