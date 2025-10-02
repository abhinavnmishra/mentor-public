package org.cortex.backend.events.utils;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.cortex.backend.calendar.service.CalendarEventService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Converter
public class ClassToStringConverter implements AttributeConverter<Class, String> {

    private static final Logger logger = LoggerFactory.getLogger(ClassToStringConverter.class);

    @Override
    public String convertToDatabaseColumn(Class attribute) {
        if (attribute == null) {
            return null;
        }
        // Store the fully qualified name of the class
        logger.debug("Converting Class {} to String for database storage", attribute.getName());
        return attribute.getName();
    }

    @Override
    public Class convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            // Reconstruct the Class object from the name
            logger.debug("Converting String {} back to Class for entity attribute", dbData);
            return Class.forName(dbData);
        } catch (ClassNotFoundException e) {
            throw new IllegalArgumentException("Class not found: " + dbData, e);
        }
    }
}
