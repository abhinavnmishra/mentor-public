package org.cortex.backend.events.utils;

import org.cortex.backend.events.service.EventService;
import org.cortex.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class EntityListenerDelegate {

    @Autowired
    public EventService eventService;
}

