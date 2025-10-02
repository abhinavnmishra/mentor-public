package org.cortex.backend.controller;

import io.jsonwebtoken.Claims;
import org.cortex.backend.dto.TaskDto;
import org.cortex.backend.dto.TaskInstanceDto;
import org.cortex.backend.dto.UpdateTrainerNotesRequest;
import org.cortex.backend.service.TaskService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private static final Logger logger = LoggerFactory.getLogger(TaskController.class);

    @Autowired
    private TaskService taskService;

    @GetMapping("/program/{programId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    public ResponseEntity<List<TaskDto>> getAllTasksByProgram(
            @PathVariable String programId) {
        List<TaskDto> tasks = taskService.findAllTaskByProgramId(programId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/instances/{programId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER", "ROLE_CLIENT"})
    public ResponseEntity<List<TaskInstanceDto>> getAllTaskInstancesByProgramAndUser(
            @PathVariable String programId,
            @AuthenticationPrincipal Claims claims) {
        List<TaskInstanceDto> taskInstances = taskService.findAllTaskInstanceByProgramIdAndUserId(
                programId, claims.get("userId", String.class));
        return ResponseEntity.ok(taskInstances);
    }

    @PutMapping("/instances/notes/{taskInstanceId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    public ResponseEntity<TaskInstanceDto> updateTaskInstanceNotes(
            @PathVariable String taskInstanceId,
            @RequestBody UpdateTrainerNotesRequest updateTrainerNotesRequest,
            @AuthenticationPrincipal Claims claims) {
        return ResponseEntity.ok(taskService.updateTaskInstanceNotes(updateTrainerNotesRequest, taskInstanceId));
    }

    @GetMapping("/instances/{programId}/{userId}")
    @Secured({"ROLE_ADMIN", "ROLE_USER"})
    public ResponseEntity<List<TaskInstanceDto>> getAllTaskInstancesByProgramAndUser(
            @PathVariable String programId,
            @PathVariable String userId) {
        List<TaskInstanceDto> taskInstances = taskService.findAllTaskInstanceByProgramIdAndUserId(
                programId, userId);
        return ResponseEntity.ok(taskInstances);
    }

    @PostMapping
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<TaskDto>> createTask(
            @AuthenticationPrincipal Claims claims,
            @RequestBody TaskDto taskDto) {
        List<TaskDto> tasks = taskService.createTask(taskDto);
        logger.info("Task created successfully with ID: {}", taskDto.getId());
        return ResponseEntity.ok(tasks);
    }

    @PutMapping
    @Secured({"ROLE_ADMIN"})
    public ResponseEntity<List<TaskDto>> updateTask(
            @AuthenticationPrincipal Claims claims,
            @RequestBody TaskDto taskDto) {
        List<TaskDto> tasks = taskService.updateTask(taskDto);
        logger.info("Task updated successfully with ID: {}", taskDto.getId());
        return ResponseEntity.ok(tasks);
    }
}