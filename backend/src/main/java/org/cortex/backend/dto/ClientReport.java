package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.model.Report;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClientReport {

    private Client client;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private RadarGraph improvementGraph;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private RadarGraph peerReviewComparisonGraph;

    private List<ClientFocusAreaReport> focusAreas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClientFocusAreaReport {
        private String focusAreaId;
        private String clientId;
        private String focusAreaImprovementSummary;
        private FocusAreaImprovementGraph focusAreaImprovementGraph;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Client {
        private String clientId;
        private String clientName;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FocusAreaImprovementGraph {
        private String label;
        private Double minScore;
        private Double maxScore;
        private Double threshold1;
        private Double threshold2;
        private Double threshold3;
        private List<String> types;
        private List<String> selectedTypes;
        private List<Integer> selectedIndices;
        private List<DataPoint> dataPoints;

        @JsonIgnore
        public Boolean isEmpty(){
            return dataPoints == null || dataPoints.isEmpty();
        }

        @JsonIgnore
        public String getGraphContext() {
            if (dataPoints == null || dataPoints.isEmpty()) {
                return "No evaluation data available for this focus area.";
            }

            StringBuilder context = new StringBuilder();
            
            // Basic graph information
            context.append("Focus Area: ").append(label != null ? label : "Unnamed Focus Area").append("\n");
            context.append("Score Range: ").append(minScore).append(" to ").append(maxScore).append("\n");
            
            // Threshold information
            if (threshold1 != null || threshold2 != null || threshold3 != null) {
                context.append("Performance Thresholds: ");
                if (threshold1 != null) context.append("Level 1: ").append(threshold1).append(" ");
                if (threshold2 != null) context.append("Level 2: ").append(threshold2).append(" ");
                if (threshold3 != null) context.append("Level 3: ").append(threshold3).append(" ");
                context.append("\n");
            }
            
            // Data points analysis
            context.append("Evaluation History (").append(dataPoints.size()).append(" evaluations):\n");
            
            // Sort data points by index to ensure chronological order
            List<DataPoint> sortedPoints = new ArrayList<>(dataPoints);
            sortedPoints.sort((a, b) -> Integer.compare(a.getIndex(), b.getIndex()));
            
            Double firstScore = null;
            Double lastScore = null;
            Double highestScore = null;
            Double lowestScore = null;
            String bestEvaluation = null;
            String worstEvaluation = null;
            
            for (DataPoint point : sortedPoints) {
                if (point.getScore() != null) {
                    context.append("- ").append(point.getLabel()).append(": ").append(point.getScore());
                    if (point.getType() != null) {
                        context.append(" (").append(point.getType()).append(")");
                    }
                    context.append("\n");
                    
                    // Track statistics
                    if (firstScore == null) firstScore = point.getScore();
                    lastScore = point.getScore();
                    
                    if (highestScore == null || point.getScore() > highestScore) {
                        highestScore = point.getScore();
                        bestEvaluation = point.getLabel();
                    }
                    
                    if (lowestScore == null || point.getScore() < lowestScore) {
                        lowestScore = point.getScore();
                        worstEvaluation = point.getLabel();
                    }
                }
            }
            
            // Trend analysis
            if (firstScore != null && lastScore != null && sortedPoints.size() > 1) {
                context.append("\nTrend Analysis:\n");
                double overallChange = lastScore - firstScore;
                double percentageChange = (overallChange / firstScore) * 100;
                
                if (Math.abs(overallChange) < 0.1) {
                    context.append("- Overall performance has remained relatively stable");
                } else if (overallChange > 0) {
                    context.append("- Overall improvement of ").append(String.format("%.2f", overallChange))
                           .append(" points (").append(String.format("%.1f", percentageChange)).append("% increase)");
                } else {
                    context.append("- Overall decline of ").append(String.format("%.2f", Math.abs(overallChange)))
                           .append(" points (").append(String.format("%.1f", Math.abs(percentageChange))).append("% decrease)");
                }
                context.append("\n");
                
                // Performance range
                if (highestScore != null && lowestScore != null) {
                    context.append("- Performance range: ").append(String.format("%.2f", lowestScore))
                           .append(" to ").append(String.format("%.2f", highestScore))
                           .append(" (variation of ").append(String.format("%.2f", highestScore - lowestScore)).append(" points)\n");
                    
                    if (!bestEvaluation.equals(worstEvaluation)) {
                        context.append("- Best performance: ").append(bestEvaluation)
                               .append(" (").append(String.format("%.2f", highestScore)).append(")\n");
                        context.append("- Lowest performance: ").append(worstEvaluation)
                               .append(" (").append(String.format("%.2f", lowestScore)).append(")\n");
                    }
                }
            }
            
            // Threshold performance analysis
            if (lastScore != null && (threshold1 != null || threshold2 != null || threshold3 != null)) {
                context.append("\nCurrent Performance Level:\n");
                if (threshold3 != null && lastScore >= threshold3) {
                    context.append("- Currently performing at the highest level (above threshold 3)");
                } else if (threshold2 != null && lastScore >= threshold2) {
                    context.append("- Currently performing at a good level (above threshold 2)");
                } else if (threshold1 != null && lastScore >= threshold1) {
                    context.append("- Currently performing at a basic level (above threshold 1)");
                } else {
                    context.append("- Currently performing below established thresholds");
                }
                context.append("\n");
            }
            
            // Selected types information
            if (selectedTypes != null && !selectedTypes.isEmpty()) {
                context.append("\nFocus Areas: ").append(String.join(", ", selectedTypes)).append("\n");
            }
            
            return context.toString();
        }
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPoint {
        private int index;
        private String label;
        private Double minScore;
        private Double maxScore;
        private Double score;
        private String type;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarGraph {
        private String label;
        private Double minScore;
        private Double maxScore;
        private Double threshold1;
        private Double threshold2;
        private Double threshold3;
        private List<String> focusAreas;
        private RadarLine line1;
        private RadarLine line2;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarLine {
        private String label;
        private List<RadarFocusArea> focusAreas;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarFocusArea {
        private String label;
        private int selectedIndex;
        private List<RadarDataPoint> dataPoints;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RadarDataPoint {
        private String label;
        private Double score;
    }

}
