package org.cortex.backend.llm.Surveys.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.cortex.backend.llm.Surveys.pojo.ChatItem;
import org.cortex.backend.llm.Surveys.pojo.OpenAIRequest;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "chats")
@Getter
@Setter
@AllArgsConstructor
public class AskWizardChat {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<ChatItem> chats;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AskWizardChat() {
        ArrayList<ChatItem> items = new ArrayList<>();
        ChatItem chatItem = new ChatItem();
        chatItem.setType("message");
        chatItem.setContent("Hello, how can I help you?");
        items.add(chatItem);
        this.chats = items;
    }

    public void addChats(List<ChatItem> chats) {
        this.chats.addAll(chats);
    }

    public void addChat(ChatItem chatItem) {
        this.chats.add(chatItem);
    }

    public List<ChatItem> getChats(int last) {
        return this.chats;
    }

    public List<OpenAIRequest.Message> getChatContext(int max) {
        int length = this.chats.size();
        if(max == -1) max = length;
        int start = length-max;
        if(start < 0) start = 0;
        List<ChatItem> toExtractList = this.chats.subList(start, length);
        return toExtractList.stream().map(ChatItem::toMessage).toList();
    }

}
