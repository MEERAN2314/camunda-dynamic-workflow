package com.dynamicworkflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class FormField {
    
    @JsonProperty("fieldId")
    private String fieldId;
    
    @JsonProperty("fieldName")
    private String fieldName;
    
    @JsonProperty("fieldType")
    private String fieldType;
    
    @JsonProperty("required")
    private boolean required;
    
    @JsonProperty("validation")
    private Map<String, Object> validation;
    
    @JsonProperty("placeholder")
    private String placeholder;
    
    @JsonProperty("options")
    private List<FieldOption> options;
    
    @JsonProperty("condition")
    private Map<String, Object> condition;
    
    // Constructors
    public FormField() {}
    
    // Getters and Setters
    public String getFieldId() { return fieldId; }
    public void setFieldId(String fieldId) { this.fieldId = fieldId; }
    
    public String getFieldName() { return fieldName; }
    public void setFieldName(String fieldName) { this.fieldName = fieldName; }
    
    public String getFieldType() { return fieldType; }
    public void setFieldType(String fieldType) { this.fieldType = fieldType; }
    
    public boolean isRequired() { return required; }
    public void setRequired(boolean required) { this.required = required; }
    
    public Map<String, Object> getValidation() { return validation; }
    public void setValidation(Map<String, Object> validation) { this.validation = validation; }
    
    public String getPlaceholder() { return placeholder; }
    public void setPlaceholder(String placeholder) { this.placeholder = placeholder; }
    
    public List<FieldOption> getOptions() { return options; }
    public void setOptions(List<FieldOption> options) { this.options = options; }
    
    public Map<String, Object> getCondition() { return condition; }
    public void setCondition(Map<String, Object> condition) { this.condition = condition; }
    
    public static class FieldOption {
        @JsonProperty("value")
        private String value;
        
        @JsonProperty("label")
        private String label;
        
        public FieldOption() {}
        
        public String getValue() { return value; }
        public void setValue(String value) { this.value = value; }
        
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }
}