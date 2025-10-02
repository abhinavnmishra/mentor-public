package org.cortex.backend.agent.tools;

import io.jsonwebtoken.Claims;
import org.cortex.backend.service.InlineImageEmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.Map;
import java.util.function.Function;

@Configuration
public class SendEmailTool extends AbstractTool{

    public Boolean previewRequired = Boolean.TRUE;

    @Autowired
    private InlineImageEmailService inlineImageEmailService;

    @Override
    @Bean(name = "send_email")
    public Function<Map<String, Object>, String> toolFunction() {

        return stringObjectMap -> {
            Claims claims = (Claims) stringObjectMap.get("claims");
            String to = (String) stringObjectMap.get("destination_email");
            String subject = (String) stringObjectMap.get("email_subject");
            String body = (String) stringObjectMap.get("email_body");

            try {
                inlineImageEmailService.sendEmailWithAttachments(to, subject, body, new ArrayList<>(), claims);
            } catch (Exception e) {
                return "Some error happened when trying to send email.";
            }

            return "Email Sent Successfully";
        };
    }

}
