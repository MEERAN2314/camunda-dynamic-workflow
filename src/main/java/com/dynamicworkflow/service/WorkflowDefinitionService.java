package com.dynamicworkflow.service;

import com.dynamicworkflow.model.WorkflowDefinition;
import com.dynamicworkflow.model.WorkflowStep;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.util.Optional;

@Service
public class WorkflowDefinitionService {
    
    private static final Logger logger = LoggerFactory.getLogger(WorkflowDefinitionService.class);
    
    private final ResourceLoader resourceLoader;
    private final ObjectMapper objectMapper;
    
    @Value("${workflow.json-path}")
    private String workflowJsonPath;
    
    private WorkflowDefinition workflowDefinition;
    
    public WorkflowDefinitionService(ResourceLoader resourceLoader, ObjectMapper objectMapper) {
        this.resourceLoader = resourceLoader;
        this.objectMapper = objectMapper;
    }
    
    @PostConstruct
    public void loadWorkflowDefinition() {
        try {
            Resource resource = resourceLoader.getResource(workflowJsonPath);
            workflowDefinition = objectMapper.readValue(resource.getInputStream(), WorkflowDefinition.class);
            logger.info("Workflow definition loaded successfully: {}", workflowDefinition.getWorkflowName());
        } catch (IOException e) {
            logger.error("Failed to load workflow definition from: {}", workflowJsonPath, e);
            throw new RuntimeException("Failed to load workflow definition", e);
        }
    }
    
    public WorkflowDefinition getWorkflowDefinition() {
        return workflowDefinition;
    }
    
    public Optional<WorkflowStep> getStepById(String stepId) {
        return workflowDefinition.getSteps().stream()
                .filter(step -> step.getStepId().equals(stepId))
                .findFirst();
    }
    
    public Optional<WorkflowStep> getStepByOrder(int stepOrder) {
        return workflowDefinition.getSteps().stream()
                .filter(step -> step.getStepOrder() == stepOrder)
                .findFirst();
    }
    
    public Optional<WorkflowStep> getNextStep(String currentStepId) {
        Optional<WorkflowStep> currentStep = getStepById(currentStepId);
        if (currentStep.isPresent()) {
            int nextOrder = currentStep.get().getStepOrder() + 1;
            return getStepByOrder(nextOrder);
        }
        return Optional.empty();
    }
    
    public Optional<WorkflowStep> getPreviousStep(String currentStepId) {
        Optional<WorkflowStep> currentStep = getStepById(currentStepId);
        if (currentStep.isPresent()) {
            int prevOrder = currentStep.get().getStepOrder() - 1;
            if (prevOrder > 0) {
                return getStepByOrder(prevOrder);
            }
        }
        return Optional.empty();
    }
    
    public boolean isLastStep(String stepId) {
        Optional<WorkflowStep> step = getStepById(stepId);
        if (step.isPresent()) {
            return step.get().getStepOrder() == workflowDefinition.getSteps().size();
        }
        return false;
    }
    
    public boolean isFirstStep(String stepId) {
        Optional<WorkflowStep> step = getStepById(stepId);
        return step.isPresent() && step.get().getStepOrder() == 1;
    }
}