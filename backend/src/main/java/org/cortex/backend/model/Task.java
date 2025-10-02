package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.constant.TaskType;
import org.cortex.backend.dto.TaskDto;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "task")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;

    @Column(length=5000)
    private String instructions;

    private UUID coachingProgramId;

    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType taskType;

    private UUID resourceId;

    @JsonIgnore
    public TaskInstance toTaskInstance(UUID coachingSessionId, UUID userId) {
        TaskInstance taskInstance = new TaskInstance();
        taskInstance.setTask(this);
        taskInstance.setCoachingSessionId(coachingSessionId);
        taskInstance.setUserId(userId);
        taskInstance.setTaskType(this.taskType);
        taskInstance.setCompleted(false);
        return taskInstance;
    }

    @JsonIgnore
    public TaskDto getTaskDto(){
        TaskDto taskDto = new TaskDto();
        taskDto.setId(this.id);
        taskDto.setTitle(this.title);
        taskDto.setInstructions(this.instructions);
        taskDto.setCoachingProgramId(this.coachingProgramId);
        taskDto.setDueDate(this.dueDate);
        taskDto.setTaskType(this.taskType);
        taskDto.setResourceId(this.resourceId);
        return taskDto;
    }

}
