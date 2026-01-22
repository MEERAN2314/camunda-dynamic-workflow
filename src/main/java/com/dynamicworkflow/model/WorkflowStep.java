package com.dynamicworkflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class WorkflowStep {
    
    @JsonProperty("stepId")
    private String stepId;
    
    @JsonProperty("stepName")
    private String stepName;
    
    @JsonProperty("stepOrder")
    private int stepOrder;
    
    @JsonProperty("description")
    private String description;
    
    @JsonProperty("fields")
    private List<FormField> fields;
    
    @JsonProperty("conditionalFields")
    private List<FormField> conditionalFields;
    
    // Constructors
    public WorkflowStep() {}
    
    // Getters and Setters
    public String getStepId() { return stepId; }
    public void setStepId(String stepId) { this.stepId = stepId; }
    
    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }
    
    public int getStepOrder() { return stepOrder; }
    public void setStepOrder(int stepOrder) { this.stepOrder = stepOrder; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public List<FormField> getFields() { return fields; }
    public void setFields(List<FormField> fields) { this.fields = fields; }
    
    public List<FormField> getConditionalFields() { return conditionalFields; }
    public void setConditionalFields(List<FormField> conditionalFields) { this.conditionalFields = conditionalFields; }
}