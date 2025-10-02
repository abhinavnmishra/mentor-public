package org.cortex.backend.llm.Evaluations.pojo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import org.cortex.backend.llm.pojo.OpenAiRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Data
@Component
public class OpenAIRequestEvaluation extends OpenAiRequest {

    @JsonProperty("response_format")
    private Object responseFormat;

    @JsonIgnore
    private final ObjectMapper objectMapper = new ObjectMapper();

    @JsonIgnore
    @Value("classpath:templates/response_evaluator_template.json")
    private Resource templateResource;

    @Autowired
    @JsonIgnore
    private ResourceLoader resourceLoader;

    public OpenAIRequestEvaluation() {
        // Empty constructor
    }

    @PostConstruct
    public void init() {
        if (templateResource != null) {
            loadTemplateFromResource(templateResource);
        }
    }

    private void loadTemplateFromResource(Resource resource) {
        try {
            JsonNode rootNode = objectMapper.readTree(resource.getInputStream());
            responseFormat = objectMapper.treeToValue(rootNode.get("response_format"), Object.class);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static OpenAIRequestEvaluation create(String model, List<String> contextList) {
        OpenAIRequestEvaluation request = new OpenAIRequestEvaluation();
        request.setModel(model);
        
        // Try to load the template manually as this instance is not Spring-managed
        try {
            Resource resource = request.resourceLoader != null ? 
                request.resourceLoader.getResource("classpath:templates/response_evaluator_template.json") :
                null;
                
            if (resource != null && resource.exists()) {
                request.loadTemplateFromResource(resource);
            } else {
                // Fallback to loading the template directly
                ClassLoader classLoader = OpenAIRequestEvaluation.class.getClassLoader();
                try (InputStream inputStream = classLoader.getResourceAsStream("templates/response_evaluator_template.json")) {
                    if (inputStream != null) {
                        JsonNode rootNode = request.objectMapper.readTree(inputStream);
                        request.responseFormat = request.objectMapper.treeToValue(rootNode.get("response_format"), Object.class);
                    } else {
                        System.err.println("Could not find template file: templates/response_evaluator_template.json");
                    }
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

        List<Message> messages = new ArrayList<>();
        for(int i = 0; i<contextList.size(); i++) {
            Message message = new Message();
            message.setRole((i != (contextList.size()-1)) ? "system" : "user");
            message.setContent(contextList.get(i));
            messages.add(message);
        }
        request.setMessages(messages);

        return request;
    }
} 