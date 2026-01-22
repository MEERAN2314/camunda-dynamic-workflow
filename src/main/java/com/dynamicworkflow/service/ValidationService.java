package com.dynamicworkflow.service;

import com.dynamicworkflow.model.FormField;
import com.dynamicworkflow.model.WorkflowStep;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class ValidationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ValidationService.class);
    
    public void validateStepData(WorkflowStep step, Map<String, Object> stepData) {
        List<String> errors = new ArrayList<>();
        
        // Validate regular fields
        if (step.getFields() != null) {
            for (FormField field : step.getFields()) {
                validateField(field, stepData, errors);
            }
        }
        
        // Validate conditional fields
        if (step.getConditionalFields() != null) {
            for (FormField field : step.getConditionalFields()) {
                if (shouldValidateConditionalField(field, stepData)) {
                    validateField(field, stepData, errors);
                }
            }
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join(", ", errors));
        }
    }
    
    private void validateField(FormField field, Map<String, Object> stepData, List<String> errors) {
        String fieldId = field.getFieldId();
        Object value = stepData.get(fieldId);
        
        // Check required fields
        if (field.isRequired() && (value == null || value.toString().trim().isEmpty())) {
            errors.add(field.getFieldName() + " is required");
            return;
        }
        
        // Skip validation if field is empty and not required
        if (value == null || value.toString().trim().isEmpty()) {
            return;
        }
        
        String stringValue = value.toString().trim();
        
        // Validate based on field type and validation rules
        if (field.getValidation() != null) {
            Map<String, Object> validation = field.getValidation();
            
            // Pattern validation
            if (validation.containsKey("pattern")) {
                String pattern = validation.get("pattern").toString();
                if (!Pattern.matches(pattern, stringValue)) {
                    errors.add(field.getFieldName() + " format is invalid");
                }
            }
            
            // Length validation
            if (validation.containsKey("minLength")) {
                int minLength = Integer.parseInt(validation.get("minLength").toString());
                if (stringValue.length() < minLength) {
                    errors.add(field.getFieldName() + " must be at least " + minLength + " characters");
                }
            }
            
            if (validation.containsKey("maxLength")) {
                int maxLength = Integer.parseInt(validation.get("maxLength").toString());
                if (stringValue.length() > maxLength) {
                    errors.add(field.getFieldName() + " must not exceed " + maxLength + " characters");
                }
            }
            
            // Numeric validation
            if (field.getFieldType().equals("number")) {
                try {
                    double numValue = Double.parseDouble(stringValue);
                    
                    if (validation.containsKey("min")) {
                        double min = Double.parseDouble(validation.get("min").toString());
                        if (numValue < min) {
                            errors.add(field.getFieldName() + " must be at least " + min);
                        }
                    }
                    
                    if (validation.containsKey("max")) {
                        double max = Double.parseDouble(validation.get("max").toString());
                        if (numValue > max) {
                            errors.add(field.getFieldName() + " must not exceed " + max);
                        }
                    }
                } catch (NumberFormatException e) {
                    errors.add(field.getFieldName() + " must be a valid number");
                }
            }
        }
    }
    
    private boolean shouldValidateConditionalField(FormField field, Map<String, Object> stepData) {
        if (field.getCondition() == null) {
            return true;
        }
        
        Map<String, Object> condition = field.getCondition();
        String dependsOn = (String) condition.get("dependsOn");
        String operator = (String) condition.get("operator");
        Object expectedValue = condition.get("value");
        
        Object actualValue = stepData.get(dependsOn);
        
        if (operator == null || operator.equals("==")) {
            return expectedValue != null && expectedValue.equals(actualValue);
        } else if (operator.equals("!=")) {
            return expectedValue == null || !expectedValue.equals(actualValue);
        } else if (operator.equals(">=")) {
            try {
                double actual = Double.parseDouble(actualValue.toString());
                double expected = Double.parseDouble(expectedValue.toString());
                return actual >= expected;
            } catch (Exception e) {
                return false;
            }
        }
        
        return true;
    }
    
    public static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }
}