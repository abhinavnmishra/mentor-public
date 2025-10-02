package org.cortex.backend.events.repository;

import org.cortex.backend.events.model.NotificationTrigger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationTriggerRepository extends JpaRepository<NotificationTrigger, UUID> {

    List<NotificationTrigger> findAllByEventTypeUniqueName(String uniqueName);

}