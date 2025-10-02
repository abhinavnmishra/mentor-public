package org.cortex.backend.dto;

import lombok.Data;

@Data
public class SendEmailRequest {
    private String to;
    private String subject;
    private String htmlBody;
} 