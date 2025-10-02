package org.cortex.backend.events.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "meta_rule_template")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RuleTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    private String description;

    private String eventType;

    private String entityType;

}
