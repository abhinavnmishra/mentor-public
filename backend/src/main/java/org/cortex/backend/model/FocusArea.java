package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Entity
@Table(name = "focus_area")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FocusArea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private Boolean isParent;

    private String name;

    @Column(length=5000)
    private String description;

    @Column(length=5000)
    private String objective;

    @Column(length=5000)
    private String criteria;

    @ManyToOne
    private FocusArea parent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Eval eval;

    @JsonIgnore
    @ManyToOne
    private CoachingProgram coachingProgram;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Eval {
        private Double minScore;
        private Double maxScore;
        private Double threshold1;
        private Double threshold2;
        private Double threshold3;
    }

    @JsonIgnore
    public String getContext() {
        return String.format("""
                {
                    "id": "%s",
                    "name": "%s",
                    "description": "%s",
                    "objective": "%s",
                    "criteria": "%s"
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : "",
                description != null ? description.replace("\"", "\\\"") : "",
                objective != null ? objective.replace("\"", "\\\"") : "",
                criteria != null ? criteria.replace("\"", "\\\"") : ""
        );
    }

    @JsonIgnore
    public String getIndexData() {
        return String.format("""
                {
                    "id": "%s",
                    "name": "%s",
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : ""
        );
    }

    public String getHierarchicalName(){
        if (this.isParent || this.parent == null) {
            return this.name;
        } else {
            return this.parent.getName() + " - " + this.name;
        }
    }

    public FocusArea(String name){
        this.name = name;
    }
}
