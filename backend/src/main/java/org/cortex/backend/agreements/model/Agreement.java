package org.cortex.backend.agreements.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "agreement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Agreement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 3000)
    private String description;

    @Column(nullable = false)
    private UUID createdBy; // User ID who created the agreement

    @Column(nullable = false)
    private UUID organisationId; // Org ID which created the agreement

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "agreement", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<AgreementVersion> versions = new ArrayList<>();

    public void addVersion(AgreementVersion version) {
        versions.add(version);
        version.setAgreement(this);
    }

    public AgreementVersion getLatestVersion() {
        return versions.stream()
                .max((v1, v2) -> v1.getVersionNumber().compareTo(v2.getVersionNumber()))
                .orElse(null);
    }

    public AgreementVersion getCurrentPublishedVersion() {
        return versions.stream()
                .filter(v -> v.getStatus() == org.cortex.backend.agreements.constant.AgreementStatus.PUBLISHED)
                .max((v1, v2) -> v1.getVersionNumber().compareTo(v2.getVersionNumber()))
                .orElse(null);
    }
}
