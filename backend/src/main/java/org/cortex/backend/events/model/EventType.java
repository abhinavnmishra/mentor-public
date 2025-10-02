package org.cortex.backend.events.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.events.utils.ClassToStringConverter;


@Entity
@Table(name = "meta_event_type")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class EventType {

    @Id
    @Column(length=1000)
    private String uniqueName;

    @Column(length=1000)
    private String displayName;

    @Column(length=5000)
    private String description;

    @Convert(converter = ClassToStringConverter.class)
    @Column(name = "entity_class_name")
    private Class<?> entityClass;

    private String entityOperation; // e.g., "CREATE", "UPDATE"

}