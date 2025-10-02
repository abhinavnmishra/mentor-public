package org.cortex.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration class for Jackson ObjectMapper
 * This configures global settings for all Jackson serialization/deserialization in the application
 */
@Configuration
public class JacksonConfig {

    /**
     * Configure the primary ObjectMapper bean with support for Java 8 date/time types
     * This will be used by Spring Boot for all Jackson operations by default
     *
     * @return Configured ObjectMapper instance
     */
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();
        
        // Register JavaTimeModule to handle Java 8 date/time types (LocalDateTime, LocalDate, etc.)
        objectMapper.registerModule(new JavaTimeModule());
        
        // Configure to write dates as ISO-8601 strings instead of timestamps
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        
        return objectMapper;
    }
} 