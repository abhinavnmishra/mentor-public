package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.llm.Image.ImageAnalysis;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trainer_organisation")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TrainerOrganisation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String email;

    private String website;

    @Column(length=5000)
    private String about;

    @Column(length=5000)
    private String header;

    @Column(length=200)
    private String headerImageId;

    @Column(length=5000)
    private String footer;

    @Column(length=200)
    private String footerImageId;

    private String logoImageUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private ImageAnalysis.ImageAnalysisResponse logoImageDescription;

    @Column(length=7)
    private String primaryBrandColor;

    @Column(length=7)
    private String secondaryBrandColor;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @JsonIgnore
    public String getContext() {
        ObjectMapper objectMapper = new ObjectMapper();
        String logoImageDescriptionString = "";
        try {
            logoImageDescriptionString = logoImageDescription != null ? objectMapper.writeValueAsString(logoImageDescription).replace("\"", "\\\"") : "";
        } catch (JsonProcessingException e) {
            logoImageDescriptionString = "Error processing description";
        }

        return String.format("""
                    {
                        "id": "%s",
                        "name": "%s",
                        "email": "%s",
                        "website": "%s",
                        "about": "%s",
                        "header": "%s",
                        "footer": "%s",
                        "logo_image_description": "%s",
                        "primary_brand_color": "%s",
                        "secondary_brand_color": "%s"
                    }""",
                id,
                name != null ? name.replace("\"", "\\\"") : "",
                email != null ? email.replace("\"", "\\\"") : "",
                website != null ? website.replace("\"", "\\\"") : "",
                about != null ? about.replace("\"", "\\\"") : "",
                header != null ? header.replace("\"", "\\\"") : "",
                footer != null ? footer.replace("\"", "\\\"") : "",
                logoImageDescriptionString,
                primaryBrandColor != null ? primaryBrandColor.replace("\"", "\\\"") : "",
                secondaryBrandColor != null ? secondaryBrandColor.replace("\"", "\\\"") : ""
        );
    }

    @JsonIgnore
    public String getIndexData() {
        return String.format("""
                {
                    "id": "%s",
                    "name": "%s"
                }""",
                id,
                name != null ? name.replace("\"", "\\\"") : ""
        );
    }
}
