package org.cortex.backend.dto;


import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.cortex.backend.constant.TaskType;
import org.cortex.backend.model.TaskInstance;

import java.util.UUID;

@Data
public class TaskInstanceDto {

    private UUID id;

    private TaskDto taskDto;

    private UUID coachingSessionId;

    private UUID userId;

    private Boolean completed;

    private TaskType taskType;

    private UUID resourceInstanceId;

    private String trainerNotes;

    private Boolean isTrainerNotesVisible;

    @JsonIgnore
    public TaskInstance getTaskInstance(){
        TaskInstance taskInstance = new TaskInstance();
        taskInstance.setId(this.id);
        taskInstance.setCoachingSessionId(this.coachingSessionId);
        taskInstance.setUserId(this.userId);
        taskInstance.setCompleted(this.completed);
        taskInstance.setTaskType(this.taskType);
        taskInstance.setResourceInstanceId(this.resourceInstanceId);
        return taskInstance;
    }

}
