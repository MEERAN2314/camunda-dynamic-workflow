package com.dynamicworkflow.dto;

import java.time.LocalDateTime;
import java.util.Map;

public class ApplicationResponse {
    
    private String applicationId;
    private String processInstanceId;
    private String currentStep;
    private String status;
    private LocalDateTime timestamp;
    private Map<String, Object> data;
    private String message;
    
    // Constructors
    public ApplicationResponse() {}
    
    public ApplicationResponse(String applicationId, String status, String message) {
        this.applicationId = applicationId;
        this.status = status;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }
    
    // Getters and Setters
    public String getApplicationId() { return applicationId; }
    public void setApplicationId(String applicationId) { this.applicationId = applicationId; }
    
    public String getProcessInstanceId() { return processInstanceId; }
    public void setProcessInstanceId(String processInstanceId) { this.processInstanceId = processInstanceId; }
    
    public String getCurrentStep() { return currentStep; }
    public void setCurrentStep(String currentStep) { this.currentStep = currentStep; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    
    public Map<String, Object> getData() { return data; }
    public void setData(Map<String, Object> data) { this.data = data; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}