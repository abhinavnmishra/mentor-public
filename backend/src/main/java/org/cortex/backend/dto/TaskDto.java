package org.cortex.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import org.cortex.backend.constant.TaskType;
import org.cortex.backend.model.Task;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class TaskDto {

    private UUID id;

    private String title;

    private String instructions;

    private UUID coachingProgramId;

    private LocalDate dueDate;

    private TaskType taskType;

    private UUID resourceId;

    @JsonIgnore
    public Task getTask(){
        Task task = new Task();
        task.setId(this.id);
        task.setTitle(this.title);
        task.setInstructions(this.instructions);
        task.setCoachingProgramId(this.coachingProgramId);
        task.setDueDate(this.dueDate);
        task.setTaskType(this.taskType);
        task.setResourceId(this.resourceId);
        return task;
    }

}
