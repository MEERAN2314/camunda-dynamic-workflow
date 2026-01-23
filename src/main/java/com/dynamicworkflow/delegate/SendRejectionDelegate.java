package com.dynamicworkflow.delegate;

import com.dynamicworkflow.service.JobApplicationService;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class SendRejectionDelegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(SendRejectionDelegate.class);
    
    @Autowired
    private JobApplicationService jobApplicationService;
    
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String applicationId = (String) execution.getVariable("applicationId");
        String applicantEmail = (String) execution.getVariable("email");
        String applicantName = execution.getVariable("firstName") + " " + execution.getVariable("lastName");
        String hrComments = (String) execution.getVariable("hrComments");
        
        logger.info("Sending rejection notification for application: {} to {}", applicationId, applicantEmail);
        
        // In a real implementation, you would:
        // 1. Send email notification to applicant
        // 2. Update application status in database
        // 3. Log the rejection in audit trail
        // 4. Trigger any follow-up processes
        
        // For demo purposes, we'll simulate the email sending
        String rejectionMessage = buildRejectionMessage(applicantName, hrComments);
        
        // Set process variables
        execution.setVariable("applicationStatus", "REJECTED");
        execution.setVariable("rejectionTimestamp", LocalDateTime.now().toString());
        execution.setVariable("rejectionMessage", rejectionMessage);
        execution.setVariable("notificationSent", true);
        
        // Update our in-memory application store
        Map<String, Object> additionalData = new HashMap<>();
        additionalData.put("hrComments", hrComments);
        additionalData.put("rejectionTimestamp", LocalDateTime.now().toString());
        additionalData.put("rejectionMessage", rejectionMessage);
        additionalData.put("notificationSent", true);
        
        jobApplicationService.updateApplicationStatus(applicationId, "REJECTED", additionalData);
        
        // Simulate email sending (in real implementation, use email service)
        logger.info("Rejection notification sent to: {}", applicantEmail);
        logger.info("Rejection message: {}", rejectionMessage);
        
        logger.info("Application {} rejected and notification sent successfully", applicationId);
    }
    
    private String buildRejectionMessage(String applicantName, String hrComments) {
        StringBuilder message = new StringBuilder();
        
        message.append("Dear ").append(applicantName).append(",\n\n");
        message.append("Thank you for your interest in our company and for taking the time to apply for the position.\n\n");
        message.append("After careful consideration of your application, we regret to inform you that we will not be moving forward with your candidacy at this time.\n\n");
        
        if (hrComments != null && !hrComments.trim().isEmpty()) {
            message.append("Feedback from our HR team:\n");
            message.append(hrComments).append("\n\n");
        }
        
        message.append("We encourage you to apply for future opportunities that match your skills and experience.\n\n");
        message.append("We wish you the best of luck in your job search.\n\n");
        message.append("Best regards,\n");
        message.append("HR Team\n");
        message.append("Job Recruitment System");
        
        return message.toString();
    }
}