package org.cortex.backend.service;

import org.cortex.backend.dto.ClientReport.FocusAreaImprovementGraph;
import org.cortex.backend.dto.ClientReport.DataPoint;
import org.cortex.backend.model.PublicAsset;
import org.cortex.backend.repository.PublicAssetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GrowthGraphService {

    private static final Logger logger = LoggerFactory.getLogger(GrowthGraphService.class);

    @Autowired
    private PublicAssetRepository publicAssetRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Generates an SVG image from the focus area improvement graph data and stores it in PublicAsset
     * 
     * @param graphData The growth graph data to render
     * @return The URL to access the generated SVG
     */
    @Transactional
    public String generateGraphImage(FocusAreaImprovementGraph graphData) {
        logger.info("Generating SVG image for growth graph: {}", graphData.getLabel());
        String svgContent = generateSvgFromGraphData(graphData);
        
        // Create a new public asset to store the SVG
        PublicAsset asset = new PublicAsset();
        asset.setData(svgContent.getBytes());
        asset.setFileName(sanitizeFileName(graphData.getLabel()) + ".svg");
        asset.setContentType(MediaType.valueOf("image/svg+xml"));
        
        // Save the asset
        asset = publicAssetRepository.save(asset);
        logger.info("Saved SVG image as PublicAsset with ID: {}", asset.getId());
        
        // Return the URL for the asset
        return baseUrl + "/public/" + asset.getId();
    }
    
    /**
     * Generates an SVG representation of the growth graph data
     *
     * @param graphData The growth graph data to render
     * @return The SVG content as a string
     */
    private String generateSvgFromGraphData(FocusAreaImprovementGraph graphData) {
        // New wider, shorter dimensions
        final int width = 960;  // Increased from 800
        final int height = 500; // Decreased from 600
        final int padding = 50;
        final int topPadding = 60;  // Reduced top padding as title moves to bottom
        final int bottomPadding = 80; // Increased from 50 to add more space for title
        final int legendHeight = 40;
        final int labelPadding = 10;
        
        // Calculate chart area dimensions
        final int chartWidth = width - (2 * padding);
        final int chartHeight = height - topPadding - bottomPadding;
        
        // Add margin on left and right within the chart area
        final double horizontalMarginPercent = 0.15; // 15% margin on each side
        final double dataAreaWidth = chartWidth * (1 - 2 * horizontalMarginPercent);
        final double leftMargin = chartWidth * horizontalMarginPercent;
        final double rightMargin = chartWidth * horizontalMarginPercent;
        
        StringBuilder svg = new StringBuilder();
        svg.append("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n");
        svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"").append(width).append("\" height=\"").append(height).append("\" viewBox=\"0 0 ").append(width).append(" ").append(height).append("\">\n");
        
        // Add title
        svg.append("  <title>").append(escapeXml(graphData.getLabel())).append("</title>\n");
        
        // Add styles
        svg.append("  <defs>\n");
        svg.append("    <style>\n");
        svg.append("      .chart-title { font-family: 'Roboto', Arial, sans-serif; font-size: 20px; font-weight: 500; text-anchor: middle; fill: #333; }\n");
        svg.append("      .axis-label { font-family: 'Roboto', Arial, sans-serif; font-size: 12px; fill: #555; }\n");
        svg.append("      .x-axis-label { text-anchor: middle; font-weight: 500; }\n");
        svg.append("      .y-axis-label { text-anchor: end; }\n");
        svg.append("      .legend-item { font-family: 'Roboto', Arial, sans-serif; font-size: 14px; font-weight: 500; }\n");
        svg.append("      .region-label { font-family: 'Roboto', Arial, sans-serif; font-size: 12px; text-anchor: end; fill: #888; }\n");
        svg.append("    </style>\n");
        svg.append("  </defs>\n");
        
        // Define performance region colors with more subtle, modern colors
        String developingColor = "rgba(255, 76, 81, 0.08)";  // More subtle red
        String emergingColor = "rgba(255, 152, 0, 0.08)";    // More subtle orange
        String proficientColor = "rgba(46, 125, 231, 0.08)"; // More subtle blue
        String exceptionalColor = "rgba(6, 189, 109, 0.08)"; // More subtle green
        
        // Line colors for different assessment types
        Map<String, String> lineColors = new HashMap<>();
        lineColors.put("survey", "#06bd6d");  // Emerald Green - for self assessment (survey)
        lineColors.put("peer", "#9333ea");    // Vibrant purple - for peer assessment
        
        // Draw legend at the top position
        int legendY = 35; // Moved up a bit since we reduced the top padding
        int legendItemWidth = 180;
        int legendStartX = (width - (legendItemWidth * graphData.getSelectedTypes().size())) / 2;
        
        for (int i = 0; i < graphData.getSelectedTypes().size(); i++) {
            String type = graphData.getSelectedTypes().get(i);
            String color = lineColors.getOrDefault(type, "#555");
            int legendItemX = legendStartX + (i * legendItemWidth);
            
            // Draw legend line
            svg.append("  <line x1=\"").append(legendItemX).append("\" y1=\"").append(legendY)
               .append("\" x2=\"").append(legendItemX + 30).append("\" y2=\"").append(legendY)
               .append("\" stroke=\"").append(color).append("\" stroke-width=\"2\" />\n");
            
            // Draw legend point
            svg.append("  <circle cx=\"").append(legendItemX + 15).append("\" cy=\"").append(legendY)
               .append("\" r=\"5\" fill=\"white\" stroke=\"").append(color).append("\" stroke-width=\"2\" />\n");
            
            // Draw legend text
            String legendText = type.substring(0, 1).toUpperCase() + type.substring(1) + " Assessment";
            svg.append("  <text class=\"legend-item\" x=\"").append(legendItemX + 40).append("\" y=\"")
               .append(legendY + 5).append("\" fill=\"#333\">").append(escapeXml(legendText)).append("</text>\n");
        }
        
        // Calculate scale factors for mapping data values to pixel coordinates
        double yScaleFactor = chartHeight / (graphData.getMaxScore() - graphData.getMinScore());
        
        // Get unique indices and map them to x positions
        List<Integer> allIndices = graphData.getDataPoints().stream()
                .filter(point -> graphData.getSelectedIndices().contains(point.getIndex()) && 
                        graphData.getSelectedTypes().contains(point.getType()))
                .map(DataPoint::getIndex)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        
        Map<Integer, Double> indexToXPosition = new HashMap<>();
        Map<Integer, String> indexToLabel = new HashMap<>();
        
        // Calculate positions for indices, leaving margins on both sides
        if (allIndices.size() == 1) {
            // If only one index, center it
            indexToXPosition.put(allIndices.get(0), leftMargin + (dataAreaWidth / 2));
        } else if (allIndices.size() >= 2) {
            // Calculate x positions with even spacing, but leave margins on both sides
            double xStep = dataAreaWidth / (allIndices.size() - 1);
            for (int i = 0; i < allIndices.size(); i++) {
                indexToXPosition.put(allIndices.get(i), leftMargin + (i * xStep));
            }
        }
        
        // Collect labels for each index
        for (DataPoint point : graphData.getDataPoints()) {
            if (allIndices.contains(point.getIndex())) {
                indexToLabel.put(point.getIndex(), point.getLabel());
            }
        }
        
        // Draw performance regions
        double totalRange = graphData.getMaxScore() - graphData.getMinScore();
        double exceptionalHeight = (graphData.getMaxScore() - graphData.getThreshold3()) / totalRange * chartHeight;
        double proficientHeight = (graphData.getThreshold3() - graphData.getThreshold2()) / totalRange * chartHeight;
        double emergingHeight = (graphData.getThreshold2() - graphData.getThreshold1()) / totalRange * chartHeight;
        double developingHeight = (graphData.getThreshold1() - graphData.getMinScore()) / totalRange * chartHeight;
        
        // Exceptional region
        svg.append("  <rect x=\"").append(padding).append("\" y=\"").append(topPadding).append("\" width=\"")
           .append(chartWidth).append("\" height=\"").append(exceptionalHeight)
           .append("\" fill=\"").append(exceptionalColor).append("\" rx=\"4\" ry=\"4\" />\n");
        svg.append("  <text class=\"region-label\" x=\"").append(padding + chartWidth - 5).append("\" y=\"")
           .append(topPadding + exceptionalHeight/2 + 4).append("\">Exceptional</text>\n");
        
        // Proficient region
        svg.append("  <rect x=\"").append(padding).append("\" y=\"").append(topPadding + exceptionalHeight)
           .append("\" width=\"").append(chartWidth).append("\" height=\"").append(proficientHeight)
           .append("\" fill=\"").append(proficientColor).append("\" />\n");
        svg.append("  <text class=\"region-label\" x=\"").append(padding + chartWidth - 5).append("\" y=\"")
           .append(topPadding + exceptionalHeight + proficientHeight/2 + 4).append("\">Proficient</text>\n");
        
        // Emerging region
        svg.append("  <rect x=\"").append(padding).append("\" y=\"").append(topPadding + exceptionalHeight + proficientHeight)
           .append("\" width=\"").append(chartWidth).append("\" height=\"").append(emergingHeight)
           .append("\" fill=\"").append(emergingColor).append("\" />\n");
        svg.append("  <text class=\"region-label\" x=\"").append(padding + chartWidth - 5).append("\" y=\"")
           .append(topPadding + exceptionalHeight + proficientHeight + emergingHeight/2 + 4).append("\">Emerging</text>\n");
        
        // Developing region
        svg.append("  <rect x=\"").append(padding).append("\" y=\"")
           .append(topPadding + exceptionalHeight + proficientHeight + emergingHeight)
           .append("\" width=\"").append(chartWidth).append("\" height=\"").append(developingHeight)
           .append("\" fill=\"").append(developingColor).append("\" rx=\"4\" ry=\"4\" />\n");
        svg.append("  <text class=\"region-label\" x=\"").append(padding + chartWidth - 5).append("\" y=\"")
           .append(topPadding + exceptionalHeight + proficientHeight + emergingHeight + developingHeight/2 + 4)
           .append("\">Developing</text>\n");
        
        // Draw axes
        // Y-axis
        svg.append("  <line x1=\"").append(padding).append("\" y1=\"").append(topPadding).append("\" x2=\"")
           .append(padding).append("\" y2=\"").append(topPadding + chartHeight)
           .append("\" stroke=\"#aaa\" stroke-width=\"1\" />\n");
        
        // X-axis
        svg.append("  <line x1=\"").append(padding).append("\" y1=\"").append(topPadding + chartHeight)
           .append("\" x2=\"").append(padding + chartWidth).append("\" y2=\"").append(topPadding + chartHeight)
           .append("\" stroke=\"#aaa\" stroke-width=\"1\" />\n");
        
        // Y-axis labels and tick marks
        int yTickCount = 5;
        double yTickStep = (graphData.getMaxScore() - graphData.getMinScore()) / (yTickCount - 1);
        for (int i = 0; i < yTickCount; i++) {
            double value = graphData.getMinScore() + (i * yTickStep);
            double yPos = topPadding + chartHeight - (i * yTickStep * yScaleFactor);
            
            // Draw tick mark
            svg.append("  <line x1=\"").append(padding - 5).append("\" y1=\"").append(yPos)
               .append("\" x2=\"").append(padding).append("\" y2=\"").append(yPos)
               .append("\" stroke=\"#aaa\" stroke-width=\"1\" />\n");
            
            // Draw label
            svg.append("  <text class=\"axis-label y-axis-label\" x=\"").append(padding - 10)
               .append("\" y=\"").append(yPos + 4).append("\">").append(String.format("%.1f", value)).append("</text>\n");
        }
        
        // X-axis labels
        for (Integer index : allIndices) {
            double xPos = padding + indexToXPosition.get(index);
            String label = indexToLabel.get(index);
            
            // Draw tick mark
            svg.append("  <line x1=\"").append(xPos).append("\" y1=\"").append(topPadding + chartHeight)
               .append("\" x2=\"").append(xPos).append("\" y2=\"").append(topPadding + chartHeight + 5)
               .append("\" stroke=\"#aaa\" stroke-width=\"1\" />\n");
            
            // Draw label
            svg.append("  <text class=\"axis-label x-axis-label\" x=\"").append(xPos)
               .append("\" y=\"").append(topPadding + chartHeight + 20).append("\">")
               .append(escapeXml(label)).append("</text>\n");
        }
        
        // Group data by type
        Map<String, List<DataPoint>> dataByType = new HashMap<>();
        for (String type : graphData.getSelectedTypes()) {
            dataByType.put(type, new ArrayList<>());
        }
        
        // Filter and group data points
        graphData.getDataPoints().stream()
                .filter(point -> graphData.getSelectedIndices().contains(point.getIndex()) &&
                        graphData.getSelectedTypes().contains(point.getType()))
                .forEach(point -> dataByType.get(point.getType()).add(point));
        
        // Draw lines and points for each type
        for (Map.Entry<String, List<DataPoint>> entry : dataByType.entrySet()) {
            String type = entry.getKey();
            List<DataPoint> points = entry.getValue().stream()
                    .sorted(Comparator.comparing(DataPoint::getIndex))
                    .collect(Collectors.toList());
            
            if (points.isEmpty()) continue;
            
            String color = lineColors.getOrDefault(type, "#555");
            
            // Use curved paths and extend to edges
            if (points.size() >= 1) {
                // Create curved path using Bezier curves
                StringBuilder pathData = new StringBuilder();
                
                // For normalized point positions
                List<double[]> pointPositions = new ArrayList<>();
                for (DataPoint point : points) {
                    double normalizedScore = normalizeScore(graphData, point);
                    double xPos = padding + indexToXPosition.get(point.getIndex());
                    double yPos = topPadding + chartHeight - ((normalizedScore - graphData.getMinScore()) * yScaleFactor);
                    pointPositions.add(new double[] {xPos, yPos});
                }
                
                // Add edge points - extend to left and right
                if (points.size() >= 2) {
                    // Calculate points at the edges
                    double leftEdgeX = padding;
                    double rightEdgeX = padding + chartWidth;
                    
                    // Left edge - use same y-value as the leftmost data point
                    double leftEdgeY = pointPositions.get(0)[1];
                    
                    // Right edge - use same y-value as the rightmost data point
                    double rightEdgeY = pointPositions.get(pointPositions.size()-1)[1];
                    
                    // Insert left edge point at the beginning
                    pathData.append("M").append(leftEdgeX).append(",").append(leftEdgeY);
                    
                    // Curve to first actual data point
                    double firstX = pointPositions.get(0)[0];
                    double firstY = pointPositions.get(0)[1];
                    double distance = firstX - leftEdgeX;
                    double ctrlX1 = leftEdgeX + distance * 0.25;
                    double ctrlX2 = leftEdgeX + distance * 0.75;
                    
                    pathData.append(" C")
                           .append(ctrlX1).append(",").append(leftEdgeY)
                           .append(" ").append(ctrlX2).append(",").append(firstY)
                           .append(" ").append(firstX).append(",").append(firstY);
                    
                    // Add curves between actual data points
                    for (int i = 0; i < pointPositions.size() - 1; i++) {
                        double x0 = pointPositions.get(i)[0];
                        double y0 = pointPositions.get(i)[1];
                        double x1 = pointPositions.get(i+1)[0];
                        double y1 = pointPositions.get(i+1)[1];
                        
                        // Control points for the curve
                        distance = x1 - x0;
                        ctrlX1 = x0 + distance * 0.25;
                        ctrlX2 = x0 + distance * 0.75;
                        
                        pathData.append(" C")
                               .append(ctrlX1).append(",").append(y0)
                               .append(" ").append(ctrlX2).append(",").append(y1)
                               .append(" ").append(x1).append(",").append(y1);
                    }
                    
                    // Add curve to right edge
                    double lastX = pointPositions.get(pointPositions.size()-1)[0];
                    double lastY = pointPositions.get(pointPositions.size()-1)[1];
                    distance = rightEdgeX - lastX;
                    ctrlX1 = lastX + distance * 0.25;
                    ctrlX2 = lastX + distance * 0.75;
                    
                    pathData.append(" C")
                           .append(ctrlX1).append(",").append(lastY)
                           .append(" ").append(ctrlX2).append(",").append(rightEdgeY)
                           .append(" ").append(rightEdgeX).append(",").append(rightEdgeY);
                } else if (points.size() == 1) {
                    // Special case for a single data point - draw horizontal line across
                    double pointX = pointPositions.get(0)[0];
                    double pointY = pointPositions.get(0)[1];
                    double leftEdgeX = padding;
                    double rightEdgeX = padding + chartWidth;
                    
                    // Start at left edge
                    pathData.append("M").append(leftEdgeX).append(",").append(pointY);
                    
                    // Straight line to the point
                    pathData.append(" L").append(pointX).append(",").append(pointY);
                    
                    // Straight line to right edge
                    pathData.append(" L").append(rightEdgeX).append(",").append(pointY);
                }
                
                // Draw the curved path
                svg.append("  <path d=\"").append(pathData).append("\" fill=\"none\" stroke=\"")
                   .append(color).append("\" stroke-width=\"2\" stroke-linejoin=\"round\" />\n");
            }
            
            // Draw points - make them larger to match frontend
            for (DataPoint point : points) {
                double normalizedScore = normalizeScore(graphData, point);
                double xPos = padding + indexToXPosition.get(point.getIndex());
                double yPos = topPadding + chartHeight - ((normalizedScore - graphData.getMinScore()) * yScaleFactor);
                
                // Draw larger circle with white fill and colored border
                svg.append("  <circle cx=\"").append(xPos).append("\" cy=\"").append(yPos)
                   .append("\" r=\"6\" fill=\"white\" stroke=\"").append(color).append("\" stroke-width=\"2\" />\n");
            }
        }
        
        // Draw chart title at the bottom
        svg.append("  <text class=\"chart-title\" x=\"").append(width / 2).append("\" y=\"").append(height - 25).append("\">")
           .append(escapeXml(graphData.getLabel())).append("</text>\n");
        
        svg.append("</svg>");
        return svg.toString();
    }
    
    /**
     * Normalizes a data point's score based on global and local min/max values
     */
    private double normalizeScore(FocusAreaImprovementGraph graphData, DataPoint dataPoint) {
        double factor = (graphData.getMaxScore() - graphData.getMinScore()) / 
                        (dataPoint.getMaxScore() - dataPoint.getMinScore());
        
        return (dataPoint.getScore() * factor) - 
               (dataPoint.getMinScore() * factor) + 
               graphData.getMinScore();
    }
    
    /**
     * Sanitizes a filename by removing or replacing invalid characters
     */
    private String sanitizeFileName(String input) {
        // Replace spaces with underscores and remove invalid file name characters
        return input.trim().replaceAll("\\s+", "_").replaceAll("[^a-zA-Z0-9_-]", "");
    }
    
    /**
     * Escapes XML special characters in a string
     */
    private String escapeXml(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&apos;");
    }
} 