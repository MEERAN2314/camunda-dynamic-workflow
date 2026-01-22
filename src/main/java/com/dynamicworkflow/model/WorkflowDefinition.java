package com.dynamicworkflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class WorkflowDefinition {
    
    @JsonProperty("workflowId")
    private String workflowId;
    
    @JsonProperty("workflowName")
    private String workflowName;
    
    @JsonProperty("version")
    private String version;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("steps")
    private List<WorkflowStep> steps;
    
    @JsonProperty("validationRules")
    private ValidationRules validationRules;
    
    @JsonProperty("workflowSettings")
    private WorkflowSettings workflowSettings;
    
    // Constructors
    public WorkflowDefinition() {}
    
    // Getters and Setters
    public String getWorkflowId() { return workflowId; }
    public void setWorkflowId(String workflowId) { this.workflowId = workflowId; }
    
    public String getWorkflowName() { return workflowName; }
    public void setWorkflowName(String workflowName) { this.workflowName = workflowName; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public List<WorkflowStep> getSteps() { return steps; }
    public void setSteps(List<WorkflowStep> steps) { this.steps = steps; }
    
    public ValidationRules getValidationRules() { return validationRules; }
    public void setValidationRules(ValidationRules validationRules) { this.validationRules = validationRules; }
    
    public WorkflowSettings getWorkflowSettings() { return workflowSettings; }
    public void setWorkflowSettings(WorkflowSettings workflowSettings) { this.workflowSettings = workflowSettings; }
    
    public static class ValidationRules {
        @JsonProperty("crossFieldValidation")
        private List<Map<String, Object>> crossFieldValidation;
        
        public List<Map<String, Object>> getCrossFieldValidation() { return crossFieldValidation; }
        public void setCrossFieldValidation(List<Map<String, Object>> crossFieldValidation) { 
            this.crossFieldValidation = crossFieldValidation; 
        }
    }
    
    public static class WorkflowSettings {
        @JsonProperty("allowBackNavigation")
        private boolean allowBackNavigation;
        
        @JsonProperty("saveProgressEnabled")
        private boolean saveProgressEnabled;
        
        @JsonProperty("sessionTimeout")
        private int sessionTimeout;
        
        @JsonProperty("submitEndpoint")
        private String submitEndpoint;
        
        @JsonProperty("validationEndpoint")
        private String validationEndpoint;
        
        // Getters and Setters
        public boolean isAllowBackNavigation() { return allowBackNavigation; }
        public void setAllowBackNavigation(boolean allowBackNavigation) { this.allowBackNavigation = allowBackNavigation; }
        
        public boolean isSaveProgressEnabled() { return saveProgressEnabled; }
        public void setSaveProgressEnabled(boolean saveProgressEnabled) { this.saveProgressEnabled = saveProgressEnabled; }
        
        public int getSessionTimeout() { return sessionTimeout; }
        public void setSessionTimeout(int sessionTimeout) { this.sessionTimeout = sessionTimeout; }
        
        public String getSubmitEndpoint() { return submitEndpoint; }
        public void setSubmitEndpoint(String submitEndpoint) { this.submitEndpoint = submitEndpoint; }
        
        public String getValidationEndpoint() { return validationEndpoint; }
        public void setValidationEndpoint(String validationEndpoint) { this.validationEndpoint = validationEndpoint; }
    }
}