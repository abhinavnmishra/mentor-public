package org.cortex.backend.llm.Evaluations.pojo;

import lombok.Data;
import org.cortex.backend.llm.pojo.OpenAiRequest;

import java.util.ArrayList;
import java.util.List;

@Data
public class OpenAIRequestSummary extends OpenAiRequest {

    public static OpenAIRequestSummary create(String model, List<String> contextList) {
        OpenAIRequestSummary request = new OpenAIRequestSummary();
        request.setModel(model);

        List<Message> messages = new ArrayList<>();
        for(int i = 0; i<contextList.size(); i++) {
            Message message = new Message();
            message.setRole((i != (contextList.size()-1)) ? "system" : "user");
            message.setContent(contextList.get(i));
            messages.add(message);
        }
        request.setMessages(messages);
        
        return request;
    }
} 