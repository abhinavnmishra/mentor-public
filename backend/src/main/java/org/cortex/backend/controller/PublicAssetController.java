package org.cortex.backend.controller;

import org.cortex.backend.model.PublicAsset;
import org.cortex.backend.service.PublicAssetService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/public")
public class PublicAssetController {

    private static final Logger logger = LoggerFactory.getLogger(PublicAssetController.class);

    @Autowired
    private PublicAssetService publicAssetService;

    @PostMapping("/upload")
    public ResponseEntity<UUID> uploadFile(@RequestParam("file") MultipartFile file, @RequestParam(required = false, name = "entityId") String entityId) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (entityId == null) entityId = "";

            UUID assetId = publicAssetService.uploadFile(file, entityId);
            return ResponseEntity.ok(assetId);
        } catch (Exception e) {
            logger.error("Error uploading file", e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/download-external")
    public ResponseEntity<UUID> downloadExternalImage(@RequestParam("url") String imageUrl) {
        try {
            UUID assetId = publicAssetService.downloadExternalImage(imageUrl);
            return ResponseEntity.ok(assetId);
        } catch (Exception e) {
            logger.error("Error downloading external image", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getFile(@PathVariable String id) {
        try {
            Optional<PublicAsset> assetOpt = publicAssetService.getAssetById(UUID.fromString(id));
            if (assetOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            PublicAsset asset = assetOpt.get();
            return ResponseEntity.ok()
                    .contentType(asset.getContentType())
                    .body(asset.getData());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
