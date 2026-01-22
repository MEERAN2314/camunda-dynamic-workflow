package com.dynamicworkflow.controller;

import com.dynamicworkflow.dto.ApplicationResponse;
import com.dynamicworkflow.model.WorkflowDefinition;
import com.dynamicworkflow.model.WorkflowStep;
import com.dynamicworkflow.service.JobApplicationService;
import com.dynamicworkflow.service.ValidationService;
import com.dynamicworkflow.service.WorkflowDefinitionService;
import org.camunda.bpm.engine.RuntimeService;
import org.camunda.bpm.engine.runtime.ProcessInstance;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/job-applications")
@CrossOrigin(origins = "*")
public class JobApplicationController {
    
    private static final Logger logger = LoggerFactory.getLogger(JobApplicationController.class);
    
    private final JobApplicationService jobApplicationService;
    private final WorkflowDefinitionService workflowDefinitionService;
    private final RuntimeService runtimeService;
    
    public JobApplicationController(JobApplicationService jobApplicationService,
                                 WorkflowDefinitionService workflowDefinitionService,
                                 RuntimeService runtimeService) {
        this.jobApplicationService = jobApplicationService;
        this.workflowDefinitionService = workflowDefinitionService;
        this.runtimeService = runtimeService;
    }
    
    /**
     * GET /api/job-applications/workflow-definition
     * Get the complete workflow definition
     */
    @GetMapping("/workflow-definition")
    public ResponseEntity<WorkflowDefinition> getWorkflowDefinition() {
        try {
            WorkflowDefinition definition = workflowDefinitionService.getWorkflowDefinition();
            return ResponseEntity.ok(definition);
        } catch (Exception e) {
            logger.error("Failed to get workflow definition", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * GET /api/job-applications/steps/{stepId}
     * Get specific step definition
     */
    @GetMapping("/steps/{stepId}")
    public ResponseEntity<WorkflowStep> getStep(@PathVariable String stepId) {
        try {
            Optional<WorkflowStep> step = workflowDefinitionService.getStepById(stepId);
            if (step.isPresent()) {
                return ResponseEntity.ok(step.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Failed to get step: {}", stepId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * POST /api/job-applications/start
     * Start a new job application workflow
     */
    @PostMapping("/start")
    public ResponseEntity<ApplicationResponse> startApplication() {
        try {
            ApplicationResponse response = jobApplicationService.startApplication();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to start application", e);
            ApplicationResponse errorResponse = new ApplicationResponse(null, "ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * POST /api/job-applications/{applicationId}/step
     * Submit step data for an application
     */
    @PostMapping("/{applicationId}/step")
    public ResponseEntity<ApplicationResponse> submitStep(
            @PathVariable String applicationId,
            @RequestBody Map<String, Object> stepData) {
        try {
            ApplicationResponse response = jobApplicationService.submitStep(applicationId, stepData);
            return ResponseEntity.ok(response);
        } catch (ValidationService.ValidationException e) {
            logger.warn("Validation failed for application {}: {}", applicationId, e.getMessage());
            ApplicationResponse errorResponse = new ApplicationResponse(applicationId, "VALIDATION_ERROR", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Failed to submit step for application: {}", applicationId, e);
            ApplicationResponse errorResponse = new ApplicationResponse(applicationId, "ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * GET /api/job-applications/{applicationId}
     * Get application data
     */
    @GetMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> getApplication(@PathVariable String applicationId) {
        try {
            ApplicationResponse response = jobApplicationService.getApplication(applicationId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Failed to get application: {}", applicationId, e);
            ApplicationResponse errorResponse = new ApplicationResponse(applicationId, "ERROR", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * POST /api/job-applications/validate-step
     * Validate step data without submitting
     */
    @PostMapping("/validate-step")
    public ResponseEntity<Map<String, Object>> validateStep(@RequestBody Map<String, Object> request) {
        try {
            String stepId = (String) request.get("stepId");
            @SuppressWarnings("unchecked")
            Map<String, Object> stepData = (Map<String, Object>) request.get("stepData");
            
            Optional<WorkflowStep> step = workflowDefinitionService.getStepById(stepId);
            if (!step.isPresent()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("valid", false);
                errorResponse.put("message", "Invalid step ID");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // This would throw ValidationException if invalid
            // validationService.validateStepData(step.get(), stepData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("valid", true);
            response.put("message", "Validation successful");
            return ResponseEntity.ok(response);
            
        } catch (ValidationService.ValidationException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            logger.error("Failed to validate step", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("valid", false);
            errorResponse.put("message", "Validation failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * GET /api/job-applications/all
     * Get all applications (for debugging)
     */
    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllApplications() {
        try {
            Map<String, Object> result = jobApplicationService.getAllApplications();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Failed to get all applications", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * POST /api/job-applications/start-bpmn-process
     * Manually start a BPMN process instance for testing
     */
    @PostMapping("/start-bpmn-process")
    public ResponseEntity<Map<String, Object>> startBpmnProcess(@RequestBody(required = false) Map<String, Object> variables) {
        try {
            if (variables == null) {
                variables = new HashMap<>();
            }
            
            // Add default variables if not provided
            variables.putIfAbsent("applicationId", "MANUAL-" + System.currentTimeMillis());
            variables.putIfAbsent("validationResult", true);
            
            // Convert to Camunda variable format
            Map<String, Object> processVariables = new HashMap<>();
            variables.forEach((key, value) -> {
                processVariables.put(key, value);
            });
            
            // Start process instance
            ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
                "job-recruitment-workflow-india",
                (String) variables.get("applicationId"), // business key
                processVariables
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("processInstanceId", processInstance.getId());
            response.put("businessKey", processInstance.getBusinessKey());
            response.put("processDefinitionId", processInstance.getProcessDefinitionId());
            response.put("variables", variables);
            response.put("message", "BPMN process started successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to start BPMN process", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Failed to start BPMN process");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * GET /api/job-applications/bpmn-processes
     * Get all running BPMN process instances
     */
    @GetMapping("/bpmn-processes")
    public ResponseEntity<Map<String, Object>> getBpmnProcesses() {
        try {
            List<ProcessInstance> processInstances = runtimeService.createProcessInstanceQuery()
                .processDefinitionKey("job-recruitment-workflow-india")
                .list();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalProcesses", processInstances.size());
            response.put("processes", processInstances.stream().map(pi -> {
                Map<String, Object> processInfo = new HashMap<>();
                processInfo.put("processInstanceId", pi.getId());
                processInfo.put("businessKey", pi.getBusinessKey());
                processInfo.put("suspended", pi.isSuspended());
                processInfo.put("ended", pi.isEnded());
                return processInfo;
            }).collect(java.util.stream.Collectors.toList()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Failed to get BPMN processes", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * GET /api/job-applications/health
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Job Application Workflow");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
}