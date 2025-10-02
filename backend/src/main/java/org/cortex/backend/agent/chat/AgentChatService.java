package org.cortex.backend.agent.chat;

import io.jsonwebtoken.Claims;
import org.apache.commons.io.IOUtils;
import org.cortex.backend.agent.chat.constant.MessageType;
import org.cortex.backend.agent.chat.entity.AgentChatRequest;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.agent.chat.model.AgentChat;
import org.cortex.backend.agent.chat.repository.AgentChatRepository;
import org.cortex.backend.agent.service.Orchestrator;
import org.cortex.backend.agent.utility.Converter;
import org.cortex.backend.exception.ResourceNotFoundException;
import org.cortex.backend.model.Trainer;
import org.cortex.backend.repository.TrainerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AgentChatService {

    @Value("classpath:agent/platform_context.txt")
    private Resource platformContextResource;

    @Value("classpath:agent/agent_context.txt")
    private Resource agentContextResource;

    @Value("classpath:agent/tool_list.xml")
    private Resource toolListResource;

    private String platformContextContent;
    private String agentContextContent;
    private String toolListContent;

    @PostConstruct
    public void init() throws IOException {
        try (Reader platformReader = new InputStreamReader(platformContextResource.getInputStream(), StandardCharsets.UTF_8)) {
            platformContextContent = FileCopyUtils.copyToString(platformReader);
        }
        try (Reader agentReader = new InputStreamReader(agentContextResource.getInputStream(), StandardCharsets.UTF_8)) {
            agentContextContent = FileCopyUtils.copyToString(agentReader);
        }
        try (Reader toolListReader = new InputStreamReader(toolListResource.getInputStream(), StandardCharsets.UTF_8)) {
            toolListContent = FileCopyUtils.copyToString(toolListReader);
        }
    }

    @Autowired
    private AgentChatRepository agentChatRepository;

    @Autowired
    private TrainerRepository trainerRepository;

    @Autowired
    private Orchestrator orchestrator;

    private final Integer LAST_CHATS = 30;

    public AgentChat initiateChat(Claims claims) {
        try {
            UUID userId = UUID.fromString((String) claims.get("userId"));
            Trainer trainer = trainerRepository.findByUser_Id(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

            List<MessageItem> messages = new ArrayList<>();

            // Add platform context
            MessageItem platformContextMsg = new MessageItem();
            platformContextMsg.setMessageId(UUID.randomUUID().toString());
            platformContextMsg.setType(MessageType.SYSTEM);
            platformContextMsg.setMessage(platformContextContent);
            messages.add(platformContextMsg);

            // Add agent context
            MessageItem agentContextMsg = new MessageItem();
            agentContextMsg.setMessageId(UUID.randomUUID().toString());
            agentContextMsg.setType(MessageType.SYSTEM);
            agentContextMsg.setMessage(agentContextContent);
            messages.add(agentContextMsg);

            // Add tool list context
            MessageItem toolListMsg = new MessageItem();
            toolListMsg.setMessageId(UUID.randomUUID().toString());
            toolListMsg.setType(MessageType.SYSTEM);
            toolListMsg.setMessage(toolListContent);
            messages.add(toolListMsg);

            // Add initial greeting message
            MessageItem greetingMsg = new MessageItem();
            greetingMsg.setMessageId(UUID.randomUUID().toString());
            greetingMsg.setType(MessageType.AGENT);
            greetingMsg.setMessage("Hello! I'm Mentivo. I can help with assessments, feedback, or coaching plans — where shall we start?");
            messages.add(greetingMsg);

            AgentChat agentChat = new AgentChat();
            agentChat.setTrainer(trainer);
            agentChat.setMessages(messages);
            return agentChatRepository.save(agentChat);
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize chat: " + e.getMessage(), e);
        }
    }

    public List<MessageItem> getChatsById(String chatIdString, Integer count){
        if (count == null || count == 0) count = LAST_CHATS;

        UUID chatId = UUID.fromString(chatIdString);

        Optional<AgentChat> agentChatOptional = agentChatRepository.findById(chatId);

        if (agentChatOptional.isPresent()){
            return agentChatOptional.get().getLastMessages(count);
        }

        throw new ResourceNotFoundException("Chat Not Found");
    }

    public List<AgentChat.ChatMetadata> getPastChats(Claims claims){

        UUID userId = UUID.fromString((String) claims.get("userId"));
        Trainer trainer = trainerRepository.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

        List<AgentChat> agentChatList = agentChatRepository.findTop10ByTrainerOrderByCreatedAtDesc(trainer);
        return agentChatList.stream().map(AgentChat::getMetadata).collect(Collectors.toList());
    }

    public List<MessageItem> prompt(AgentChatRequest chatRequest, Claims claims){

        AgentChat agentChat = agentChatRepository.findById(UUID.fromString(chatRequest.getChatId()))
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        Queue<MessageItem> queue = agentChat.getQueue();

        if (chatRequest.getIsAction() != null && chatRequest.getIsAction()){
            for (MessageItem item : queue){

                if (item.getMessageId().equalsIgnoreCase(chatRequest.getMessageId())) {
                    if (chatRequest.getApproved() == null || !chatRequest.getApproved()){
                        item.setApproved(false);

                        Queue<MessageItem> tempQueue = new LinkedList<>();
                        tempQueue.add(item);
                        agentChat.setQueue(tempQueue);

                        agentChat = orchestrator.orchestrate(agentChat, claims);
                        return agentChat.getLastMessages(LAST_CHATS);

                    } else {
                        item.setApproved(true);
                        agentChat = orchestrator.orchestrate(agentChat, claims);
                        return agentChat.getLastMessages(LAST_CHATS);
                    }
                }
            }

            MessageItem messageItem = new MessageItem();
            messageItem.setMessageId(UUID.randomUUID().toString());
            messageItem.setError_message("Some error happened while performing the action!");
            messageItem.setMessage("Some error happened while performing the action!");
            messageItem.setType(MessageType.SYSTEM);

            Queue<MessageItem> tempQueue = new LinkedList<>();
            tempQueue.add(messageItem);
            agentChat.setQueue(tempQueue);

            agentChat = orchestrator.orchestrate(agentChat, claims);
            return agentChat.getLastMessages(LAST_CHATS);

        } else {
            MessageItem messageItem = new MessageItem();
            messageItem.setMessageId(UUID.randomUUID().toString());
            messageItem.setType(MessageType.USER);
            messageItem.setMessage(chatRequest.getMessage());

            Queue<MessageItem> tempQueue = new LinkedList<>();
            tempQueue.add(messageItem);
            tempQueue.addAll(queue);
            agentChat.setQueue(tempQueue);

            agentChat = orchestrator.orchestrate(agentChat, claims);
            return agentChat.getLastMessages(LAST_CHATS);
        }
    }

}
