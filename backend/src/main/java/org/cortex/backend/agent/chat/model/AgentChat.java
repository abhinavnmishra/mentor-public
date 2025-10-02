package org.cortex.backend.agent.chat.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.model.Trainer;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Queue;
import java.util.UUID;

@Entity
@Table(name = "agent_chat")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AgentChat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<MessageItem> messages;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Queue<MessageItem> queue;

    @ManyToOne
    private Trainer trainer;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Transient
    @JsonIgnore
    public List<MessageItem> getLastMessages(int max) {
        int length = this.messages.size();
        if(max == -1) max = length;
        int start = length-max;
        if(start < 0) start = 0;
        return this.messages.subList(start, length);
    }

    @Data
    @AllArgsConstructor
    public static class ChatMetadata {
        private String id;
        private String name;
    }

    @JsonIgnore
    public ChatMetadata getMetadata(){
        DateTimeFormatter customFormatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
        String customFormattedDateTime = this.createdAt.format(customFormatter);
        return new ChatMetadata(this.id.toString(), customFormattedDateTime);
    }

}
