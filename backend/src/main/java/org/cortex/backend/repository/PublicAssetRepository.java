package org.cortex.backend.repository;

import org.cortex.backend.model.PublicAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PublicAssetRepository extends JpaRepository<PublicAsset, UUID> {

    List<PublicAsset> findAllByEntityIdOrderByUpdatedAtDesc(String entityId);

}
