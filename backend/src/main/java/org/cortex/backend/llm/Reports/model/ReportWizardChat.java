package org.cortex.backend.llm.Reports.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.cortex.backend.llm.Reports.pojo.ChatItem;
import org.cortex.backend.llm.Reports.pojo.OpenAIRequestReport;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "report_wizard_chat")
@Getter
@Setter
@AllArgsConstructor
public class ReportWizardChat {

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

    public ReportWizardChat() {
        ArrayList<ChatItem> items = new ArrayList<>();
        ChatItem chatItem = new ChatItem();
        chatItem.setType("message");
        chatItem.setMessage("Hello, how can I help you?");
        items.add(chatItem);
        this.chats = items;
    }

    public void addChats(List<ChatItem> chats) {
        this.chats.addAll(chats);
    }

    public void addChat(ChatItem chatItem) {
        this.chats.add(chatItem);
    }

    public List<ChatItem> getChats(int max) {
        int length = this.chats.size();
        if(max == -1) max = length;
        int start = length-max;
        if(start < 0) start = 0;
        return this.chats.subList(start, length);
    }

    public List<OpenAIRequestReport.Message> getChatContext(int max) {
        int length = this.chats.size();
        if(max == -1) max = length;
        int start = length-max;
        if(start < 0) start = 0;
        List<ChatItem> toExtractList = this.chats.subList(start, length);
        return toExtractList.stream().map(ChatItem::toMessage).toList();
    }
}
