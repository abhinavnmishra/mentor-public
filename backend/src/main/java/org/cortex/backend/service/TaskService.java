package org.cortex.backend.service;

import org.cortex.backend.agreements.dto.AgreementVersionResponse;
import org.cortex.backend.agreements.dto.AgreementVersionUserCopyResponse;
import org.cortex.backend.agreements.dto.CreateUserCopyRequest;
import org.cortex.backend.agreements.service.AgreementService;
import org.cortex.backend.constant.TaskType;
import org.cortex.backend.dto.TaskDto;
import org.cortex.backend.dto.TaskInstanceDto;
import org.cortex.backend.dto.UpdateTrainerNotesRequest;
import org.cortex.backend.forms.model.FormResponse;
import org.cortex.backend.forms.service.FormService;
import org.cortex.backend.model.CoachingSession;
import org.cortex.backend.model.Task;
import org.cortex.backend.model.TaskInstance;
import org.cortex.backend.repository.CoachingSessionRepository;
import org.cortex.backend.repository.TaskInstanceRepository;
import org.cortex.backend.repository.TaskRepository;
import org.cortex.backend.security.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskInstanceRepository taskInstanceRepository;

    @Autowired
    private CoachingSessionRepository coachingSessionRepository;

    @Autowired
    private AgreementService agreementService;

    @Autowired
    private FormService formService;

    public List<TaskDto> findAllTaskByProgramId(String programId) {
        return taskRepository.findAllByCoachingProgramId(UUID.fromString(programId)).stream().map(Task::getTaskDto).toList();
    }

    public TaskInstanceDto updateTaskInstanceNotes(UpdateTrainerNotesRequest updateTrainerNotesRequest, String taskInstanceId) {
        TaskInstance taskInstance = taskInstanceRepository.findById(UUID.fromString(taskInstanceId)).orElseThrow(() -> new RuntimeException("Task Instance not found"));
        taskInstance.setTrainerNotes(updateTrainerNotesRequest.getTrainerNotes());
        taskInstance.setIsTrainerNotesVisible(updateTrainerNotesRequest.getIsTrainerNotesVisible());
        taskInstance = taskInstanceRepository.save(taskInstance);
        return taskInstance.getTaskInstanceDto();

    }

    public List<TaskInstanceDto> findAllTaskInstanceByProgramIdAndUserId(String programId, String userId) {
        return taskInstanceRepository.findAllByProgramIdAndUserId(UUID.fromString(programId), UUID.fromString(userId)).stream()
                .map(ti -> {
                    if(!ti.getCompleted()){
                        if (ti.getTaskType().equals(TaskType.FORM)){
                            FormResponse formResponse = formService.getFormResponseById(ti.getResourceInstanceId()).orElseThrow(() -> new RuntimeException("Form Response not found"));
                            if(formResponse != null && formResponse.getIsSubmitted() != null && formResponse.getIsSubmitted()){
                                ti.setCompleted(true);
                                return taskInstanceRepository.save(ti);
                            }
                        } else if (ti.getTaskType().equals(TaskType.AGREEMENT)){
                            boolean status = agreementService.hasUserAcceptedVersion(ti.getResourceInstanceId().toString());
                            if(status){
                                ti.setCompleted(true);
                                return taskInstanceRepository.save(ti);
                            }
                        }
                    }
                    return ti;
                })
                .map(TaskInstance::getTaskInstanceDto).toList();
    }

    public List<TaskDto> createTask(TaskDto taskDto) {
        Task task = taskDto.getTask();
        task = taskRepository.save(task);
        if (taskDto.getCoachingProgramId() != null){
            List<CoachingSession> coachingSessions = coachingSessionRepository.findByCoachingProgramId(taskDto.getCoachingProgramId());
            for (CoachingSession coachingSession : coachingSessions) {
                TaskInstance taskInstance = new TaskInstance();
                taskInstance.setTask(task);
                taskInstance.setCoachingSessionId(coachingSession.getId());
                taskInstance.setUserId(coachingSession.getClient().getUser().getId());
                taskInstance.setTaskType(task.getTaskType());
                if(task.getTaskType().equals(TaskType.AGREEMENT)){
                    AgreementVersionResponse agreementVersion = agreementService.getVersionById(task.getResourceId().toString());
                    User user = coachingSession.getClient().getUser();
                    CreateUserCopyRequest createUserCopyRequest = new CreateUserCopyRequest();
                    createUserCopyRequest.setAgreementVersionId(agreementVersion.getId());
                    createUserCopyRequest.setUserId(user.getId().toString());
                    createUserCopyRequest.setUserName(user.getFirstName() + " " + user.getLastName());
                    createUserCopyRequest.setUserEmail(user.getEmail());
                    createUserCopyRequest.setUserOrganisation(coachingSession.getClient().getClientOrganisation().getName());
                    AgreementVersionUserCopyResponse agreementVersionUserCopy = agreementService.createUserCopy(createUserCopyRequest);
                    taskInstance.setResourceInstanceId(UUID.fromString(agreementVersionUserCopy.getId()));
                } else if (task.getTaskType().equals(TaskType.FORM)) {
                    FormResponse formResponse = formService.createFormResponse(task.getResourceId(), coachingSession.getClient().getUser().getId());
                    taskInstance.setResourceInstanceId(formResponse.getId());
                }
                taskInstance.setTrainerNotes("");
                taskInstance.setIsTrainerNotesVisible(false);

                taskInstanceRepository.save(taskInstance);
            }
            return findAllTaskByProgramId(taskDto.getCoachingProgramId().toString());
        }

        return List.of(task.getTaskDto());
    }

    public TaskInstance createTaskInstanceForClient(Task task, CoachingSession coachingSession){
        TaskInstance taskInstance = new TaskInstance();
        taskInstance.setTask(task);
        taskInstance.setCoachingSessionId(coachingSession.getId());
        taskInstance.setUserId(coachingSession.getClient().getUser().getId());
        taskInstance.setTaskType(task.getTaskType());
        if(task.getTaskType().equals(TaskType.AGREEMENT)){
            AgreementVersionResponse agreementVersion = agreementService.getVersionById(task.getResourceId().toString());
            User user = coachingSession.getClient().getUser();
            CreateUserCopyRequest createUserCopyRequest = new CreateUserCopyRequest();
            createUserCopyRequest.setAgreementVersionId(agreementVersion.getId());
            createUserCopyRequest.setUserId(user.getId().toString());
            createUserCopyRequest.setUserName(user.getFirstName() + " " + user.getLastName());
            createUserCopyRequest.setUserEmail(user.getEmail());
            createUserCopyRequest.setUserOrganisation(coachingSession.getClient().getClientOrganisation().getName());
            AgreementVersionUserCopyResponse agreementVersionUserCopy = agreementService.createUserCopy(createUserCopyRequest);
            taskInstance.setResourceInstanceId(UUID.fromString(agreementVersionUserCopy.getId()));
        } else if (task.getTaskType().equals(TaskType.FORM)) {
            FormResponse formResponse = formService.createFormResponse(task.getResourceId(), coachingSession.getClient().getUser().getId());
            taskInstance.setResourceInstanceId(formResponse.getId());
        }
        taskInstance.setTrainerNotes("");
        taskInstance.setIsTrainerNotesVisible(false);

        return taskInstanceRepository.save(taskInstance);
    }

    public List<TaskDto> updateTask(TaskDto taskDto) {
        Task task = taskDto.getTask();
        task = taskRepository.save(task);
        return findAllTaskByProgramId(taskDto.getCoachingProgramId().toString());
    }



}
