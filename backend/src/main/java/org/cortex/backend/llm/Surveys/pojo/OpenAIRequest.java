package org.cortex.backend.llm.Surveys.pojo;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OpenAIRequest {
    private String model;
    private List<Message> messages;
    
    @JsonProperty("response_format")
    private Object responseFormat; // This will be populated from the JSON template

    @Data
    public static class Message {
        private String role;
        private String content;
    }

    public static OpenAIRequest create(String model, String userPrompt, List<OpenAIRequest.Message> chatContext, String clientContext, String focusAreaContext) {
        OpenAIRequest request = new OpenAIRequest();
        request.setModel(model);
        
        Message systemMessage1 = new Message();
        systemMessage1.setRole("system");
        systemMessage1.setContent("You are an AI assistant specializing in creating psychometric assessments, peer review questions, and feedback for corporate leadership trainers. You draw upon principles of organizational psychology, leadership development, and adult learning to produce content that accurately evaluates leadership competencies, promotes self-awareness, and facilitates growth. Your outputs should be clear, concise, and actionable, addressing a diverse range of leadership skills (e.g., communication, emotional intelligence, strategic thinking, team-building, conflict management, and decision-making). Output a structured JSON array of items following the provided schema. If the user requests questions, generate them. If the user requests an explanation or info, output a 'message' type. Always respond following the schema exactly. At any time if the user prompts to suggest some questions you should not suggest more than 5 questions unless specified by the user to do so. Try to identify what the user wants from you from user prompt and reply accordingly. Whenever asked to generate a question always start with a 'message' type response summarising the user requirements and replying like a human assistant would initiate a conversation. You can answer any questions about the information in your context such as mentee/client details and program details. Do not answer questions beyond the scope of your job and deny such requests with a polite refusal.");

        Message systemMessage2 = new Message();
        systemMessage2.setRole("system");
        systemMessage2.setContent("The user is an Industrial Psychologist or a corporate trainer who coaches corporate clients. The user is using a tool called MentorAI that helps the user to create programs and design curriculums to coach clients. Multiple clients can be a part of the same program. The program curriculum can contain either an activity, a survey to be completed by the clients or a peer review to be completed by the peers of the client. You are the AI Agent representing MentorAI tool and you have to help the user create questions for the survey/assessments/peer reviews as prompted.");

        Message systemMessage3 = new Message();
        systemMessage3.setRole("system");
        systemMessage3.setContent("Here is the context on clients/mentees in the current program (If the following client list is empty then you can infer that there are no clients attached with this program or survey yet) : " + clientContext);

        Message systemMessage5 = new Message();
        systemMessage5.setRole("system");
        systemMessage5.setContent("Here is the context on focus areas in the current program (If the following focus area list is empty then you can infer that there are no focus areas attached with this program or survey yet) : " + focusAreaContext);

        Message systemMessage4 = new Message();
        systemMessage4.setRole("system");
        systemMessage4.setContent("Here is a history of past few chats between the AI agent and the user if there are any. Follow the flow of the conversation.");

        Message userMessage = new Message();
        userMessage.setRole("user");
        userMessage.setContent(userPrompt);

        ArrayList<OpenAIRequest.Message> messageList = new ArrayList<>(List.of(systemMessage1, systemMessage2, systemMessage3, systemMessage5, systemMessage4));
        messageList.addAll(chatContext);
        messageList.add(userMessage);

        request.setMessages(messageList);
        
        return request;
    }
} 