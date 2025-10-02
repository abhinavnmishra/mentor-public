package org.cortex.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "public_asset")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PublicAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Lob
    private byte[] data;

    private String fileName;

    private MediaType contentType;

    private String entityId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
