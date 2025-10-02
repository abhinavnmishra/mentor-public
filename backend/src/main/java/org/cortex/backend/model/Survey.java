package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.cortex.backend.constant.SurveyType;
import org.cortex.backend.dto.SurveyWizardDto;
import org.cortex.backend.llm.Surveys.model.AskWizardChat;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "survey")
@Getter
@Setter
@AllArgsConstructor
public class Survey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Getter
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String,Object> template;

    private String title;

    @Column(length=5000)
    private String objective;

    private Integer peerReviewCount;

    @OneToOne
    @JsonIgnore
    private AskWizardChat askWizardChat;

    @Column(length=10000)
    private String surveySummary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SurveyType type;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    private int completedCount;

    @Transient
    private int pendingCount;

    public void setObjective(String objective){
        this.objective = objective;
        Map<String, Object> t = getTemplate();
        t.put("objective", objective);
        setTemplate(t);
    }

    public void setTitle(String title){
        this.title = title;
        Map<String, Object> t = getTemplate();
        t.put("title", title);
        setTemplate(t);
    }

    public void setPublished(Boolean published){
        Map<String, Object> t = getTemplate();
        t.put("published", published);
        setTemplate(t);
    }

    public Boolean getPublished(){
        Map<String, Object> t = getTemplate();
        return  (Boolean) t.get("published");
    }

    public void setType(SurveyType type){
        this.type = type;
        Map<String, Object> t = getTemplate();
        t.put("type", type.toString());
        setTemplate(t);
    }

    public void setStartDate(LocalDate startDate){
        Map<String, Object> t = getTemplate();
        t.put("startDate", startDate.toString());
        setTemplate(t);
    }

    public void setDueDate(LocalDate dueDate){
        Map<String, Object> t = getTemplate();
        t.put("dueDate", dueDate.toString());
        setTemplate(t);
    }

    public void setSurveyId(){
        Map<String, Object> t = getTemplate();
        t.put("id", id);
        setTemplate(t);
    }

    public void setQuestions(ArrayList<ArrayList<SurveyWizardDto.QuestionItem>> questions) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
            
            Map<String, Object> t = getTemplate();
            t.put("questions", questions);
            setTemplate(t);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Survey() {
        try {
            this.peerReviewCount = 1;
            ArrayList<Object> inner = new ArrayList<>();
            ArrayList<ArrayList<Object>> outer = new ArrayList<>();
            outer.add(inner);

            Map<String, Object> defaultTemplate = new HashMap<>();
            defaultTemplate.put("id", "");
            defaultTemplate.put("title", "");
            defaultTemplate.put("objective", "");
            defaultTemplate.put("type", "");
            defaultTemplate.put("startDate", "");
            defaultTemplate.put("dueDate", "");
            defaultTemplate.put("published", false);
            defaultTemplate.put("questions", outer);

            this.template = defaultTemplate;
        } catch (Exception e) {
            e.printStackTrace();
            this.template = new HashMap<>(); // Fallback to empty object if serialization fails
        }
    }

    @JsonIgnore
    public String getContext() {
        StringBuilder questionsJson = new StringBuilder("[");
        
        try {
            // Extract questions from template
            if (template != null && template.containsKey("questions")) {
                ArrayList<ArrayList<Map<String, Object>>> questions = 
                    (ArrayList<ArrayList<Map<String, Object>>>) template.get("questions");
                
                boolean isFirstQuestion = true;
                for (ArrayList<Map<String, Object>> page : questions) {
                    for (Map<String, Object> question : page) {
                        if (!isFirstQuestion) {
                            questionsJson.append(",");
                        }
                        
                        String content = question.containsKey("content") ? 
                            question.get("content").toString().replace("\"", "\\\"") : "";
                        
                        String type = question.containsKey("type") ? 
                            question.get("type").toString() : "";
                        
                        questionsJson.append("{\"content\":\"").append(content).append("\"");
                        questionsJson.append(",\"type\":\"").append(type).append("\"");
                        
                        // Add options only if type contains "mcq" (case insensitive)
                        if (type.toLowerCase().contains("mcq") && question.containsKey("options")) {
                            questionsJson.append(",\"options\":[");
                            
                            Object[] options = (Object[]) question.get("options");
                            for (int i = 0; i < options.length; i++) {
                                if (i > 0) {
                                    questionsJson.append(",");
                                }
                                questionsJson.append("\"").append(options[i].toString().replace("\"", "\\\"")).append("\"");
                            }
                            
                            questionsJson.append("]");
                        }
                        
                        questionsJson.append("}");
                        isFirstQuestion = false;
                    }
                }
            }
        } catch (Exception e) {
            // In case of any error, return empty array
            return String.format("""
                    {
                        "id": "%s",
                        "title": "%s",
                        "objective": "%s",
                        "type": "%s",
                        "questions": []
                    }""",
                    id,
                    title != null ? title.replace("\"", "\\\"") : "",
                    objective != null ? objective.replace("\"", "\\\"") : "",
                    type != null ? type.toString() : ""
            );
        }
        
        questionsJson.append("]");
        
        return String.format("""
                {
                    "id": "%s",
                    "title": "%s",
                    "objective": "%s",
                    "type": "%s",
                    "questions": %s
                }""",
                id,
                title != null ? title.replace("\"", "\\\"") : "",
                objective != null ? objective.replace("\"", "\\\"") : "",
                type != null ? type.toString() : "",
                questionsJson.toString()
        );
    }

    @JsonIgnore
    public String getIndexData() {
        return String.format("""
                {
                    "id": "%s",
                    "title": "%s",
                    "objective": "%s"
                    "type": "%s",
                    "published": %b
                }""",
                id,
                title != null ? title.replace("\"", "\\\"") : "",
                objective != null ? objective.replace("\"", "\\\"") : "",
                type != null ? type.toString() : "",
                getPublished() != null ? getPublished() : false
        );
    }

}
