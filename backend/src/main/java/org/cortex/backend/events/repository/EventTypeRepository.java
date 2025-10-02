package org.cortex.backend.events.repository;

import org.cortex.backend.events.model.EventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventTypeRepository extends JpaRepository<EventType, String> {

    List<EventType> findByEntityClassAndEntityOperation(Class<?> targetClass, String operation);

}
