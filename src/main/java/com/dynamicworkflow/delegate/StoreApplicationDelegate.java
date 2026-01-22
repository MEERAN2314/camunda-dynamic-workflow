package com.dynamicworkflow.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Component
public class StoreApplicationDelegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(StoreApplicationDelegate.class);
    
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String applicationId = (String) execution.getVariable("applicationId");
        logger.info("Storing application: {}", applicationId);
        
        // Get all process variables (form data)
        Map<String, Object> variables = execution.getVariables();
        
        // In a real implementation, you would:
        // 1. Save to database
        // 2. Generate application reference number
        // 3. Send confirmation email
        // 4. Trigger next steps in recruitment process
        // 5. Update application status
        
        // For demo purposes, we'll just log the data and set completion status
        logger.info("Application data for {}: {}", applicationId, variables);
        
        execution.setVariable("applicationStatus", "COMPLETED");
        execution.setVariable("completionTimestamp", LocalDateTime.now());
        execution.setVariable("referenceNumber", "REF-" + System.currentTimeMillis());
        
        logger.info("Application {} stored successfully", applicationId);
    }
}