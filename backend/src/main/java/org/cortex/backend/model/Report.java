package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.dto.ClientReport;
import org.cortex.backend.llm.Reports.model.ReportWizardChat;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "report")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Report {

    @Transient
    public static final int chatCount = 20;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Version version;

    @JsonIgnore
    private String coachingProgramId;

    private Boolean published;

    @Column(length=1000)
    private String programName;

    @Column(length=5000)
    private String programDescription;

    @Column(length=5000)
    private String programObjective;

    @Column(length=5000)
    private String aboutTheTrainer;

    @Column(length=5000)
    private String conclusion;

    @OneToOne
    @JsonIgnore
    private ReportWizardChat reportWizardChat;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<ClientReport> clientReportList;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<FocusAreaReport> focusAreas;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusAreaReport {
        private String focusAreaId;
        private String name;
        private String focusAreaDescriptionSummary;
        private String focusAreaObjectiveSummary;
        private String focusAreaCriteria;
        private FocusArea.Eval eval;
        private Boolean isParent;
        private String parentFocusAreaId;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Version {
        private String reportId;
        private String coachingProgramId;
        private int count;
    }

    /**
     * Converts this Report object to a prettified JSON string
     * @return Indented, human-readable JSON representation of the Report object
     */
    public String toPrettyJson() {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
            return objectMapper.writeValueAsString(this);
        } catch (Exception e) {
            e.printStackTrace();
            return "Error converting Report to JSON: " + e.getMessage();
        }
    }
}
