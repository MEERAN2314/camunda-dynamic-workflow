package com.dynamicworkflow.service;

import com.dynamicworkflow.dto.ApplicationResponse;
import com.dynamicworkflow.model.WorkflowStep;
import org.camunda.bpm.engine.ProcessEngine;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.TaskService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.camunda.bpm.engine.task.Task;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JobApplicationService {
    
    private static final Logger logger = LoggerFactory.getLogger(JobApplicationService.class);
    
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final WorkflowDefinitionService workflowDefinitionService;
    private final ValidationService validationService;
    
    // In-memory storage for application data
    private final Map<String, Map<String, Object>> applicationDataStore = new ConcurrentHashMap<>();
    private final Map<String, String> applicationStatusStore = new ConcurrentHashMap<>();
    
    public JobApplicationService(ProcessEngine processEngine, 
                               WorkflowDefinitionService workflowDefinitionService,
                               ValidationService validationService) {
        this.runtimeService = processEngine.getRuntimeService();
        this.taskService = processEngine.getTaskService();
        this.workflowDefinitionService = workflowDefinitionService;
        this.validationService = validationService;
    }
    
    public ApplicationResponse startApplication() {
        try {
            // Generate unique application ID
            String applicationId = generateApplicationId();
            
            // Get first step
            Optional<WorkflowStep> firstStep = workflowDefinitionService.getStepByOrder(1);
            if (!firstStep.isPresent()) {
                throw new RuntimeException("No first step found in workflow definition");
            }
            
            // Initialize application data storage
            Map<String, Object> applicationData = new HashMap<>();
            applicationData.put("applicationId", applicationId);
            applicationData.put("applicationStatus", "STARTED");
            applicationData.put("submissionTimestamp", LocalDateTime.now().toString());
            applicationData.put("currentStep", firstStep.get().getStepId());
            applicationData.put("lastUpdatedTimestamp", LocalDateTime.now().toString());
            
            // Store in memory
            applicationDataStore.put(applicationId, applicationData);
            applicationStatusStore.put(applicationId, "STARTED");
            
            // Start BPMN Process Instance
            try {
                Map<String, Object> processVariables = new HashMap<>();
                processVariables.put("applicationId", applicationId);
                processVariables.put("applicationStatus", "STARTED");
                processVariables.put("validationResult", true); // Default to true for demo
                
                ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
                    "job-recruitment-workflow-india", 
                    applicationId, // Use applicationId as business key
                    processVariables
                );
                
                logger.info("Started BPMN process instance: {} for application: {}", 
                           processInstance.getId(), applicationId);
                
                // Store process instance ID
                applicationData.put("processInstanceId", processInstance.getId());
                applicationDataStore.put(applicationId, applicationData);
                
            } catch (Exception e) {
                logger.warn("Failed to start BPMN process for application {}: {}", applicationId, e.getMessage());
                // Continue without BPMN process - the application will still work
            }
            
            ApplicationResponse response = new ApplicationResponse();
            response.setApplicationId(applicationId);
            response.setProcessInstanceId("process-" + System.currentTimeMillis());
            response.setCurrentStep(firstStep.get().getStepId());
            response.setStatus("STARTED");
            response.setMessage("Application started successfully");
            response.setTimestamp(LocalDateTime.now());
            
            logger.info("Started new application: {}", applicationId);
            return response;
            
        } catch (Exception e) {
            logger.error("Failed to start application", e);
            throw new RuntimeException("Failed to start application: " + e.getMessage());
        }
    }
    
    public ApplicationResponse submitStep(String applicationId, Map<String, Object> stepData) {
        try {
            String currentStepId = (String) stepData.get("currentStep");
            logger.info("Submitting step {} for application {}", currentStepId, applicationId);
            logger.info("Step data received: {}", stepData);
            
            // Validate step data
            Optional<WorkflowStep> currentStep = workflowDefinitionService.getStepById(currentStepId);
            if (!currentStep.isPresent()) {
                throw new RuntimeException("Invalid step ID: " + currentStepId);
            }

            // Perform validation
            validationService.validateStepData(currentStep.get(), stepData);
            
            // Get existing application data
            Map<String, Object> applicationData = applicationDataStore.getOrDefault(applicationId, new HashMap<>());
            logger.info("Existing application data: {}", applicationData);
            
            // Merge step data into application data (excluding control fields)
            stepData.entrySet().stream()
                .filter(entry -> !entry.getKey().equals("currentStep"))
                .forEach(entry -> applicationData.put(entry.getKey(), entry.getValue()));
            
            // Update metadata
            applicationData.put("lastUpdatedTimestamp", LocalDateTime.now().toString());
            applicationData.put("lastCompletedStep", currentStepId);
            
            // Determine next step
            String nextStepId = null;
            String status = "IN_PROGRESS";
            
            if (workflowDefinitionService.isLastStep(currentStepId)) {
                status = "COMPLETED";
                nextStepId = null;
                applicationData.put("completionTimestamp", LocalDateTime.now().toString());
                applicationData.put("applicationStatus", "COMPLETED");
                applicationStatusStore.put(applicationId, "COMPLETED");
                logger.info("Application {} completed", applicationId);
            } else {
                Optional<WorkflowStep> nextStep = workflowDefinitionService.getNextStep(currentStepId);
                if (nextStep.isPresent()) {
                    nextStepId = nextStep.get().getStepId();
                }
                applicationData.put("currentStep", nextStepId);
                applicationStatusStore.put(applicationId, "IN_PROGRESS");
                logger.info("Application {} moving to next step: {}", applicationId, nextStepId);
            }
            
            // Store updated data
            applicationDataStore.put(applicationId, applicationData);
            logger.info("Updated application data: {}", applicationData);
            
            // Update BPMN Process if exists
            try {
                String processInstanceId = (String) applicationData.get("processInstanceId");
                if (processInstanceId != null) {
                    // Find and complete current user task
                    Task currentTask = taskService.createTaskQuery()
                        .processInstanceId(processInstanceId)
                        .active()
                        .singleResult();
                    
                    if (currentTask != null) {
                        // Set task variables and complete
                        Map<String, Object> taskVariables = new HashMap<>(stepData);
                        taskVariables.put("stepCompleted", currentStepId);
                        taskVariables.put("validationResult", true);
                        
                        taskService.complete(currentTask.getId(), taskVariables);
                        logger.info("Completed BPMN task: {} for application: {}", currentTask.getId(), applicationId);
                    } else {
                        logger.warn("No active BPMN task found for process instance: {}", processInstanceId);
                    }
                } else {
                    logger.warn("No process instance ID found for application: {}", applicationId);
                }
            } catch (Exception e) {
                logger.warn("Failed to update BPMN process for application {}: {}", applicationId, e.getMessage());
                // Continue without BPMN update - the application will still work
            }
            
            ApplicationResponse response = new ApplicationResponse();
            response.setApplicationId(applicationId);
            response.setCurrentStep(nextStepId);
            response.setStatus(status);
            response.setMessage("Step submitted successfully");
            response.setTimestamp(LocalDateTime.now());
            
            // Add step data to response for confirmation
            Map<String, Object> responseData = new HashMap<>(stepData);
            responseData.put("nextStep", nextStepId);
            response.setData(responseData);
            
            logger.info("Step submitted successfully for application {}: {} -> {}", applicationId, currentStepId, nextStepId);
            
            return response;
            
        } catch (Exception e) {
            logger.error("Failed to submit step for application: {}", applicationId, e);
            throw new RuntimeException("Failed to submit step: " + e.getMessage());
        }
    }
    
    public ApplicationResponse getApplication(String applicationId) {
        try {
            // Get stored application data
            Map<String, Object> applicationData = applicationDataStore.get(applicationId);
            
            if (applicationData == null) {
                throw new RuntimeException("Application not found: " + applicationId);
            }
            
            String status = applicationStatusStore.getOrDefault(applicationId, "UNKNOWN");
            
            ApplicationResponse response = new ApplicationResponse();
            response.setApplicationId(applicationId);
            response.setStatus(status);
            response.setCurrentStep((String) applicationData.get("currentStep"));
            response.setMessage("Application retrieved successfully");
            response.setTimestamp(LocalDateTime.now());
            
            // Return the actual stored data
            response.setData(applicationData);
            
            logger.info("Retrieved application {}: status={}, dataSize={}", 
                       applicationId, status, applicationData.size());
            
            return response;
            
        } catch (Exception e) {
            logger.error("Failed to retrieve application: {}", applicationId, e);
            throw new RuntimeException("Failed to retrieve application: " + e.getMessage());
        }
    }
    
    // Add method to get all applications for debugging
    public Map<String, Object> getAllApplications() {
        Map<String, Object> result = new HashMap<>();
        result.put("totalApplications", applicationDataStore.size());
        result.put("applications", applicationDataStore);
        result.put("statuses", applicationStatusStore);
        return result;
    }
    
    private String generateApplicationId() {
        return "APP-" + System.currentTimeMillis() + "-" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}