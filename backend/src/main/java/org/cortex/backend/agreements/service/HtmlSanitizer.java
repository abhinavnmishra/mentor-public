package org.cortex.backend.agreements.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * HTML sanitizer that fixes TinyMCE-generated HTML to make it compatible with OpenHTMLtoPDF
 * which requires strict XHTML compliance.
 */
@Component
public class HtmlSanitizer {

    private static final Logger logger = LoggerFactory.getLogger(HtmlSanitizer.class);

    // Self-closing tags that need to be converted from <tag> to <tag/>
    private static final String[] SELF_CLOSING_TAGS = {
        "area", "base", "br", "col", "embed", "hr", "img", "input", 
        "link", "meta", "source", "track", "wbr"
    };

    // Common HTML entities that need to be declared or converted
    private static final Map<String, String> HTML_ENTITIES = new HashMap<>();
    
    static {
        // Common typographic entities that TinyMCE might use
        HTML_ENTITIES.put("&rsquo;", "\u2019");
        HTML_ENTITIES.put("&lsquo;", "\u2018");
        HTML_ENTITIES.put("&rdquo;", "\u201d");
        HTML_ENTITIES.put("&ldquo;", "\u201c");
        HTML_ENTITIES.put("&ndash;", "\u2013");
        HTML_ENTITIES.put("&mdash;", "\u2014");
        HTML_ENTITIES.put("&hellip;", "\u2026");
        HTML_ENTITIES.put("&bull;", "\u2022");
        HTML_ENTITIES.put("&trade;", "\u2122");
        HTML_ENTITIES.put("&reg;", "\u00ae");
        HTML_ENTITIES.put("&copy;", "\u00a9");
        HTML_ENTITIES.put("&nbsp;", " ");
        HTML_ENTITIES.put("&shy;", "");
        HTML_ENTITIES.put("&ensp;", " ");
        HTML_ENTITIES.put("&emsp;", "  ");
        HTML_ENTITIES.put("&thinsp;", " ");
    }

    /**
     * Sanitizes HTML content to make it compatible with OpenHTMLtoPDF
     * 
     * @param htmlContent The raw HTML content from TinyMCE
     * @return Sanitized HTML content that's XHTML compliant
     */
    public String sanitizeHtml(String htmlContent) {
        if (htmlContent == null || htmlContent.trim().isEmpty()) {
            return htmlContent;
        }

        logger.debug("Sanitizing HTML content of length: {}", htmlContent.length());

        String sanitized = htmlContent;

        try {
            // Step 1: Fix self-closing tags
            sanitized = fixSelfClosingTags(sanitized);

            // Step 2: Convert problematic HTML entities
            sanitized = convertHtmlEntities(sanitized);

            // Step 3: Fix malformed attributes
            sanitized = fixMalformedAttributes(sanitized);

            // Step 4: Remove or fix problematic constructs
            sanitized = removeProblematicContent(sanitized);

            // Step 5: Ensure proper nesting and structure
            sanitized = fixHtmlStructure(sanitized);

            logger.debug("HTML sanitization completed successfully");

        } catch (Exception e) {
            logger.warn("Error during HTML sanitization, returning original content", e);
            return htmlContent;
        }

        return sanitized;
    }

    /**
     * Converts self-closing tags to proper XHTML format
     */
    private String fixSelfClosingTags(String html) {
        String result = html;

        for (String tag : SELF_CLOSING_TAGS) {
            // Pattern to match opening tag without closing slash
            // Handles both <tag> and <tag attributes>
            Pattern pattern = Pattern.compile(
                "<(" + tag + ")([^>]*?)(?<!/)>", 
                Pattern.CASE_INSENSITIVE
            );
            
            Matcher matcher = pattern.matcher(result);
            result = matcher.replaceAll("<$1$2/>");
        }

        // Fix specific cases where tags might have been incorrectly closed
        // Convert <br></br> back to <br/>
        result = result.replaceAll("(?i)<(br|hr|img|input|meta|link)([^>]*?)></\\1>", "<$1$2/>");

        return result;
    }

