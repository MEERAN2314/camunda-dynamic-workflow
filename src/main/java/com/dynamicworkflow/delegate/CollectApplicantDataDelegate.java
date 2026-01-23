package com.dynamicworkflow.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class CollectApplicantDataDelegate implements JavaDelegate {
    
    private static final Logger logger = LoggerFactory.getLogger(CollectApplicantDataDelegate.class);
    
    @Override
    public void execute(DelegateExecution execution) throws Exception {
        String applicationId = (String) execution.getVariable("applicationId");
        logger.info("Collecting applicant data for application: {}", applicationId);
        
        // Collect all form data from process variables
        Map<String, Object> applicantData = new HashMap<>();
        
        // Personal Information
        applicantData.put("firstName", execution.getVariable("firstName"));
        applicantData.put("lastName", execution.getVariable("lastName"));
        applicantData.put("email", execution.getVariable("email"));
        applicantData.put("mobileNumber", execution.getVariable("mobileNumber"));
        applicantData.put("dateOfBirth", execution.getVariable("dateOfBirth"));
        applicantData.put("gender", execution.getVariable("gender"));
        
        // Job Preferences
        applicantData.put("position", execution.getVariable("position"));
        applicantData.put("expectedSalaryCTC", execution.getVariable("expectedSalaryCTC"));
        applicantData.put("noticePeriod", execution.getVariable("noticePeriod"));
        
        // Experience & Education
        applicantData.put("totalExperience", execution.getVariable("totalExperience"));
        applicantData.put("highestEducation", execution.getVariable("highestEducation"));
        applicantData.put("skills", execution.getVariable("skills"));
        
        // Format data for HR display
        String applicantSummary = formatForHRReview(applicantData);
        
        // Set process variables for HR task
        execution.setVariable("applicantData", applicantData);
        execution.setVariable("applicantSummary", applicantSummary);
        execution.setVariable("dataCollectionTimestamp", LocalDateTime.now().toString());
        execution.setVariable("readyForHRReview", true);
        
        logger.info("Applicant data collected successfully for application: {}", applicationId);
        logger.debug("Collected data: {}", applicantData);
    }
    
    private String formatForHRReview(Map<String, Object> applicantData) {
        StringBuilder summary = new StringBuilder();
        
        summary.append("=== APPLICANT SUMMARY ===\n\n");
        
        // Personal Information
        summary.append("PERSONAL INFORMATION:\n");
        summary.append("Name: ").append(applicantData.get("firstName")).append(" ").append(applicantData.get("lastName")).append("\n");
        summary.append("Email: ").append(applicantData.get("email")).append("\n");
        summary.append("Mobile: ").append(applicantData.get("mobileNumber")).append("\n");
        summary.append("Date of Birth: ").append(applicantData.get("dateOfBirth")).append("\n");
        summary.append("Gender: ").append(applicantData.get("gender")).append("\n\n");
        
        // Job Preferences
        summary.append("JOB PREFERENCES:\n");
        summary.append("Position: ").append(getPositionLabel((String) applicantData.get("position"))).append("\n");
        summary.append("Expected CTC: ₹").append(applicantData.get("expectedSalaryCTC")).append(" LPA\n");
        summary.append("Notice Period: ").append(getNoticePeriodLabel((String) applicantData.get("noticePeriod"))).append("\n\n");
        
        // Experience & Education
        summary.append("EXPERIENCE & EDUCATION:\n");
        summary.append("Total Experience: ").append(formatExperience(applicantData.get("totalExperience"))).append("\n");
        summary.append("Highest Education: ").append(getEducationLabel((String) applicantData.get("highestEducation"))).append("\n");
        summary.append("Technical Skills: ").append(formatSkills(applicantData.get("skills"))).append("\n\n");
        
        summary.append("=== END SUMMARY ===");
        
        return summary.toString();
    }
    
    private String getPositionLabel(String position) {
        if (position == null) return "Not specified";
        switch (position) {
            case "software-engineer": return "Software Engineer";
            case "senior-software-engineer": return "Senior Software Engineer";
            case "tech-lead": return "Tech Lead";
            case "product-manager": return "Product Manager";
            default: return position;
        }
    }
    
    private String getNoticePeriodLabel(String noticePeriod) {
        if (noticePeriod == null) return "Not specified";
        switch (noticePeriod) {
            case "immediate": return "Immediate";
            case "15-days": return "15 Days";
            case "1-month": return "1 Month";
            case "2-months": return "2 Months";
            default: return noticePeriod;
        }
    }
    
    private String getEducationLabel(String education) {
        if (education == null) return "Not specified";
        switch (education) {
            case "btech-be": return "B.Tech/B.E";
            case "bca": return "BCA";
            case "mtech-me": return "M.Tech/M.E";
            case "mca": return "MCA";
            default: return education;
        }
    }
    
    private String formatExperience(Object experience) {
        if (experience == null) return "Not specified";
        int years = Integer.parseInt(experience.toString());
        if (years == 0) return "Fresher";
        if (years == 1) return "1 Year";
        return years + " Years";
    }
    
    @SuppressWarnings("unchecked")
    private String formatSkills(Object skills) {
        if (skills == null) return "Not specified";
        
        if (skills instanceof List) {
            List<String> skillList = (List<String>) skills;
            if (skillList.isEmpty()) return "Not specified";
            
            StringBuilder formattedSkills = new StringBuilder();
            for (int i = 0; i < skillList.size(); i++) {
                formattedSkills.append(getSkillLabel(skillList.get(i)));
                if (i < skillList.size() - 1) {
                    formattedSkills.append(", ");
                }
            }
            return formattedSkills.toString();
        }
        
        return skills.toString();
    }
    
    private String getSkillLabel(String skill) {
        if (skill == null) return "";
        switch (skill) {
            case "java": return "Java";
            case "python": return "Python";
            case "javascript": return "JavaScript";
            case "spring-boot": return "Spring Boot";
            default: return skill;
        }
    }
}