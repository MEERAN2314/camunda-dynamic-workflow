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
        
        // Get HR decision details
        String hrDecision = (String) execution.getVariable("hrDecision");
        String hrComments = (String) execution.getVariable("hrComments");
        Boolean interviewRequired = (Boolean) execution.getVariable("interviewRequired");
        
        // In a real implementation, you would:
        // 1. Save to database
        // 2. Generate application reference number
        // 3. Send acceptance email to applicant
        // 4. Trigger next steps in recruitment process (interview scheduling, etc.)
        // 5. Update application status to ACCEPTED
        // 6. Notify relevant teams
        
        // For demo purposes, we'll log the data and set acceptance status
        logger.info("Application data for {}: {}", applicationId, variables);
        logger.info("HR Decision: {}, Comments: {}, Interview Required: {}", hrDecision, hrComments, interviewRequired);
        
        execution.setVariable("applicationStatus", "ACCEPTED");
        execution.setVariable("acceptanceTimestamp", LocalDateTime.now());
        execution.setVariable("referenceNumber", "REF-" + System.currentTimeMillis());
        execution.setVariable("nextStep", interviewRequired ? "INTERVIEW_SCHEDULING" : "ONBOARDING_PROCESS");
        
        logger.info("Application {} accepted and stored successfully", applicationId);
    }
}