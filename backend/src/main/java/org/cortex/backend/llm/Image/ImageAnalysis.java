package org.cortex.backend.llm.Image;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.cortex.backend.model.PublicAsset;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.cortex.backend.service.PublicAssetService;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class ImageAnalysis {

    private static final Logger logger = LoggerFactory.getLogger(ImageAnalysis.class);
    private static final String REQUEST_LOG_DIR = "logs/image_analysis_requests";
    private static final String RESPONSE_LOG_DIR = "logs/image_analysis_responses";

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PublicAssetService publicAssetService;

    private static final String OPENAI_FILES_API_URL = "https://api.openai.com/v1/files";
    private static final String OPENAI_RESPONSES_API_URL = "https://api.openai.com/v1/responses";
    private static final String MODEL = "gpt-4.1-nano-2025-04-14";
    private static final String VISION_MODEL = "gpt-4.1-nano-2025-04-14";

    /**
     * Uploads a file to OpenAI's files API
     * 
     * @param publicAsset The PublicAsset containing the file data
     * @param purpose The intended purpose of the uploaded file (assistants, batch, fine-tune, vision, user_data, evals)
     * @return OpenAIFileUploadResponse containing the uploaded file details
     * @throws RuntimeException if the upload fails
     */
    public OpenAIFileUploadResponse uploadFileToOpenAI(PublicAsset publicAsset, String purpose) {
        logger.info("Starting file upload to OpenAI API. File: {}, Purpose: {}", publicAsset.getFileName(), purpose);
        
        try {
            // Validate inputs
            if (publicAsset == null || publicAsset.getData() == null) {
                throw new IllegalArgumentException("PublicAsset and its data cannot be null");
            }
            
            if (purpose == null || purpose.trim().isEmpty()) {
                throw new IllegalArgumentException("Purpose cannot be null or empty");
            }
            
            // Validate purpose against allowed values
            if (!isValidPurpose(purpose)) {
                throw new IllegalArgumentException("Invalid purpose. Must be one of: assistants, batch, fine-tune, vision, user_data, evals");
            }
            
            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // Create a ByteArrayResource from the PublicAsset data
            ByteArrayResource fileResource = new ByteArrayResource(publicAsset.getData()) {
                @Override
                public String getFilename() {
                    return publicAsset.getFileName() != null ? publicAsset.getFileName() : "uploaded_file";
                }
            };
            
            // Build the multipart request body
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", fileResource);
            body.add("purpose", purpose);
            
            // Create the request entity
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // Make the API call
            logger.debug("Sending file upload request to OpenAI API");
            ResponseEntity<OpenAIFileUploadResponse> response = restTemplate.postForEntity(
                OPENAI_FILES_API_URL, 
                requestEntity, 
                OpenAIFileUploadResponse.class
            );
            
            if (response.getStatusCode().is2xxSuccessful()) {
                OpenAIFileUploadResponse responseBody = response.getBody();
                if (responseBody != null) {
                    logger.info("File uploaded successfully to OpenAI. File ID: {}", responseBody.getId());
                    return responseBody;
                } else {
                    logger.error("Received successful status but empty response body");
                    throw new RuntimeException("Received successful status but empty response body");
                }
            } else {
                logger.error("Failed to upload file to OpenAI. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to upload file to OpenAI API. Status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error uploading file to OpenAI API", e);
            throw new RuntimeException("Failed to upload file to OpenAI: " + e.getMessage(), e);
        }
    }

    /**
     * Analyzes an image by first uploading it to OpenAI and then using the responses API
     * to extract text, brand colors, and description
     * 
     * @param publicAsset The PublicAsset containing the image data
     * @return ImageAnalysisResponse containing the analysis results
     * @throws RuntimeException if the analysis fails
     */
    public ImageAnalysisResponse analyzeImage(PublicAsset publicAsset) {
        logger.info("Starting image analysis for file: {}", publicAsset.getFileName());
        
        try {
            // Create logs directory if it doesn't exist
            createLogDirectories();
            
            // Step 1: Upload the file to OpenAI
            OpenAIFileUploadResponse uploadResponse = uploadFileToOpenAI(publicAsset, "vision");
            String fileId = uploadResponse.getId();
            
            // Step 2: Create the analysis request
            ImageAnalysisRequest analysisRequest = createAnalysisRequest(fileId);
            
            // Save request to file for debugging
            saveRequestToFile(analysisRequest);
            
            // Step 3: Call the responses API
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<ImageAnalysisRequest> requestEntity = new HttpEntity<>(analysisRequest, headers);
            
            logger.debug("Sending image analysis request to OpenAI responses API");
            ResponseEntity<ImageAnalysisOpenAIResponse> response = restTemplate.postForEntity(
                OPENAI_RESPONSES_API_URL,
                requestEntity,
                ImageAnalysisOpenAIResponse.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Save response to file for debugging
                saveResponseToFile(response.getBody());
                
                // Extract the analysis result from the response
                ImageAnalysisResponse analysisResult = extractAnalysisResult(response.getBody());
                analysisResult.setAssetId(publicAsset.getId().toString());
                logger.info("Image analysis completed successfully for file: {}", publicAsset.getFileName());
                return analysisResult;
            } else {
                logger.error("Failed to analyze image. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to analyze image. Status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error analyzing image", e);
            throw new RuntimeException("Failed to analyze image: " + e.getMessage(), e);
        }
    }
    
    /**
     * Creates the analysis request for the OpenAI responses API
     */
    private ImageAnalysisRequest createAnalysisRequest(String fileId) {
        ImageAnalysisRequest request = new ImageAnalysisRequest();
        request.setModel(MODEL);
        request.setTemperature(0.2);
        request.setMax_output_tokens(2000);
        
        // Create the input message
        ImageAnalysisRequest.InputMessage inputMessage = new ImageAnalysisRequest.InputMessage();
        inputMessage.setRole("user");
        
        // Create content array with file and text
        List<ImageAnalysisRequest.Content> contentList = new ArrayList<>();
        
        // Add file content
        ImageAnalysisRequest.Content fileContent = new ImageAnalysisRequest.Content();
        fileContent.setType("input_image");
        fileContent.setFileId(fileId);
        contentList.add(fileContent);
        
        // Add text prompt
        ImageAnalysisRequest.Content textContent = new ImageAnalysisRequest.Content();
        textContent.setType("input_text");
        textContent.setText("Please analyze this image and provide the following information in JSON format: " +
                "1. Any text present in the image (if any) " +
                "2. The primary brand color (as hex code) " +
                "3. The secondary brand color (as hex code) " +
                "4. A brief description of the image content");
        contentList.add(textContent);
        
        inputMessage.setContent(contentList);
        request.setInput(Arrays.asList(inputMessage));
        
        // Set up JSON schema for structured response
        request.setText(createResponseFormat());
        
        return request;
    }
    
    /**
     * Creates the JSON schema for structured response
     */
    private ImageAnalysisRequest.ObjectFormat createResponseFormat() {
        ImageAnalysisRequest.ObjectFormat objectFormat = new ImageAnalysisRequest.ObjectFormat();
        ImageAnalysisRequest.JsonSchema jsonSchema = new ImageAnalysisRequest.JsonSchema();
        
        jsonSchema.setType("json_schema");
        jsonSchema.setName("image_analysis_schema");
        jsonSchema.setStrict(true);
        
        // Create the schema structure
        Map<String, Object> schema = new HashMap<>();
        schema.put("type", "object");
        
        Map<String, Object> properties = new HashMap<>();
        
        // Text property
        Map<String, Object> textProperty = new HashMap<>();
        textProperty.put("type", "string");
        textProperty.put("description", "Any text found in the image, empty string if no text");
        properties.put("text", textProperty);
        
        // Primary color property
        Map<String, Object> primaryColorProperty = new HashMap<>();
        primaryColorProperty.put("type", "string");
        primaryColorProperty.put("description", "Primary brand color as hex code (e.g., #FF5733)");
        properties.put("primaryColor", primaryColorProperty);
        
        // Secondary color property
        Map<String, Object> secondaryColorProperty = new HashMap<>();
        secondaryColorProperty.put("type", "string");
        secondaryColorProperty.put("description", "Secondary brand color as hex code (e.g., #33FF57)");
        properties.put("secondaryColor", secondaryColorProperty);
        
        // Description property
        Map<String, Object> descriptionProperty = new HashMap<>();
        descriptionProperty.put("type", "string");
        descriptionProperty.put("description", "Brief description of the image content");
        properties.put("description", descriptionProperty);
        
        schema.put("properties", properties);
        schema.put("required", Arrays.asList("text", "primaryColor", "secondaryColor", "description"));
        schema.put("additionalProperties", false);
        
        jsonSchema.setSchema(schema);
        objectFormat.setFormat(jsonSchema);
        
        return objectFormat;
    }
    
    /**
     * Extracts the analysis result from the OpenAI response
     */
    private ImageAnalysisResponse extractAnalysisResult(ImageAnalysisOpenAIResponse openAIResponse) {
        try {
            if (openAIResponse.getOutput() != null && !openAIResponse.getOutput().isEmpty()) {
                ImageAnalysisOpenAIResponse.Output output = openAIResponse.getOutput().get(0);
                if (output.getContent() != null && !output.getContent().isEmpty()) {
                    String jsonContent = output.getContent().get(0).getText();
                    
                    // Parse the JSON response
                    ObjectMapper mapper = new ObjectMapper();
                    return mapper.readValue(jsonContent, ImageAnalysisResponse.class);
                }
            }
            
            // Fallback if parsing fails
            ImageAnalysisResponse fallback = new ImageAnalysisResponse();
            fallback.setText("Unable to extract text");
            fallback.setPrimaryColor("#000000");
            fallback.setSecondaryColor("#FFFFFF");
            fallback.setDescription("Unable to analyze image");
            return fallback;
            
        } catch (Exception e) {
            logger.error("Error extracting analysis result", e);
            throw new RuntimeException("Failed to extract analysis result: " + e.getMessage(), e);
        }
    }
    
    /**
     * Creates log directories if they don't exist
     */
    private void createLogDirectories() {
        new File(REQUEST_LOG_DIR).mkdirs();
        new File(RESPONSE_LOG_DIR).mkdirs();
    }
    
    /**
     * Save the request to a file for logging/debugging
     */
    private void saveRequestToFile(ImageAnalysisRequest request) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/image_analysis_request_%s.json", REQUEST_LOG_DIR, timestamp);
            
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), request);
            
            logger.info("Saved image analysis request to file: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to save request to file", e);
        }
    }
    
    /**
     * Save the response to a file for logging/debugging
     */
    private void saveResponseToFile(ImageAnalysisOpenAIResponse response) {
        try {
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/image_analysis_response_%s.json", RESPONSE_LOG_DIR, timestamp);
            
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), response);
            
            logger.info("Saved image analysis response to file: {}", filename);
        } catch (IOException e) {
            logger.error("Failed to save response to file", e);
        }
    }
    
    /**
     * Validates if the provided purpose is one of the allowed values
     */
    private boolean isValidPurpose(String purpose) {
        return purpose.equals("assistants") || 
               purpose.equals("batch") || 
               purpose.equals("fine-tune") || 
               purpose.equals("vision") || 
               purpose.equals("user_data") || 
               purpose.equals("evals");
    }
    
    /**
     * Analyzes an image by its PublicAsset ID
     * 
     * @param assetId The UUID of the PublicAsset containing the image
     * @return ImageAnalysisResponse containing text, colors, and description
     * @throws IllegalArgumentException if the asset is not found or invalid
     * @throws RuntimeException if analysis fails
     */
    public ImageAnalysisResponse analyzeImageById(UUID assetId) {
        logger.info("Starting image analysis for asset ID: {}", assetId);
        
        // Fetch and validate the PublicAsset
        PublicAsset publicAsset = validateAndGetImageAsset(assetId);
        
        // Perform the image analysis
        return analyzeImage(publicAsset);
    }
    
    /**
     * Validates and retrieves a PublicAsset as an image
     * 
     * @param assetId The UUID of the PublicAsset to validate
     * @return The validated PublicAsset
     * @throws IllegalArgumentException if the asset is invalid or not an image
     */
    private PublicAsset validateAndGetImageAsset(UUID assetId) {
        // Fetch the PublicAsset by ID
        Optional<PublicAsset> assetOpt = publicAssetService.getAssetById(assetId);
        
        if (assetOpt.isEmpty()) {
            logger.warn("PublicAsset not found with ID: {}", assetId);
            throw new IllegalArgumentException("PublicAsset not found with ID: " + assetId);
        }
        
        PublicAsset publicAsset = assetOpt.get();
        
        // Validate that the asset contains image data
        if (publicAsset.getData() == null || publicAsset.getData().length == 0) {
            logger.warn("PublicAsset {} contains no data", assetId);
            throw new IllegalArgumentException("PublicAsset contains no data");
        }
        
        // Validate content type is an image
        if (publicAsset.getContentType() == null || 
            !publicAsset.getContentType().getType().equals("image")) {
            logger.warn("PublicAsset {} is not an image. Content type: {}", 
                assetId, publicAsset.getContentType());
            throw new IllegalArgumentException("PublicAsset is not an image");
        }
        
        return publicAsset;
    }
    
    /**
     * Provides a detailed description of an image by its PublicAsset ID
     * 
     * @param assetId The UUID of the PublicAsset containing the image
     * @return DetailedImageDescriptionResponse containing comprehensive description and metadata
     * @throws IllegalArgumentException if the asset is not found or invalid
     * @throws RuntimeException if analysis fails
     */
    public DetailedImageDescriptionResponse describeImageInDetail(UUID assetId) {
        logger.info("Starting detailed image description for asset ID: {}", assetId);
        
        // Fetch and validate the PublicAsset
        PublicAsset publicAsset = validateAndGetImageAsset(assetId);
        
        try {
            // Create logs directory if it doesn't exist
            createLogDirectories();
            
            // Step 1: Upload the file to OpenAI
            OpenAIFileUploadResponse uploadResponse = uploadFileToOpenAI(publicAsset, "vision");
            String fileId = uploadResponse.getId();
            
            // Step 2: Create the detailed description request
            ImageAnalysisRequest descriptionRequest = createDetailedDescriptionRequest(fileId);
            
            // Save request to file for debugging
            saveRequestToFile(descriptionRequest);
            
            // Step 3: Call the responses API
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(apiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<ImageAnalysisRequest> requestEntity = new HttpEntity<>(descriptionRequest, headers);
            
            logger.debug("Sending detailed image description request to OpenAI responses API");
            ResponseEntity<ImageAnalysisOpenAIResponse> response = restTemplate.postForEntity(
                OPENAI_RESPONSES_API_URL,
                requestEntity,
                ImageAnalysisOpenAIResponse.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                // Save response to file for debugging
                saveResponseToFile(response.getBody());
                
                // Extract the description result from the response
                DetailedImageDescriptionResponse descriptionResult = extractDetailedDescriptionResult(response.getBody());
                descriptionResult.setAssetId(publicAsset.getId().toString());
                logger.info("Detailed image description completed successfully for file: {}", publicAsset.getFileName());
                return descriptionResult;
            } else {
                logger.error("Failed to describe image in detail. Status: {}", response.getStatusCode());
                throw new RuntimeException("Failed to describe image in detail. Status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            logger.error("Error describing image in detail", e);
            throw new RuntimeException("Failed to describe image in detail: " + e.getMessage(), e);
        }
    }
    
    /**
     * Creates the detailed description request for the OpenAI responses API
     */
    private ImageAnalysisRequest createDetailedDescriptionRequest(String fileId) {
        ImageAnalysisRequest request = new ImageAnalysisRequest();
        request.setModel(VISION_MODEL);
        request.setTemperature(0.7); // Higher temperature for more creative descriptions
        request.setMax_output_tokens(4000); // Allow for longer responses
        
        // Create the input message
        ImageAnalysisRequest.InputMessage inputMessage = new ImageAnalysisRequest.InputMessage();
        inputMessage.setRole("user");
        
        // Create content array with file and text
        List<ImageAnalysisRequest.Content> contentList = new ArrayList<>();
        
        // Add file content
        ImageAnalysisRequest.Content fileContent = new ImageAnalysisRequest.Content();
        fileContent.setType("input_image");
        fileContent.setFileId(fileId);
        contentList.add(fileContent);
        
        // Add text prompt
        ImageAnalysisRequest.Content textContent = new ImageAnalysisRequest.Content();
        textContent.setType("input_text");
        textContent.setText("Please provide an extremely detailed description of this image that would allow someone " +
                "who cannot see the image to fully visualize its contents. Include information about: " +
                "1. The main subject(s) and their appearance, position, and actions " +
                "2. The background and setting with specific details about the environment " +
                "3. Any text visible in the image (exactly as written) " +
                "4. Colors, lighting, mood, and atmosphere " +
                "5. Style of the image (photograph, illustration, graphic design, etc.) " +
                "6. Spatial relationships between objects " +
                "7. Any notable patterns, textures, or unique visual elements " +
                "Be thorough and descriptive, focusing on both obvious and subtle details.");
        contentList.add(textContent);
        
        inputMessage.setContent(contentList);
        request.setInput(Arrays.asList(inputMessage));
        
        // Set up JSON schema for structured response
        request.setText(createDetailedDescriptionFormat());
        
        return request;
    }
    
    /**
     * Creates the JSON schema for structured detailed description response
     */
    private ImageAnalysisRequest.ObjectFormat createDetailedDescriptionFormat() {
        ImageAnalysisRequest.ObjectFormat objectFormat = new ImageAnalysisRequest.ObjectFormat();
        ImageAnalysisRequest.JsonSchema jsonSchema = new ImageAnalysisRequest.JsonSchema();
        
        jsonSchema.setType("json_schema");
        jsonSchema.setName("detailed_image_description_schema");
        jsonSchema.setStrict(true);
        
        // Create the schema structure
        Map<String, Object> schema = new HashMap<>();
        schema.put("type", "object");
        
        Map<String, Object> properties = new HashMap<>();
        
        // Detailed description property
        Map<String, Object> detailedDescriptionProperty = new HashMap<>();
        detailedDescriptionProperty.put("type", "string");
        detailedDescriptionProperty.put("description", "A comprehensive, detailed description of the entire image that allows someone to visualize it without seeing it");
        properties.put("detailedDescription", detailedDescriptionProperty);
        
        // Identified objects property
        Map<String, Object> identifiedObjectsProperty = new HashMap<>();
        identifiedObjectsProperty.put("type", "array");
        identifiedObjectsProperty.put("description", "List of key objects identified in the image");
        Map<String, Object> itemsObject = new HashMap<>();
        itemsObject.put("type", "string");
        identifiedObjectsProperty.put("items", itemsObject);
        properties.put("identifiedObjects", identifiedObjectsProperty);
        
        // Identified scenes property
        Map<String, Object> identifiedScenesProperty = new HashMap<>();
        identifiedScenesProperty.put("type", "array");
        identifiedScenesProperty.put("description", "List of scenes or settings identified in the image");
        identifiedScenesProperty.put("items", itemsObject);
        properties.put("identifiedScenes", identifiedScenesProperty);
        
        // Image context property
        Map<String, Object> imageContextProperty = new HashMap<>();
        imageContextProperty.put("type", "string");
        imageContextProperty.put("description", "The context, situation, or event depicted in the image");
        properties.put("imageContext", imageContextProperty);
        
        // Visual style property
        Map<String, Object> visualStyleProperty = new HashMap<>();
        visualStyleProperty.put("type", "string");
        visualStyleProperty.put("description", "The visual style of the image (photograph, illustration, graphic design, etc.)");
        properties.put("visualStyle", visualStyleProperty);
        
        schema.put("properties", properties);
        schema.put("required", Arrays.asList("detailedDescription", "identifiedObjects", "identifiedScenes", "imageContext", "visualStyle"));
        schema.put("additionalProperties", false);
        
        jsonSchema.setSchema(schema);
        objectFormat.setFormat(jsonSchema);
        
        return objectFormat;
    }
    
    /**
     * Extracts the detailed description result from the OpenAI response
     */
    private DetailedImageDescriptionResponse extractDetailedDescriptionResult(ImageAnalysisOpenAIResponse openAIResponse) {
        try {
            if (openAIResponse.getOutput() != null && !openAIResponse.getOutput().isEmpty()) {
                ImageAnalysisOpenAIResponse.Output output = openAIResponse.getOutput().get(0);
                if (output.getContent() != null && !output.getContent().isEmpty()) {
                    String jsonContent = output.getContent().get(0).getText();
                    
                    // Parse the JSON response
                    ObjectMapper mapper = new ObjectMapper();
                    return mapper.readValue(jsonContent, DetailedImageDescriptionResponse.class);
                }
            }
            
            // Fallback if parsing fails
            DetailedImageDescriptionResponse fallback = new DetailedImageDescriptionResponse();
            fallback.setDetailedDescription("Unable to generate detailed description for this image.");
            fallback.setIdentifiedObjects(Arrays.asList("Unknown"));
            fallback.setIdentifiedScenes(Arrays.asList("Unknown"));
            fallback.setImageContext("Unable to determine context");
            fallback.setVisualStyle("Unknown");
            return fallback;
            
        } catch (Exception e) {
            logger.error("Error extracting detailed description result", e);
            throw new RuntimeException("Failed to extract detailed description result: " + e.getMessage(), e);
        }
    }
    
    // ============ DTOs and Response Classes ============
    
    /**
     * Response DTO for OpenAI file upload API
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OpenAIFileUploadResponse {
        private String id;
        private String object;
        private Long bytes;
        private Long createdAt;
        private String filename;
        private String purpose;
    }
    
    /**
     * Final response DTO for image analysis results
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImageAnalysisResponse {
        private String assetId;
        private String text;
        private String primaryColor;
        private String secondaryColor;
        private String description;
    }
    
    /**
     * Response DTO for detailed image description results
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DetailedImageDescriptionResponse {
        private String assetId;
        private String detailedDescription;
        private List<String> identifiedObjects;
        private List<String> identifiedScenes;
        private String imageContext;
        private String visualStyle;

        public String toXmlString() {
            StringBuilder xmlBuilder = new StringBuilder();
            xmlBuilder.append("<DetailedImageDescriptionResponse>");

            if (assetId != null) {
                xmlBuilder.append("<assetId>").append(assetId).append("</assetId>");
            }
            if (detailedDescription != null) {
                xmlBuilder.append("<detailedDescription>").append(detailedDescription).append("</detailedDescription>");
            }
            if (identifiedObjects != null && !identifiedObjects.isEmpty()) {
                xmlBuilder.append("<identifiedObjects>");
                for (String object : identifiedObjects) {
                    xmlBuilder.append("<object>").append(object).append("</object>");
                }
                xmlBuilder.append("</identifiedObjects>");
            }
            if (identifiedScenes != null && !identifiedScenes.isEmpty()) {
                xmlBuilder.append("<identifiedScenes>");
                for (String scene : identifiedScenes) {
                    xmlBuilder.append("<scene>").append(scene).append("</scene>");
                }
                xmlBuilder.append("</identifiedScenes>");
            }
            if (imageContext != null) {
                xmlBuilder.append("<imageContext>").append(imageContext).append("</imageContext>");
            }
            if (visualStyle != null) {
                xmlBuilder.append("<visualStyle>").append(visualStyle).append("</visualStyle>");
            }

            xmlBuilder.append("</DetailedImageDescriptionResponse>");
            return xmlBuilder.toString();
        }
    }
    
    /**
     * Request DTO for OpenAI responses API
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImageAnalysisRequest {
        private String model;
        private List<InputMessage> input;
        private Boolean stream = false;
        private Double temperature = 0.2;
        private String user = "imageAnalysisUser";
        private ObjectFormat text;
        private Integer max_output_tokens = 10000;
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class InputMessage {
            private String role;
            private List<Content> content;
        }
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        @JsonInclude(JsonInclude.Include.NON_NULL)
        public static class Content {
            private String type;

            @JsonProperty("file_id")
            private String fileId;
            private String text;
        }
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class ObjectFormat {
            private JsonSchema format;
        }
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class JsonSchema {
            private String type;
            private String name;
            private Boolean strict;
            private Map<String, Object> schema;
        }
    }
    
    /**
     * Response DTO for OpenAI responses API
     */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ImageAnalysisOpenAIResponse {
        private String id;
        private String object;
        private Long createdAt;
        private String status;
        private Boolean background;
        private Object error;
        private String model;
        private List<Output> output;
        private Usage usage;
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Output {
            private String id;
            private String type;
            private String status;
            private List<Content> content;
            private String role;
        }
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Content {
            private String type;
            private String text;
        }
        
        @Data
        @AllArgsConstructor
        @NoArgsConstructor
        public static class Usage {
            private Integer inputTokens;
            private Integer outputTokens;
            private Integer totalTokens;
        }
    }
}
