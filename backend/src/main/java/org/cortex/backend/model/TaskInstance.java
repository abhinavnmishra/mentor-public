package org.cortex.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.cortex.backend.constant.TaskType;
import org.cortex.backend.dto.TaskInstanceDto;

import java.util.UUID;

@Entity
@Table(name = "task_instance")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TaskInstance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private Task task;

    private UUID coachingSessionId;

    private UUID userId;

    @Column(length=5000)
    private String trainerNotes;

    private Boolean isTrainerNotesVisible = false;

    private Boolean completed = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskType taskType;

    private UUID resourceInstanceId;

    @JsonIgnore
    public TaskInstanceDto getTaskInstanceDto(){
        TaskInstanceDto taskInstanceDto = new TaskInstanceDto();
        taskInstanceDto.setId(this.id);
        if(this.task != null){
            taskInstanceDto.setTaskDto(this.task.getTaskDto());
        }
        taskInstanceDto.setCoachingSessionId(this.coachingSessionId);
        taskInstanceDto.setUserId(this.userId);
        taskInstanceDto.setCompleted(this.completed);
        taskInstanceDto.setTaskType(this.taskType);
        taskInstanceDto.setResourceInstanceId(this.resourceInstanceId);
        taskInstanceDto.setTrainerNotes(this.trainerNotes);
        taskInstanceDto.setIsTrainerNotesVisible(this.isTrainerNotesVisible);
        return taskInstanceDto;
    }
}
