package org.cortex.backend.agent.llm;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.agent.chat.model.AgentChat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.Nullable;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public abstract class AbstractLLM {

    private static final Logger logger = LoggerFactory.getLogger(AbstractLLM.class);

    private static final String REQUEST_LOG_DIR = "logs/agent_requests";
    private static final String RESPONSE_LOG_DIR = "logs/agent_responses";

    public abstract List<MessageItem> call(@Nullable AgentChat request);

    /**
     * Save the OpenAI request to a file for logging/debugging
     */
    public void saveRequestToFile(Object request) {
        saveToFile(request, REQUEST_LOG_DIR, "agent_request");
    }

    /**
     * Save the OpenAI response to a file for logging/debugging
     */
    public void saveResponseToFile(Object response) {
        saveToFile(response, RESPONSE_LOG_DIR, "agent_response");
    }

    /**
     * Generic method to save objects to file with proper formatting
     */
    private void saveToFile(Object content, String directory, String prefix) {
        try {
            // Create directory if it doesn't exist
            File dir = new File(directory);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("%s/%s_%s.json", directory, prefix, timestamp);

            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(filename), content);

            logger.info("Saved {} to file: {}", prefix, filename);
        } catch (IOException e) {
            logger.error("Failed to save {} to file", prefix, e);
        }
    }
}
