package org.cortex.backend.agent.chat.entity;

import lombok.Data;

@Data
public class AgentChatRequest {

    private String chatId;
    private String messageId;
    private String message;
    private Boolean isAction;
    private Boolean approved;

}
