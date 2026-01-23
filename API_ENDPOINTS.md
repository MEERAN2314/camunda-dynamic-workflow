# Job Recruitment Workflow - API Endpoints

## Base URL
```
http://localhost:8082
```

## API Endpoints for Postman Testing

### 1. Health Check
**GET** `/api/job-applications/health`
- **Description**: Check if the service is running
- **Response**: 
```json
{
  "status": "UP",
  "service": "Job Application Workflow",
  "timestamp": 1642567890123
}
```

### 2. Get Workflow Definition
**GET** `/api/job-applications/workflow-definition`
- **Description**: Get the complete workflow JSON structure
- **Response**: Complete workflow definition with all steps and fields

### 3. Get Specific Step
**GET** `/api/job-applications/steps/{stepId}`
- **Description**: Get definition for a specific step
- **Path Parameters**: 
  - `stepId`: personal-info, job-preferences, experience-education
- **Example**: `/api/job-applications/steps/personal-info`

### 4. Start New Application
**POST** `/api/job-applications/start`
- **Description**: Start a new job application workflow
- **Request Body**: None (empty POST)
- **Response**:
```json
{
  "applicationId": "APP-1642567890123-A1B2C3D4",
  "processInstanceId": "process-1642567890123",
  "currentStep": "personal-info",
  "status": "STARTED",
  "message": "Application started successfully",
  "timestamp": "2025-01-22T10:30:00"
}
```

### 5. Submit Step Data
**POST** `/api/job-applications/{applicationId}/step`
- **Description**: Submit data for a workflow step
- **Path Parameters**: 
  - `applicationId`: The application ID from start response
- **Request Body Example** (Personal Info Step):
```json
{
  "currentStep": "personal-info",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobileNumber": "9876543210",
  "dateOfBirth": "1995-05-15",
  "gender": "male"
}
```
- **Request Body Example** (Job Preferences Step):
```json
{
  "currentStep": "job-preferences",
  "position": "software-engineer",
  "expectedSalaryCTC": 8.5,
  "noticePeriod": "1-month"
}
```
- **Request Body Example** (Experience & Education Step):
```json
{
  "currentStep": "experience-education",
  "totalExperience": 3,
  "highestEducation": "btech-be",
  "skills": ["java", "spring-boot", "javascript"]
}
```

### 6. Get Application Data
**GET** `/api/job-applications/{applicationId}`
- **Description**: Retrieve application data
- **Path Parameters**: 
  - `applicationId`: The application ID
- **Response**: Application data with current status

### 7. Get HR Summary
**GET** `/api/job-applications/{applicationId}/hr-summary`
- **Description**: Get formatted applicant summary for HR review
- **Path Parameters**: 
  - `applicationId`: The application ID
- **Response**: Formatted summary with all applicant details

### 8. Validate Step Data
**POST** `/api/job-applications/validate-step`
- **Description**: Validate step data without submitting
- **Request Body**:
```json
{
  "stepId": "personal-info",
  "stepData": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "9876543210"
  }
}
```
- **Response**:
```json
{
  "valid": true,
  "message": "Validation successful"
}
```

## Camunda Endpoints (Available after startup)

### Camunda Cockpit
- **URL**: `http://localhost:8082/camunda/app/cockpit/default/`
- **Username**: admin
- **Password**: admin

### Camunda Tasklist
- **URL**: `http://localhost:8082/camunda/app/tasklist/default/`
- **Username**: admin
- **Password**: admin

### Camunda Admin
- **URL**: `http://localhost:8082/camunda/app/admin/default/`
- **Username**: admin
- **Password**: admin

### H2 Database Console
- **URL**: `http://localhost:8082/h2-console`
- **JDBC URL**: `jdbc:h2:mem:camunda-db`
- **Username**: sa
- **Password**: (empty)

## Frontend Application
- **URL**: `http://localhost:8082/`
- **Description**: Complete workflow UI for job applications

## HR Dashboard
- **URL**: `http://localhost:8082/hr-dashboard.html`
- **Description**: HR interface to view and manage applications
- **Features**: View all applications, direct links to Camunda Tasklist for decision making

## Testing Workflow with Postman

### Complete Flow Test:

1. **Start Application**:
   ```
   POST http://localhost:8082/api/job-applications/start
   ```
   Save the `applicationId` from response.

2. **Submit Personal Info**:
   ```
   POST http://localhost:8082/api/job-applications/{applicationId}/step
   Content-Type: application/json
   
   {
     "currentStep": "personal-info",
     "firstName": "Rajesh",
     "lastName": "Kumar",
     "email": "rajesh.kumar@example.com",
     "mobileNumber": "9876543210",
     "dateOfBirth": "1990-03-15",
     "gender": "male"
   }
   ```

3. **Submit Job Preferences**:
   ```
   POST http://localhost:8082/api/job-applications/{applicationId}/step
   Content-Type: application/json
   
   {
     "currentStep": "job-preferences",
     "position": "software-engineer",
     "expectedSalaryCTC": 12,
     "noticePeriod": "2-months"
   }
   ```

4. **Submit Experience & Education** (Final Step):
   ```
   POST http://localhost:8082/api/job-applications/{applicationId}/step
   Content-Type: application/json
   
   {
     "currentStep": "experience-education",
     "totalExperience": 5,
     "highestEducation": "btech-be",
     "skills": ["java", "spring-boot", "javascript", "react"]
   }
   ```
   
   After this step, the application status becomes "PENDING_HR_REVIEW" and the BPMN process creates an HR task.

5. **HR Review Process**:
   - HR can view applications at: `http://localhost:8082/hr-dashboard.html`
   - HR reviews applications in Camunda Tasklist: `http://localhost:8082/camunda/app/tasklist/default/`
   - HR makes Accept/Reject decisions with comments
   - Process automatically handles acceptance or rejection workflows

## Error Responses

### Validation Error (400):
```json
{
  "applicationId": "APP-1642567890123-A1B2C3D4",
  "status": "VALIDATION_ERROR",
  "message": "First Name is required, Email format is invalid",
  "timestamp": "2025-01-22T10:30:00"
}
```

### Server Error (500):
```json
{
  "applicationId": "APP-1642567890123-A1B2C3D4",
  "status": "ERROR",
  "message": "Failed to submit step: Database connection error",
  "timestamp": "2025-01-22T10:30:00"
}
```

## HTTP Methods Used

- **GET**: Retrieve data (workflow definition, steps, application data, health check)
- **POST**: Create/Submit data (start application, submit steps, validate)
- **PUT**: Not used in this implementation
- **PATCH**: Not used in this implementation  
- **DELETE**: Not used in this implementation
- **HEAD**: Not used in this implementation
- **OPTIONS**: Automatically handled by Spring Boot CORS