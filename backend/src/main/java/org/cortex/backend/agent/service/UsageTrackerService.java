package org.cortex.backend.agent.service;

import org.cortex.backend.agent.llm.pojo.GPTResponse;
import org.cortex.backend.agent.model.AgentTokenUsage;
import org.cortex.backend.agent.repository.AgentTokenUsageRepository;
import org.cortex.backend.security.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UsageTrackerService {

    @Autowired
    private AgentTokenUsageRepository agentTokenUsageRepository;

    public AgentTokenUsage updateUsage(GPTResponse.Usage usage, User user) {

        AgentTokenUsage agentTokenUsage;
        List<AgentTokenUsage> agentTokenUsageList = agentTokenUsageRepository.findAllByUserAndStartTimeBeforeAndEndTimeAfterOrderByUpdatedAtAsc(user, LocalDateTime.now(), LocalDateTime.now());

        if (agentTokenUsageList.isEmpty()) {
            LocalDateTime[] monthRange = getCurrentMonthTimestamps();
            agentTokenUsage = new AgentTokenUsage();
            agentTokenUsage.setUser(user);
            agentTokenUsage.setInputTokens(0L);
            agentTokenUsage.setOutputTokens(0L);
            agentTokenUsage.setStartTime(monthRange[0]);
            agentTokenUsage.setEndTime(monthRange[1]);
        } else {
            agentTokenUsage = agentTokenUsageList.get(0);
        }

        agentTokenUsage.setInputTokens(agentTokenUsage.getInputTokens() + usage.getInput_tokens());
        agentTokenUsage.setInputTokens(agentTokenUsage.getOutputTokens() + usage.getOutput_tokens());

        return agentTokenUsageRepository.save(agentTokenUsage);
    }

    /**
     * Gets the start and end timestamps of the current month
     * @return An array of LocalDateTime where index 0 is start of month and index 1 is end of month
     */
    public static LocalDateTime[] getCurrentMonthTimestamps() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1)
                .withHour(0)
                .withMinute(0)
                .withSecond(0)
                .withNano(0);

        LocalDateTime endOfMonth = startOfMonth.plusMonths(1)
                .minusNanos(1);

        return new LocalDateTime[]{startOfMonth, endOfMonth};
    }

}
