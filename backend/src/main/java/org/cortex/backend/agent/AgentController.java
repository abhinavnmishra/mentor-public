package org.cortex.backend.agent;

import io.jsonwebtoken.Claims;
import org.cortex.backend.agent.chat.AgentChatService;
import org.cortex.backend.agent.chat.entity.AgentChatRequest;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.agent.chat.model.AgentChat;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agent/chat")
public class AgentController {

    @Autowired
    private AgentChatService agentChatService;

    @PostMapping("/initiate")
    public ResponseEntity<AgentChat> initiateChat(@AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(agentChatService.initiateChat(claims));
    }

    @GetMapping("/{chatId}")
    public ResponseEntity<List<MessageItem>> getChatsById(
            @PathVariable String chatId,
            @RequestParam(required = false) Integer count) {
        return ResponseEntity.ok(agentChatService.getChatsById(chatId, count));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AgentChat.ChatMetadata>> getPastChats(@AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(agentChatService.getPastChats(claims));
    }

    @PostMapping("/prompt")
    public ResponseEntity<List<MessageItem>> prompt(
            @RequestBody AgentChatRequest chatRequest,
            @AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(agentChatService.prompt(chatRequest, claims));
    }
}
