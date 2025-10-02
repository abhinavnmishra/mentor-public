package org.cortex.backend.agent.service;

import io.jsonwebtoken.Claims;
import org.cortex.backend.agent.chat.constant.MessageType;
import org.cortex.backend.agent.chat.entity.MessageItem;
import org.cortex.backend.agent.chat.model.AgentChat;
import org.cortex.backend.agent.chat.repository.AgentChatRepository;
import org.cortex.backend.agent.llm.AbstractLLM;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;

@Service
public class Orchestrator {

    @Autowired
    private ApplicationContext applicationContext;

    @Autowired
    private AgentChatRepository agentChatRepository;

    private final String LLM = "GPT4_1_mini";

    public AgentChat orchestrate(AgentChat agentChat, Claims claims){

        Queue<MessageItem> queue = new LinkedList<>();
        queue.addAll(agentChat.getQueue());
        agentChat.setQueue(new LinkedList<>());

        while (!queue.isEmpty()){
            MessageItem messageToProcess = queue.poll();

            switch (messageToProcess.getType()) {

                case MessageType.USER, MessageType.TOOL_RESULT, MessageType.SYSTEM, MessageType.USER_INTERNAL:
                    agentChat.getMessages().add(messageToProcess);
                    List<MessageItem> messages_user = callLLM(LLM, agentChat);
                    queue.addAll(messages_user);
                    break;

                case MessageType.TOOL_EXECUTE:

                    if ((messageToProcess.getApprovalRequired() != null && messageToProcess.getApprovalRequired()) && (messageToProcess.getApproved() == null) ) {

                        Queue<MessageItem> tempQueue = new LinkedList<>();
                        tempQueue.add(messageToProcess);
                        tempQueue.addAll(queue);
                        agentChat.setQueue(tempQueue);

                        agentChat.setQueue(queue);
                        agentChat = agentChatRepository.save(agentChat);
                        agentChat.getMessages().add(messageToProcess);
                        return agentChat;

                    } else if (messageToProcess.getApproved()) {

                        MessageItem newMessage = new MessageItem();
                        newMessage.setMessageId(UUID.randomUUID().toString());
                        newMessage.setType(MessageType.USER_INTERNAL);
                        newMessage.setMessage("User Denied Tool Call");

                        agentChat.getMessages().add(messageToProcess);
                        agentChat.getMessages().add(newMessage);
                        List<MessageItem> messages_denied = callLLM(LLM, agentChat);
                        queue.addAll(messages_denied);
                        break;

                    } else {

                        String response = callTool(messageToProcess.getTool(), messageToProcess.getInputsForToolCall(claims));

                        MessageItem newMessage = new MessageItem();
                        newMessage.setMessageId(UUID.randomUUID().toString());
                        newMessage.setType(MessageType.TOOL_RESULT);
                        newMessage.setMessage(response);

                        agentChat.getMessages().add(messageToProcess);
                        queue.add(newMessage);
                    }
                    break;

                default:
                    agentChat.getMessages().add(messageToProcess);
                    break;
            }
        }

        agentChat.setQueue(queue);
        return agentChatRepository.save(agentChat);
    }

    public String callTool(String toolName, Map<String, Object> input) {
        Function<Map<String, Object>, String> executor = applicationContext.getBean(toolName, Function.class);
        return executor.apply(input);
    }

    public List<MessageItem> callLLM(String model, AgentChat agentChat) {
        AbstractLLM llm = applicationContext.getBean(model, AbstractLLM.class);
        return llm.call(agentChat);
    }

}
