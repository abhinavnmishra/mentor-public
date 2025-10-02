package org.cortex.backend.llm.Reports;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * This class provides examples and documentation for the AI agent
 * on how to use JSON paths to query and update the Report object.
 */
public class ReportAgentPrompts {

    private static final String PROMPT_FILE_PATH = "Prompt/Report/ReportAgentPrompts.txt";
    private static final String ABOUT_TOOL_FILE_PATH = "Prompt/AboutTheTool.txt";
    private static final String SCHEMA_FILE_PATH = "Prompt/Report/report_schema.json";
    private static final String ABOUT_TOOL_SECTION_START = "# ==== ABOUT_TOOL_SECTION_START ====";
    private static final String ABOUT_TOOL_SECTION_END = "# ==== ABOUT_TOOL_SECTION_END ====";
    private static final String SYSTEM_PROMPTS_SECTION_START = "# ==== SYSTEM_PROMPTS_SECTION_START ====";
    private static final String SYSTEM_PROMPTS_SECTION_END = "# ==== SYSTEM_PROMPTS_SECTION_END ====";
    private static final String AGENT_GUIDANCE_SECTION_START = "# ==== AGENT_GUIDANCE_SECTION_START ====";
    private static final String AGENT_GUIDANCE_SECTION_END = "# ==== AGENT_GUIDANCE_SECTION_END ====";
    private static final String PROCESSING_GUIDANCE_SECTION_START = "# ==== PROCESSING_GUIDANCE_SECTION_START ====";
    private static final String PROCESSING_GUIDANCE_SECTION_END = "# ==== PROCESSING_GUIDANCE_SECTION_END ====";
    private static final String JSON_PATH_EXAMPLES_SECTION_START = "# ==== JSON_PATH_EXAMPLES_SECTION_START ====";
    private static final String JSON_PATH_EXAMPLES_SECTION_END = "# ==== JSON_PATH_EXAMPLES_SECTION_END ====";

    // Initialize a static ObjectMapper instance
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Get the schema of the Report object and its nested classes
     *
     * @return JSON representation of the Report schema
     */
    public static String getReportSchema() {
        try (InputStream inputStream = ReportAgentPrompts.class.getClassLoader().getResourceAsStream(SCHEMA_FILE_PATH)) {
            if (inputStream == null) {
                return "No Schema Found";
            }

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                String schema = reader.lines().collect(Collectors.joining("\n"));

                // Pretty print the schema to make it more readable
                JsonNode jsonNode = objectMapper.readTree(schema);
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode);
            }
        } catch (IOException e) {
            return "No Schema Found";
        }
    }

    /**
     * Get a map of example JSON paths and their descriptions
     *
     * @return Map of JSON paths and their descriptions
     */
    public static String getJsonPathExamples() {

        return extractSectionFromFile(PROMPT_FILE_PATH,
                JSON_PATH_EXAMPLES_SECTION_START,
                JSON_PATH_EXAMPLES_SECTION_END);

    }

    /**
     * Get a map of example JSON paths and their descriptions
     * 
     * @return Map of JSON paths and their descriptions
     */
    public static Map<String, String> getJsonPathExamplesMap() {
        Map<String, String> examples = new HashMap<>();
        
        String jsonPathContent = extractSectionFromFile(PROMPT_FILE_PATH, 
                                                   JSON_PATH_EXAMPLES_SECTION_START, 
                                                   JSON_PATH_EXAMPLES_SECTION_END);
        
        // Parse the content to extract paths and descriptions
        // Example line format: "- programName: Access the program name"
        Pattern pattern = Pattern.compile("- ([^:]+): (.+)");
        
        for (String line : jsonPathContent.split("\n")) {
            Matcher matcher = pattern.matcher(line);
            if (matcher.find()) {
                String path = matcher.group(1).trim();
                String description = matcher.group(2).trim();
                examples.put(path, description);
            }
        }
        
        return examples;
    }

    /**
     * Get context about the tool the user is using
     *
     * @return About tool information as a String
     */
    public static String getAboutTheToolContext() {
        return extractSectionFromFile(ABOUT_TOOL_FILE_PATH,
                ABOUT_TOOL_SECTION_START,
                ABOUT_TOOL_SECTION_END);
    }

    /**
     * Get guidance on how to use the Report Agent Helper for AI models
     *
     * @return Guidance information as a String
     */
    public static String getAiAgentGuidance() {
        return extractSectionFromFile(PROMPT_FILE_PATH,
                AGENT_GUIDANCE_SECTION_START,
                AGENT_GUIDANCE_SECTION_END);
    }

    /**
     * Get guidance for AI agents to process trainer questions about reports
     *
     * @return Guidance for AI agent processing
     */
    public static String getAiAgentProcessingGuidance() {
        return extractSectionFromFile(PROMPT_FILE_PATH,
                PROCESSING_GUIDANCE_SECTION_START,
                PROCESSING_GUIDANCE_SECTION_END);
    }
    
    /**
     * Get system prompts for the report agent as a single combined string
     *
     * @return All system prompts as a single string
     */
    public static String getSystemPrompts() {
        return extractSectionFromFile(PROMPT_FILE_PATH,
                SYSTEM_PROMPTS_SECTION_START,
                SYSTEM_PROMPTS_SECTION_END);
    }

    /**
     * Helper method to read the contents of a resource file
     *
     * @param resourcePath Path to the resource file
     * @return Contents of the file as a String
     */
    private static String readResourceFile(String resourcePath) {
        try (InputStream inputStream = ReportAgentPrompts.class.getClassLoader().getResourceAsStream(resourcePath)) {
            if (inputStream == null) {
                throw new IOException("Resource not found: " + resourcePath);
            }
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
                return reader.lines().collect(Collectors.joining("\n"));
            }
        } catch (IOException e) {
            // Handle the exception as appropriate for your application
            return "Error reading resource file: " + e.getMessage();
        }
    }
    
    /**
     * Helper method to extract a section of content from a file
     * 
     * @param resourcePath Path to the resource file
     * @param sectionStart Section start marker
     * @param sectionEnd Section end marker
     * @return The content between section markers, or empty string if not found
     */
    private static String extractSectionFromFile(String resourcePath, String sectionStart, String sectionEnd) {
        String fileContent = readResourceFile(resourcePath);
        int startIndex = fileContent.indexOf(sectionStart);
        int endIndex = fileContent.indexOf(sectionEnd);
        
        if (startIndex != -1 && endIndex != -1 && startIndex < endIndex) {
            // Extract the content between the markers, excluding the markers themselves
            // Add length of start marker to get content after the marker
            String content = fileContent.substring(startIndex + sectionStart.length(), endIndex).trim();
            return content;
        }
        
        return ""; // Return empty string if section not found
    }
} 