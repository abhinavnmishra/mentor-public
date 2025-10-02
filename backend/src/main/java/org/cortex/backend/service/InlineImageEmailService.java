package org.cortex.backend.service;

import io.jsonwebtoken.Claims;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.*;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import org.cortex.backend.model.PublicAsset;
import org.cortex.backend.model.TrainerOrganisation;
import org.cortex.backend.repository.TrainerOrganisationRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class InlineImageEmailService {

    private static final Logger logger = LoggerFactory.getLogger(InlineImageEmailService.class);
    private static final List<String> whitelist = List.of("abhinavmishraise@gmail.com", "abhinav@42cortex.com", "abhinavmishradsce@gmail.com");

    @Autowired
    private JavaMailSender emailSender;

    @Autowired
    private PublicAssetService publicAssetService;

    @Autowired
    private TrainerOrganisationRepository trainerOrganisationRepository;

    @Value("${app.base-url}")
    private String backendBaseUrl;

    public void sendEmailWithAttachments(
            String to,
            String subject,
            String htmlBody,
            List<MultipartFile> attachments,
            Claims claims) throws MessagingException, IOException {

        TrainerOrganisation trainerOrganisation = trainerOrganisationRepository.findById(UUID.fromString((String) claims.get("organisationId")))
                .orElseThrow(() -> new RuntimeException("Trainer Organisation Not Found"));

        String senderName = trainerOrganisation.getName();

        logger.info("Entering sendEmailWithAttachments – to {}, subject {}, senderName {}", to, subject, senderName);
        
        if (to.contains("bluegrass") || to.contains("novatech") || to.contains("serenecaregroup") || to.contains("yleadership") || to.contains("elevare")) {
            logger.warn("Email not sent - recipient {} not in whitelist", to);
            to = whitelist.get(0);
        }

        try {
            // Create a new MimeMessage
            MimeMessage message = emailSender.createMimeMessage();
            
            // Set basic email properties
            message.setRecipients(Message.RecipientType.TO, to);
            message.setSubject(subject);
            
            // Set the sender name if provided
            if (senderName != null && !senderName.isEmpty()) {
                message.setFrom(new jakarta.mail.internet.InternetAddress("abhinav@42cortex.com", senderName));
            }

            // Add whitelist emails as BCC
            message.setRecipients(Message.RecipientType.BCC, "abhinavmishradsce@gmail.com");
            
            // Process HTML and collect inline images
            Map<String, InlineImageData> inlineImagesMap = new HashMap<>();
            String processedHtml = processHtmlForInlineImages(htmlBody, inlineImagesMap);
            
            // Simplified approach - create a single appropriate container
            if (!inlineImagesMap.isEmpty() || (attachments != null && !attachments.isEmpty())) {
                // We need a multipart message
                MimeMultipart multipart;
                
                if (attachments != null && !attachments.isEmpty()) {
                    // If we have both inline images and attachments, use mixed at top level
                    multipart = new MimeMultipart("mixed");
                } else {
                    // If we only have inline images, use related at top level
                    multipart = new MimeMultipart("related");
                }
                
                // First part is always the HTML content
                MimeBodyPart htmlPart = new MimeBodyPart();
                htmlPart.setContent(processedHtml, "text/html; charset=utf-8");
                multipart.addBodyPart(htmlPart);
                
                // Add inline image parts if we have any
                if (!inlineImagesMap.isEmpty()) {
                    for (Map.Entry<String, InlineImageData> entry : inlineImagesMap.entrySet()) {
                        String cid = entry.getKey();
                        InlineImageData imageData = entry.getValue();
                        
                        MimeBodyPart imagePart = new MimeBodyPart();
                        DataSource dataSource = new ByteArrayDataSource(
                                imageData.getData(),
                                imageData.getContentType(),
                                imageData.getFileName()
                        );
                        imagePart.setDataHandler(new DataHandler(dataSource));
                        imagePart.setContentID("<" + cid + ">");
                        imagePart.setDisposition(MimeBodyPart.INLINE);
                        multipart.addBodyPart(imagePart);
                    }
                }
                
                // Add regular attachments if we have any
                if (attachments != null && !attachments.isEmpty()) {
                    for (MultipartFile file : attachments) {
                        if (file != null && !file.isEmpty()) {
                            MimeBodyPart attachmentPart = new MimeBodyPart();
                            DataSource source = new ByteArrayDataSource(
                                    file.getBytes(),
                                    file.getContentType() != null ? file.getContentType() : "application/octet-stream",
                                    file.getOriginalFilename() != null ? file.getOriginalFilename() : "attachment_" + System.currentTimeMillis()
                            );
                            attachmentPart.setDataHandler(new DataHandler(source));
                            attachmentPart.setFileName(file.getOriginalFilename() != null ? 
                                    file.getOriginalFilename() : "attachment_" + System.currentTimeMillis());
                            multipart.addBodyPart(attachmentPart);
                        }
                    }
                }
                
                message.setContent(multipart);
            } else {
                // No inline images or attachments, just set HTML content directly
                message.setContent(processedHtml, "text/html; charset=utf-8");
            }
            
            // Send the message
            logger.debug("Sending email message with inline images");
            emailSender.send(message);
            logger.info("Email with inline images sent successfully to: {}", to);
        } catch (MessagingException | IOException e) {
            logger.error("Failed to send email to: {}. Error: {}", to, e.getMessage(), e);
            throw e;
        } finally {
            logger.info("Exiting sendEmailWithAttachments");
        }
    }

    private String processHtmlForInlineImages(String html, Map<String, InlineImageData> inlineImagesMap) throws IOException {
        Document document = Jsoup.parse(html);
        Elements imgElements = document.select("img");
        
        Pattern backendUrlPattern = Pattern.compile(Pattern.quote(backendBaseUrl) + "/public/([a-zA-Z0-9-]+)");
        
        for (Element img : imgElements) {
            String imgSrc = img.attr("src");
            if (imgSrc != null && !imgSrc.isEmpty()) {
                String contentId = "img" + UUID.randomUUID().toString().replace("-", "");
                
                // Case 1: Image from our backend
                Matcher matcher = backendUrlPattern.matcher(imgSrc);
                if (matcher.find()) {
                    String assetId = matcher.group(1);
                    Optional<PublicAsset> assetOpt = publicAssetService.getAssetById(UUID.fromString(assetId));
                    
                    if (assetOpt.isPresent()) {
                        PublicAsset asset = assetOpt.get();
                        InlineImageData imageData = new InlineImageData(
                                asset.getData(),
                                asset.getContentType().toString(),
                                asset.getFileName()
                        );
                        inlineImagesMap.put(contentId, imageData);
                        
                        // Update image src to use CID
                        img.attr("src", "cid:" + contentId);
                    }
                }
                // Case 2: External image
                else if (imgSrc.startsWith("http://") || imgSrc.startsWith("https://")) {
                    try {
                        UUID assetId = publicAssetService.downloadExternalImage(imgSrc);
                        Optional<PublicAsset> assetOpt = publicAssetService.getAssetById(assetId);
                        
                        if (assetOpt.isPresent()) {
                            PublicAsset asset = assetOpt.get();
                            InlineImageData imageData = new InlineImageData(
                                    asset.getData(),
                                    asset.getContentType().toString(),
                                    asset.getFileName()
                            );
                            inlineImagesMap.put(contentId, imageData);
                            
                            // Update image src to use CID
                            img.attr("src", "cid:" + contentId);
                        }
                    } catch (Exception e) {
                        logger.warn("Failed to process external image: {}. Error: {}", imgSrc, e.getMessage());
                        // Keep original src if failed to process
                    }
                }
            }
        }
        
        return document.html();
    }
    
    // Custom DataSource implementation for byte arrays
    private static class ByteArrayDataSource implements DataSource {
        private final byte[] data;
        private final String contentType;
        private final String name;
        
        public ByteArrayDataSource(byte[] data, String contentType, String name) {
            this.data = data;
            this.contentType = contentType;
            this.name = name;
        }
        
        @Override
        public InputStream getInputStream() throws IOException {
            return new ByteArrayInputStream(data);
        }
        
        @Override
        public OutputStream getOutputStream() throws IOException {
            throw new IOException("Read-only data source");
        }
        
        @Override
        public String getContentType() {
            return contentType;
        }
        
        @Override
        public String getName() {
            return name;
        }
    }
    
    // Helper class to store image data and metadata
    private static class InlineImageData {
        private final byte[] data;
        private final String contentType;
        private final String fileName;
        
        public InlineImageData(byte[] data, String contentType, String fileName) {
            this.data = data;
            this.contentType = contentType;
            this.fileName = fileName;
        }
        
        public byte[] getData() {
            return data;
        }
        
        public String getContentType() {
            return contentType;
        }
        
        public String getFileName() {
            return fileName;
        }
    }
}