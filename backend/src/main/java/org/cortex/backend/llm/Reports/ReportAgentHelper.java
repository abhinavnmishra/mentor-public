package org.cortex.backend.llm.Reports;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;
import org.cortex.backend.dto.ClientReport;
import org.cortex.backend.llm.utilities.ContextEngine;
import org.cortex.backend.model.Report;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service class to help AI agents work with Report objects.
 * This class provides methods for querying and updating Report objects,
 * as well as utilities for resolving JSON paths and executing write operations
 * requested by AI agents.
 */
@Service
public class ReportAgentHelper {

    private static final Logger logger = LoggerFactory.getLogger(ReportAgentHelper.class);
    private final ObjectMapper objectMapper;
    
    // Delimiters for change suggestions
    public static final String OLD_VALUE_START = "<<<OLD_VALUE>>>";
    public static final String OLD_VALUE_END = "<<<END_OLD_VALUE>>>";
    public static final String NEW_VALUE_START = "<<<NEW_VALUE>>>";
    public static final String NEW_VALUE_END = "<<<END_NEW_VALUE>>>";

    @Autowired
    private ContextEngine contextEngine;

    public ReportAgentHelper() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
    }

    //--------------------------------------------------------------------------
    // AI Agent Write Operation Methods
    //--------------------------------------------------------------------------
    
    /**
     * Executes a write operation requested by the AI agent.
     * It evaluates the path expression which may include function calls,
     * resolves the actual JSON path, and updates the field with the provided value.
     *
     * @param report report object to be updated
     * @param pathExpression Expression containing the path or function call to evaluate
     * @param value New value to set for the field
     * @return Updated Report object
     * @throws IllegalArgumentException if the path expression is invalid or cannot be resolved
     */
    public Report executeWriteOperation(Report report, String pathExpression, String value) {
        logger.info("Executing write operation with path expression: {}", pathExpression);
        
        // Normalize the path expression by removing any quotes and extra spaces
        pathExpression = pathExpression.replaceAll("[\"']", "").trim();
        
        // Check if this is a direct path or a function call
        if (pathExpression.contains("(") && pathExpression.contains(")")) {
            // This is a function call or a combination of function call and path
            String jsonPath = resolvePathExpression(report, pathExpression);
            logger.info("Resolved JSON path: {}", jsonPath);
            return updateField(report, jsonPath, value);
        } else {
            // This is a direct path, use it as is
            logger.info("Using direct JSON path: {}", pathExpression);
            return updateField(report, pathExpression, value);
        }
    }
    
    /**
     * Executes multiple write operations requested by the AI agent.
     *
     * @param report report object to be updated
     * @param operations List of maps containing operation details (path and value)
     * @return Updated Report object after all operations
     */
    public Report executeWriteOperations(Report report, List<Map<String, String>> operations) {

        for (Map<String, String> operation : operations) {
            String pathExpression = operation.get("path");
            String value = operation.get("value");
            
            if (pathExpression != null && value != null) {
                report = executeWriteOperation(report, pathExpression, value);
            }
        }
        
        return report;
    }
    
    /**
     * Resolves a path expression that may contain function calls to a direct JSON path.
     *
     * @param report report object
     * @param pathExpression Expression to resolve, which may contain function calls
     * @return Resolved JSON path
     * @throws IllegalArgumentException if the path expression cannot be resolved
     */
    private String resolvePathExpression(Report report, String pathExpression) {
        logger.debug("Starting to resolve path expression: '{}'", pathExpression);
        
        // Check for function + additional path using either " + " format or dot notation
        if (pathExpression.contains(" + ")) {
            // Handle " + " format (e.g., "findClientInReport(...) + '.fieldName'")
            logger.debug("Path expression contains ' + ', splitting into function call and additional path");
            String[] parts = pathExpression.split(" \\+ ");
            logger.debug("Split result: {} parts", parts.length);
            
            if (parts.length != 2) {
                logger.error("Invalid path expression format - expected 2 parts but got {}: '{}'", parts.length, pathExpression);
                throw new IllegalArgumentException("Invalid path expression format: " + pathExpression);
            }
            
            String functionCall = parts[0].trim();
            String additionalPath = parts[1].trim().replaceAll("[\"']", "");
            logger.debug("Function call part: '{}'", functionCall);
            logger.debug("Additional path part (after quote removal): '{}'", additionalPath);
            
            logger.debug("Executing function call to get base path");
            String basePath = executeFunctionCall(report, functionCall);
            logger.debug("Function call returned base path: '{}'", basePath);
            
            String resolvedPath = basePath + additionalPath;
            logger.debug("Final resolved path: '{}'", resolvedPath);
            return resolvedPath;
        } else {
            // Check for dot notation after function call (e.g., "findClientInReport(...).fieldName")
            Pattern functionWithDotPattern = Pattern.compile("(\\w+\\s*\\([^)]*\\))(\\.\\w+(?:\\.\\w+)*)");
            Matcher matcher = functionWithDotPattern.matcher(pathExpression);
            
            if (matcher.find()) {
                // Handle dot notation format
                logger.debug("Path expression contains function call with dot notation");
                String functionCall = matcher.group(1);
                String additionalPath = matcher.group(2); // This includes the leading dot
                logger.debug("Function call part: '{}'", functionCall);
                logger.debug("Additional path part: '{}'", additionalPath);
                
                logger.debug("Executing function call to get base path");
                String basePath = executeFunctionCall(report, functionCall);
                logger.debug("Function call returned base path: '{}'", basePath);
                
                String resolvedPath = basePath + additionalPath;
                logger.debug("Final resolved path: '{}'", resolvedPath);
                return resolvedPath;
            } else {
                // Just a function call without additional path
                logger.debug("Path expression is a simple function call without additional path");
                String result = executeFunctionCall(report, pathExpression);
                logger.debug("Function call resolved to path: '{}'", result);
                return result;
            }
        }
    }
    
    /**
     * Executes a function call in the path expression and returns the result.
     *
     * @param report report object
     * @param functionCall Function call to execute
     * @return Result of the function call
     * @throws IllegalArgumentException if the function call is invalid or the function doesn't exist
     */
    private String executeFunctionCall(Report report, String functionCall) {
        logger.debug("Executing function call: '{}'", functionCall);
        
        // Extract function name and arguments
        Pattern pattern = Pattern.compile("(\\w+)\\s*\\(([^)]*)\\)");
        Matcher matcher = pattern.matcher(functionCall);
        
        if (!matcher.find()) {
            logger.error("Invalid function call format - regex pattern did not match: '{}'", functionCall);
            throw new IllegalArgumentException("Invalid function call format: " + functionCall);
        }
        
        String functionName = matcher.group(1);
        String argumentsString = matcher.group(2);
        logger.debug("Extracted function name: '{}'", functionName);
        logger.debug("Extracted arguments string: '{}'", argumentsString);
        
        String[] args = argumentsString.isEmpty() ? new String[0] : argumentsString.split(",\\s*");
        logger.debug("Split arguments into {} parts: {}", args.length, String.join(", ", args));
        
        // Replace 'reportId' placeholder with the actual UUID or remove it when passing the report object
        logger.debug("Processing arguments to remove 'reportId' placeholders and clean quotes");
        for (int i = 0; i < args.length; i++) {
            String originalArg = args[i];
            if (args[i].trim().equals("reportId")) {
                logger.debug("Found 'reportId' placeholder at index {}, removing it", i);
                // Remove this argument as we'll pass the report object directly
                String[] newArgs = new String[args.length - 1];
                System.arraycopy(args, 0, newArgs, 0, i);
                System.arraycopy(args, i + 1, newArgs, i, args.length - i - 1);
                args = newArgs;
                i--; // Adjust index after removal
                logger.debug("After removing 'reportId', arguments array now has {} elements", args.length);
            } else {
                // Remove any quotes from the arguments
                args[i] = args[i].replaceAll("[\"']", "").trim();
                logger.debug("Cleaned argument at index {}: '{}' -> '{}'", i, originalArg, args[i]);
            }
        }
        
        logger.debug("Final processed arguments: {}", String.join(", ", args));
        
        // Execute the appropriate function based on name and arguments
        logger.debug("Executing function '{}' with {} arguments", functionName, args.length);
        String result;
        
        switch (functionName) {
            case "findClientInReport":
                if (args.length != 1) {
                    logger.error("findClientInReport requires 1 argument but got {}", args.length);
                    throw new IllegalArgumentException("findClientInReport requires 1 argument");
                }
                logger.debug("Calling findClientInReport with searchTerm: '{}'", args[0]);
                result = findClientInReport(report, args[0]);
                logger.debug("findClientInReport returned: '{}'", result);
                break;
                
            case "findFocusAreaInReport":
                if (args.length != 1) {
                    logger.error("findFocusAreaInReport requires 1 argument but got {}", args.length);
                    throw new IllegalArgumentException("findFocusAreaInReport requires 1 argument");
                }
                logger.debug("Calling findFocusAreaInReport with searchTerm: '{}'", args[0]);
                result = findFocusAreaInReport(report, args[0]);
                logger.debug("findFocusAreaInReport returned: '{}'", result);
                break;
                
            case "findClientFocusAreaInReport":
                if (args.length != 2) {
                    logger.error("findClientFocusAreaInReport requires 2 arguments but got {}", args.length);
                    throw new IllegalArgumentException("findClientFocusAreaInReport requires 2 arguments");
                }
                logger.debug("Calling findClientFocusAreaInReport with clientId: '{}', focusAreaId: '{}'", args[0], args[1]);
                result = findClientFocusAreaInReport(report, args[0], args[1]);
                logger.debug("findClientFocusAreaInReport returned: '{}'", result);
                break;
                
            default:
                logger.error("Unknown function name: '{}'", functionName);
                throw new IllegalArgumentException("Unknown function: " + functionName);
        }
        
        if (result == null) {
            logger.warn("Function '{}' returned null - this may indicate the search term was not found", functionName);
        }
        
        logger.debug("Function call '{}' completed successfully, returning: '{}'", functionCall, result);
        return result;
    }

    /**
     * Query a field in a Report using JSON path notation
     *
     * @param report Report object to query
     * @param jsonPath JSON path to the field (dot notation)
     * @return Value of the field as a string
     */
    public String queryField(Report report, String jsonPath) {
        try {
            // Convert report to JsonNode
            JsonNode rootNode = objectMapper.valueToTree(report);

            // Navigate the path
            String[] pathParts = jsonPath.split("\\.");
            JsonNode currentNode = rootNode;

            for (String part : pathParts) {
                // Handle array access like 'clientReportList[0]'
                if (part.contains("[") && part.contains("]")) {
                    String fieldName = part.substring(0, part.indexOf('['));
                    int index = Integer.parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));

                    if (currentNode.has(fieldName) && currentNode.get(fieldName).isArray() && index < currentNode.get(fieldName).size()) {
                        currentNode = currentNode.get(fieldName).get(index);
                    } else {
                        return "Path not found: " + jsonPath;
                    }
                } else {
                    // Regular field access
                    if (currentNode.has(part)) {
                        currentNode = currentNode.get(part);
                    } else {
                        return "Path not found: " + jsonPath;
                    }
                }
            }

            return objectMapper.writeValueAsString(currentNode);

        } catch (JsonProcessingException e) {
            logger.error("Error processing JSON", e);
            return "Error processing JSON: " + e.getMessage();
        } catch (Exception e) {
            logger.error("Error navigating JSON path", e);
            return "Error navigating JSON path: " + e.getMessage();
        }
    }

    /**
     * Query multiple fields from a Report
     *
     * @param report Report object to query
     * @param jsonPaths List of JSON paths to query
     * @return Map of paths to their values
     */
    public Map<String, String> queryFields(Report report, List<String> jsonPaths) {
        Map<String, String> results = new HashMap<>();

        for (String path : jsonPaths) {
            results.put(path, queryField(report, path));
        }

        return results;
    }

    /**
     * Update multiple fields in a Report
     *
     * @param report Report object to update
     * @param updates Map of JSON paths to their new values
     * @return Updated Report object
     */
    public Report updateFields(Report report, Map<String, String> updates) {
        try {
            // Convert report to JsonNode
            JsonNode rootNode = objectMapper.valueToTree(report);
            ObjectNode rootObjectNode = (ObjectNode) rootNode;

            // Apply each update
            for (Map.Entry<String, String> update : updates.entrySet()) {
                try {
                    String[] pathParts = update.getKey().split("\\.");
                    JsonNode valueNode = objectMapper.readTree(update.getValue());
                    updateJsonNodeField(rootObjectNode, pathParts, 0, valueNode);
                } catch (Exception e) {
                    logger.warn("Error updating path {}: {}", update.getKey(), e.getMessage());
                }
            }

            // Convert back to Report object
            Report updatedReport = objectMapper.treeToValue(rootNode, Report.class);

            // Return without saving to repository
            return updatedReport;

        } catch (IOException e) {
            logger.error("Error processing JSON", e);
            throw new IllegalArgumentException("Error processing JSON: " + e.getMessage());
        }
    }

    /**
     * Update a field in a Report using JSON path notation
     *
     * @param report report object
     * @param jsonPath JSON path to the field (dot notation)
     * @param value    New value for the field - can be a JSON string or a plain string (will be converted to JSON)
     * @return Updated Report object
     */
    public Report updateField(Report report, String jsonPath, String value) {
        logger.debug("Updating field with path: '{}' to value: '{}'", jsonPath, value);

        try {
            // Convert report to JsonNode
            logger.debug("Converting Report object to JsonNode");
            JsonNode rootNode = objectMapper.valueToTree(report);
            ObjectNode rootObjectNode = (ObjectNode) rootNode;
            logger.debug("Successfully converted Report to JsonNode");
            
            // Navigate the path
            logger.debug("Splitting JSON path into parts: {}", jsonPath);
            String[] pathParts = jsonPath.split("\\.");
            logger.debug("Path parts: {}", String.join(", ", pathParts));
            
            // Try to parse the value as JSON first
            JsonNode valueNode;
            try {
                logger.debug("Attempting to parse value as JSON: '{}'", value);
                valueNode = objectMapper.readTree(value);
                logger.debug("Successfully parsed value as JSON: {}", valueNode);
            } catch (JsonProcessingException e) {
                // If parsing as JSON fails, assume it's a plain string and format it properly
                logger.debug("Value is not valid JSON, treating as plain string: '{}'", value);
                // Create a quoted JSON string (escaping any special characters)
                String jsonString = objectMapper.writeValueAsString(value);
                logger.debug("Converted to JSON string: '{}'", jsonString);
                valueNode = objectMapper.readTree(jsonString);
                logger.debug("Successfully parsed as JSON string node: {}", valueNode);
            }
            
            // Update the field
            logger.debug("Starting recursive field update");
            updateJsonNodeField(rootObjectNode, pathParts, 0, valueNode);
            logger.debug("Field update completed successfully");
            
            // Convert back to Report object
            logger.debug("Converting modified JsonNode back to Report object");
            Report updatedReport = objectMapper.treeToValue(rootNode, Report.class);
            logger.debug("Successfully converted back to Report object");
            
            // Return without saving to repository
            logger.debug("Returning updated Report (without persisting to repository)");
            return updatedReport;
            
        } catch (IOException e) {
            logger.error("Error processing JSON: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Error processing JSON: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Error updating field: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Error updating field: " + e.getMessage());
        }
    }
    
    /**
     * Create a delimited string containing both old and new values
     * 
     * @param oldValue the current value in the report
     * @param newValue the proposed new value from the AI
     * @return delimited string containing both values
     */
    private String createDelimitedChangeText(String oldValue, String newValue) {
        StringBuilder builder = new StringBuilder();
        builder.append(OLD_VALUE_START)
               .append(oldValue)
               .append(OLD_VALUE_END)
               .append(NEW_VALUE_START)
               .append(newValue)
               .append(NEW_VALUE_END);
        return builder.toString();
    }
    
    /**
     * Checks if a string contains the change delimiters
     * 
     * @param text the text to check
     * @return true if the text contains change delimiters
     */
    private boolean containsChangeDelimiters(String text) {
        return text != null && 
               text.contains(OLD_VALUE_START) && 
               text.contains(OLD_VALUE_END) &&
               text.contains(NEW_VALUE_START) && 
               text.contains(NEW_VALUE_END);
    }
    
    /**
     * Recursive helper method to update a field in a JsonNode
     */
    private void updateJsonNodeField(ObjectNode parentNode, String[] pathParts, int currentIndex, JsonNode newValue) {
        logger.debug("Updating JSON node at path part index {}: '{}'", 
                currentIndex, 
                currentIndex < pathParts.length ? pathParts[currentIndex] : "END");
        
        if (currentIndex >= pathParts.length) {
            logger.debug("Reached end of path parts, no further action needed");
            return;
        }
        
        String part = pathParts[currentIndex];
        logger.debug("Processing path part: '{}'", part);
        
        // Handle array access like 'clientReportList[0]'
        if (part.contains("[") && part.contains("]")) {
            logger.debug("Processing array access notation: '{}'", part);
            String fieldName = part.substring(0, part.indexOf('['));
            int index = Integer.parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
            logger.debug("Extracted field name: '{}', index: {}", fieldName, index);
            
            if (currentIndex == pathParts.length - 1) {
                // Final part of the path - update the array element
                logger.debug("Final path part reached - updating array element at index {}", index);
                if (parentNode.has(fieldName) && parentNode.get(fieldName).isArray() && index < parentNode.get(fieldName).size()) {
                    // Use ArrayNode methods to update array elements
                    logger.debug("Found array field '{}' with sufficient elements", fieldName);
                    JsonNode currentNode = parentNode.get(fieldName).get(index);
                    
                    // For text fields, create delimited change text with both old and new values
                    if (currentNode.isTextual() && newValue.isTextual()) {
                        String oldValue = currentNode.asText();
                        String newValueText = newValue.asText();
                        
                        // Create delimited text containing both values
                        String delimitedText = createDelimitedChangeText(oldValue, newValueText);
                        
                        // Replace with the delimited text
                        ArrayNode arrayNode = (ArrayNode) parentNode.get(fieldName);
                        arrayNode.set(index, new TextNode(delimitedText));
                        logger.debug("Successfully updated array element with delimited change");
                    } else {
                        // For non-text fields or if current value is null, just replace directly
                        ArrayNode arrayNode = (ArrayNode) parentNode.get(fieldName);
                        arrayNode.set(index, newValue);
                        logger.debug("Successfully updated array element directly");
                    }
                } else {
                    logger.error("Path not found or invalid: field={}, isArray={}, hasIndex={}",
                            fieldName,
                            parentNode.has(fieldName) ? parentNode.get(fieldName).isArray() : false,
                            parentNode.has(fieldName) && parentNode.get(fieldName).isArray() ? index < parentNode.get(fieldName).size() : false);
                    throw new IllegalArgumentException("Path not found: " + String.join(".", pathParts));
                }
            } else {
                // Navigate to the next level
                logger.debug("Navigating to next level in array");
                if (parentNode.has(fieldName) && parentNode.get(fieldName).isArray() && index < parentNode.get(fieldName).size()) {
                    logger.debug("Found array field '{}', proceeding to element at index {}", fieldName, index);
                    updateJsonNodeField((ObjectNode) parentNode.get(fieldName).get(index), pathParts, currentIndex + 1, newValue);
                } else {
                    logger.error("Cannot navigate path: field={}, isArray={}, hasIndex={}",
                            fieldName,
                            parentNode.has(fieldName) ? parentNode.get(fieldName).isArray() : false,
                            parentNode.has(fieldName) && parentNode.get(fieldName).isArray() ? index < parentNode.get(fieldName).size() : false);
                    throw new IllegalArgumentException("Path not found: " + String.join(".", pathParts));
                }
            }
        } else {
            // Regular field access
            logger.debug("Processing regular field access: '{}'", part);
            if (currentIndex == pathParts.length - 1) {
                // Final part of the path - update the field
                logger.debug("Final path part reached - updating field directly");
                
                // For text fields, create delimited change text with both old and new values
                if (parentNode.has(part) && parentNode.get(part).isTextual() && newValue.isTextual()) {
                    String oldValue = parentNode.get(part).asText();
                    String newValueText = newValue.asText();
                    
                    // Create delimited text containing both values
                    String delimitedText = createDelimitedChangeText(oldValue, newValueText);
                    
                    // Replace with the delimited text
                    parentNode.put(part, delimitedText);
                    logger.debug("Successfully updated field '{}' with delimited change", part);
                } else {
                    // For non-text fields or if current value is null, just replace directly
                    parentNode.set(part, newValue);
                    logger.debug("Successfully updated field '{}' directly", part);
                }
            } else {
                // Navigate to the next level
                logger.debug("Navigating to next level in object");
                if (!parentNode.has(part)) {
                    logger.debug("Field '{}' not found, creating new object node", part);
                    parentNode.set(part, objectMapper.createObjectNode());
                }
                logger.debug("Proceeding to child node '{}'", part);
                updateJsonNodeField((ObjectNode) parentNode.get(part), pathParts, currentIndex + 1, newValue);
            }
        }
    }

    /**
     * Get complete context for an AI agent about a report
     *
     * @param report report object
     * @return Complete context information as JSON
     */
    public String getCompleteProgramContext(Report report) {
        try {

            String programId = report.getVersion().getCoachingProgramId();

            StringBuilder context = new StringBuilder();

            // Add milestones context
            context.append("--- MILESTONES CONTEXT ---\n");
            context.append(contextEngine.getAllMilestonesIndexByProgram(programId));
            context.append("\n\n");

            // Add focus areas context
            context.append("--- FOCUS AREAS CONTEXT ---\n");
            context.append(contextEngine.getAllFocusAreasIndexByProgram(programId));
            context.append("\n\n");

            // Add clients context
            context.append("--- CLIENTS CONTEXT ---\n");
            context.append(contextEngine.getAllClientsIndexByProgram(programId));

            return context.toString();

        } catch (Exception e) {
            return "Error fetching program context!";
        }
    }

    /**
     * Find client by name or id in a report
     * 
     * @param report Report object to search in
     * @param searchTerm Name or ID to search for
     * @return Path to the client in the report or null if not found
     */
    public String findClientInReport(Report report, String searchTerm) {
        if (report.getClientReportList() == null) {
            return null;
        }
        
        for (int i = 0; i < report.getClientReportList().size(); i++) {
            ClientReport clientReport = report.getClientReportList().get(i);
            if (clientReport.getClient().getClientId().equals(searchTerm) || 
                clientReport.getClient().getClientName().toLowerCase().contains(searchTerm.toLowerCase())) {
                return "clientReportList[" + i + "]";
            }
        }
        
        return null;
    }
    
    /**
     * Find focus area by id or name in a report
     * 
     * @param report Report object to search in
     * @param searchTerm ID or name to search for
     * @return Path to the focus area in the report or null if not found
     */
    public String findFocusAreaInReport(Report report, String searchTerm) {
        if (report.getFocusAreas() == null) {
            return null;
        }
        
        for (int i = 0; i < report.getFocusAreas().size(); i++) {
            Report.FocusAreaReport focusArea = report.getFocusAreas().get(i);
            if (focusArea.getFocusAreaId().equals(searchTerm) || 
                (focusArea.getName() != null && focusArea.getName().toLowerCase().contains(searchTerm.toLowerCase()))) {
                return "focusAreas[" + i + "]";
            }
        }
        
        return null;
    }
    
    /**
     * Find a client-specific focus area in a report
     * 
     * @param report Report object to search in
     * @param clientId ID of the client
     * @param focusAreaId ID of the focus area
     * @return Path to the client-specific focus area in the report or null if not found
     */
    public String findClientFocusAreaInReport(Report report, String clientId, String focusAreaId) {
        String clientPath = findClientInReport(report, clientId);
        if (clientPath == null) {
            return null;
        }
        
        try {
            JsonNode rootNode = objectMapper.valueToTree(report);
            String[] pathParts = clientPath.split("\\.");
            JsonNode currentNode = rootNode;
            
            // Navigate to the client node
            for (String part : pathParts) {
                // Handle array access
                if (part.contains("[") && part.contains("]")) {
                    String fieldName = part.substring(0, part.indexOf('['));
                    int index = Integer.parseInt(part.substring(part.indexOf('[') + 1, part.indexOf(']')));
                    currentNode = currentNode.get(fieldName).get(index);
                } else {
                    currentNode = currentNode.get(part);
                }
            }
            
            // Search focus areas array
            if (currentNode.has("focusAreas")) {
                JsonNode focusAreas = currentNode.get("focusAreas");
                for (int i = 0; i < focusAreas.size(); i++) {
                    if (focusAreas.get(i).has("focusAreaId") && 
                        focusAreas.get(i).get("focusAreaId").asText().equals(focusAreaId)) {
                        return clientPath + ".focusAreas[" + i + "]";
                    }
                }
            }
            
        } catch (Exception e) {
            logger.error("Error searching for client focus area", e);
        }
        
        return null;
    }
} 