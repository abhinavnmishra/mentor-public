package org.cortex.backend.controller;

import org.cortex.backend.llm.Image.ImageAnalysis;
import org.cortex.backend.llm.Image.ImageAnalysis.DetailedImageDescriptionResponse;
import org.cortex.backend.llm.Image.ImageAnalysis.ImageAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/image-analysis")
public class ImageAnalysisController {

    private static final Logger logger = LoggerFactory.getLogger(ImageAnalysisController.class);

    @Autowired
    private ImageAnalysis imageAnalysisService;

    /**
     * Analyzes an image by its PublicAsset ID
     * 
     * @param assetId The UUID of the PublicAsset containing the image
     * @return ImageAnalysisResponse containing text, colors, and description
     */
    @PostMapping("/analyze/{assetId}")
    public ResponseEntity<ImageAnalysisResponse> analyzeImage(@PathVariable UUID assetId) {
        logger.info("Request to analyze image with asset ID: {}", assetId);
        
        try {
            ImageAnalysisResponse analysisResult = imageAnalysisService.analyzeImageById(assetId);
            logger.info("Image analysis completed successfully for asset ID: {}", assetId);
            return ResponseEntity.ok(analysisResult);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for image analysis: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error analyzing image with asset ID {}: {}", assetId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Analyzes an image by its PublicAsset ID (GET endpoint for convenience)
     * 
     * @param assetId The UUID of the PublicAsset containing the image
     * @return ImageAnalysisResponse containing text, colors, and description
     */
    @GetMapping("/analyze/{assetId}")
    public ResponseEntity<ImageAnalysisResponse> analyzeImageGet(@PathVariable UUID assetId) {
        logger.info("GET request to analyze image with asset ID: {}", assetId);
        return analyzeImage(assetId);
    }
    
    /**
     * Provides a detailed description of an image by its PublicAsset ID
     * 
     * @param assetId The UUID of the PublicAsset containing the image
     * @return DetailedImageDescriptionResponse containing comprehensive description and metadata
     */
    @PostMapping("/describe/{assetId}")
    public ResponseEntity<String> describeImage(@PathVariable UUID assetId) {
        logger.info("Request to describe image in detail with asset ID: {}", assetId);
        
        try {
            DetailedImageDescriptionResponse descriptionResult = imageAnalysisService.describeImageInDetail(assetId);
            logger.info("Detailed image description completed successfully for asset ID: {}", assetId);
            return ResponseEntity.ok(descriptionResult.toXmlString());
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid request for detailed image description: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error describing image with asset ID {}: {}", assetId, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Provides a detailed description of an image by its PublicAsset ID (GET endpoint for convenience)
     * 
     * @param assetId The UUID of the PublicAsset containing the image
     * @return DetailedImageDescriptionResponse containing comprehensive description and metadata
     */
    @GetMapping("/describe/{assetId}")
    public ResponseEntity<String> describeImageGet(@PathVariable UUID assetId) {
        logger.info("GET request to describe image in detail with asset ID: {}", assetId);
        return describeImage(assetId);
    }
    
    /**
     * Health check endpoint for the image analysis service
     * 
     * @return Simple status response
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Image Analysis Service is running");
    }
} 