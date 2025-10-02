package org.cortex.backend.events.repository;

import org.cortex.backend.events.model.Notifications;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NotificationsRepository extends JpaRepository<Notifications, UUID> {

    List<Notifications> findAllByUserIdAndIsAcknowledgedOrderByCreatedAtDesc(UUID userId, boolean isAcknowledged);

    Optional<Notifications> findByIdAndUserId(UUID id, UUID userId);
}