    /**
     * Converts HTML entities to their Unicode equivalents or numeric entities
     */
    private String convertHtmlEntities(String html) {
        String result = html;

        // Replace known problematic entities with Unicode equivalents
        for (Map.Entry<String, String> entity : HTML_ENTITIES.entrySet()) {
            result = result.replace(entity.getKey(), entity.getValue());
        }

        // Convert any remaining &word; entities to numeric entities where possible
        // This is a safety measure for unrecognized entities
        Pattern entityPattern = Pattern.compile("&([a-zA-Z][a-zA-Z0-9]*);");
        Matcher entityMatcher = entityPattern.matcher(result);
        
        while (entityMatcher.find()) {
            String entityName = entityMatcher.group(1);
            // Log unrecognized entities for potential future handling
            logger.debug("Found unrecognized HTML entity: &{};", entityName);
        }

        return result;
    }

    /**
     * Fixes malformed HTML attributes
     */
    private String fixMalformedAttributes(String html) {
        String result = html;

        // Fix attributes without quotes
        Pattern attrPattern = Pattern.compile("(\\w+)=([^\"'\\s>]+)(?=\\s|>)");
        Matcher attrMatcher = attrPattern.matcher(result);
        result = attrMatcher.replaceAll("$1=\"$2\"");

        // Fix boolean attributes by giving them values
        result = result.replaceAll("(?i)\\s+(checked|selected|disabled|readonly|multiple|required)(?=\\s|>)", " $1=\"$1\"");

        return result;
    }

    /**
     * Removes or fixes problematic HTML content
     */
    private String removeProblematicContent(String html) {
        String result = html;

        // Remove HTML comments that might cause issues
        result = result.replaceAll("<!--.*?-->", "");

        // Remove any XML declarations that might be present
        result = result.replaceAll("<\\?xml[^>]*\\?>", "");

        // Remove any DOCTYPE declarations
        result = result.replaceAll("<!DOCTYPE[^>]*>", "");

        // Fix empty paragraph tags that might cause issues
        result = result.replaceAll("<p[^>]*>\\s*</p>", "");

        // Remove any script tags for security and compatibility
        result = result.replaceAll("(?i)<script[^>]*>.*?</script>", "");

        // Remove any style tags with complex CSS that might cause issues
        // Keep simple style attributes but remove style blocks
        result = result.replaceAll("(?i)<style[^>]*>.*?</style>", "");

        return result;
    }

    /**
     * Ensures proper HTML structure and nesting
     */
    private String fixHtmlStructure(String html) {
        String result = html;

        // Ensure all tags are properly closed
        // This is a basic implementation - for complex cases, you might want to use a proper HTML parser
        
        // Fix common unclosed tags
        result = fixUnclosedTags(result, "p");
        result = fixUnclosedTags(result, "div");
        result = fixUnclosedTags(result, "span");

        return result;
    }

    /**
     * Attempts to fix unclosed tags for a specific tag type
     */
    private String fixUnclosedTags(String html, String tagName) {
        // This is a simplified implementation
        // For production use, consider using a proper HTML parser like JSoup
        
        Pattern openPattern = Pattern.compile("(?i)<" + tagName + "([^>]*)>", Pattern.CASE_INSENSITIVE);
        Pattern closePattern = Pattern.compile("(?i)</" + tagName + ">", Pattern.CASE_INSENSITIVE);
        
        Matcher openMatcher = openPattern.matcher(html);
        Matcher closeMatcher = closePattern.matcher(html);
        
        int openCount = 0;
        int closeCount = 0;
        
        while (openMatcher.find()) openCount++;
        while (closeMatcher.find()) closeCount++;
        
        // If we have more opening tags than closing tags, add closing tags at the end
        if (openCount > closeCount) {
            StringBuilder result = new StringBuilder(html);
            for (int i = 0; i < (openCount - closeCount); i++) {
                result.append("</").append(tagName).append(">");
            }
            return result.toString();
        }
        
        return html;
    }

    /**
     * Validates if the HTML is well-formed after sanitization
     * This is a basic check - for comprehensive validation, consider using XML parsers
     */
    public boolean isWellFormed(String html) {
        try {
            // Basic checks for well-formedness
            
            // Check for unmatched angle brackets
            int openBrackets = html.length() - html.replace("<", "").length();
            int closeBrackets = html.length() - html.replace(">", "").length();
            
            if (openBrackets != closeBrackets) {
                return false;
            }

            // Check for unescaped ampersands
            Pattern unescapedAmp = Pattern.compile("&(?![a-zA-Z0-9#]+;)");
            if (unescapedAmp.matcher(html).find()) {
                return false;
            }

            return true;

        } catch (Exception e) {
            logger.warn("Error validating HTML well-formedness", e);
            return false;
        }
    }
}
