# Technical Implementation Guide - Spring Boot + Camunda BPM

## Table of Contents
1. [Project Overview](#project-overview)
2. [Maven and Build System](#maven-and-build-system)
3. [Camunda Platform Integration](#camunda-platform-integration)
4. [Spring Boot Architecture](#spring-boot-architecture)
5. [BPMN File Deployment](#bpmn-file-deployment)
6. [Controller Layer](#controller-layer)
7. [Service Layer](#service-layer)
8. [Frontend-Backend Connection](#frontend-backend-connection)
9. [Process Variables and Data Flow](#process-variables-and-data-flow)
10. [Running Everything Together](#running-everything-together)

---

## 1. Project Overview

### What is This Project?

This is a **Spring Boot application** that embeds **Camunda BPM** as a process engine to manage a multi-level job recruitment workflow.

**Key Components:**
- **Spring Boot 2.6.15** - Application framework
- **Camunda BPM 7.18.0** - Workflow engine
- **H2 Database** - In-memory database
- **Maven** - Build and dependency management
- **Embedded Tomcat** - Web server (comes with Spring Boot)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Spring Boot Application               │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Embedded Tomcat Server                │  │
│  │                  (Port 8082)                       │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Controllers  │  │  Services    │  │   Models     │  │
│  │ (REST API)   │→ │ (Business    │→ │   (Data)     │  │
│  │              │  │  Logic)      │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Camunda BPM Engine (Embedded)           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │ Process     │  │ Task        │  │ History  │  │  │
│  │  │ Engine      │  │ Service     │  │ Service  │  │  │
│  │  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              H2 Database (In-Memory)              │  │
│  │  - Application Data                               │  │
│  │  - Camunda Process Data                           │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │           Static Resources (Frontend)             │  │
│  │  - HTML, CSS, JavaScript                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Maven and Build System

### What is Maven?

**Maven** is a build automation and dependency management tool for Java projects.

### Why We Use `pom.xml`

The `pom.xml` (Project Object Model) file is the heart of a Maven project. It defines:

1. **Project Information**
   - Group ID, Artifact ID, Version
   - Project name and description

2. **Dependencies**
   - External libraries your project needs
   - Maven automatically downloads them

3. **Build Configuration**
   - How to compile the code
   - What plugins to use
   - How to package the application

4. **Parent Project**
   - Inherits configuration from Spring Boot parent

### Key Sections in Our `pom.xml`


```xml
<!-- Parent: Inherits Spring Boot configuration -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.6.15</version>
</parent>

<!-- Project Identity -->
<groupId>com.dynamicworkflow</groupId>
<artifactId>job-recruitment-workflow</artifactId>
<version>0.0.1-SNAPSHOT</version>

<!-- Properties: Define versions -->
<properties>
    <java.version>11</java.version>
    <camunda.version>7.18.0</camunda.version>
</properties>

<!-- Dependencies: Libraries we need -->
<dependencies>
    <!-- Spring Boot Web: REST API, Tomcat -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Camunda BPM: Process Engine -->
    <dependency>
        <groupId>org.camunda.bpm.springboot</groupId>
        <artifactId>camunda-bpm-spring-boot-starter</artifactId>
        <version>7.18.0</version>
    </dependency>
    
    <!-- Camunda Webapp: Cockpit, Tasklist, Admin -->
    <dependency>
        <groupId>org.camunda.bpm.springboot</groupId>
        <artifactId>camunda-bpm-spring-boot-starter-webapp</artifactId>
        <version>7.18.0</version>
    </dependency>
    
    <!-- H2 Database: In-memory database -->
    <dependency>
        <groupId>com.h2database</groupId>
        <artifactId>h2</artifactId>
    </dependency>
</dependencies>
```

### Maven Commands Explained

#### `mvn clean install`

**What it does:**
1. **clean** - Deletes the `target/` folder (removes old compiled files)
2. **install** - Compiles code, runs tests, packages into JAR, installs to local Maven repository

**Why we use it:**
- Ensures a fresh build
- Catches compilation errors
- Runs all tests
- Creates the JAR file

**Output:**
```
target/
└── job-recruitment-workflow-0.0.1-SNAPSHOT.jar
```

#### `mvn spring-boot:run`

**What it does:**
- Compiles the code (if needed)
- Starts the Spring Boot application
- Runs the embedded Tomcat server
- Deploys BPMN files to Camunda
- Makes the application available at http://localhost:8082

**Why we use it:**
- Quick development cycle
- No need to manually create JAR and run it
- Automatic restart on code changes (with spring-boot-devtools)

---

## 3. Camunda Platform Integration

### What is Camunda BPM?

**Camunda BPM** is a workflow and decision automation platform that:
- Executes BPMN 2.0 workflows
- Manages human tasks
- Tracks process instances
- Provides web applications (Cockpit, Tasklist, Admin)

### Camunda Version: 7.18.0

We're using **Camunda BPM 7.18.0** (released in 2022).

**Why this version?**
- Stable and well-tested
- Compatible with Spring Boot 2.6.15
- Has all features we need (parallel gateway, user tasks, service tasks)
- Good documentation and community support

### How Camunda is Embedded in Spring Boot

#### Step 1: Add Camunda Dependencies

In `pom.xml`:
```xml
<!-- Core Camunda Engine -->
<dependency>
    <groupId>org.camunda.bpm.springboot</groupId>
    <artifactId>camunda-bpm-spring-boot-starter</artifactId>
    <version>7.18.0</version>
</dependency>

<!-- Camunda Web Applications -->
<dependency>
    <groupId>org.camunda.bpm.springboot</groupId>
    <artifactId>camunda-bpm-spring-boot-starter-webapp</artifactId>
    <version>7.18.0</version>
</dependency>

<!-- Camunda REST API -->
<dependency>
    <groupId>org.camunda.bpm.springboot</groupId>
    <artifactId>camunda-bpm-spring-boot-starter-rest</artifactId>
    <version>7.18.0</version>
</dependency>
```

#### Step 2: Configure Camunda in `application.yml`

```yaml
camunda:
  bpm:
    # Admin user for Camunda web apps
    admin-user:
      id: admin
      password: admin
      firstName: Admin
      lastName: User
    
    # Database schema management
    database:
      schema-update: true  # Auto-create tables
    
    # Job execution (async tasks)
    job-execution:
      enabled: true
    
    # History level (how much to track)
    history-level: full  # Track everything
    
    # Authorization
    authorization:
      enabled: false  # Disabled for simplicity
```

#### Step 3: Spring Boot Auto-Configuration

When Spring Boot starts, it:
1. Detects Camunda dependencies
2. Auto-configures Camunda Process Engine
3. Creates database tables (H2)
4. Deploys BPMN files from `src/main/resources/processes/`
5. Starts Camunda web applications

**This happens automatically!** No manual configuration needed.

### Camunda Components Available

Once embedded, you get:

1. **Process Engine** - Core workflow engine
2. **RuntimeService** - Start processes, manage variables
3. **TaskService** - Complete tasks, assign users
4. **HistoryService** - Query completed processes
5. **RepositoryService** - Deploy and manage BPMN files
6. **Web Applications**:
   - Cockpit: http://localhost:8082/camunda/app/cockpit/default/
   - Tasklist: http://localhost:8082/camunda/app/tasklist/default/
   - Admin: http://localhost:8082/camunda/app/admin/default/

---

## 4. BPMN File Deployment

### How BPMN Files are Deployed Automatically

#### The Magic of Spring Boot Auto-Deployment

**Location:** `src/main/resources/processes/`

**What happens:**
1. Spring Boot scans this folder on startup
2. Finds all `.bpmn` files
3. Camunda automatically deploys them to the process engine
4. No manual deployment needed!



#### Our BPMN File Structure

```
src/main/resources/processes/
└── job-recruitment-workflow.bpmn
```

**File:** `job-recruitment-workflow.bpmn`

**Key Elements:**
```xml
<bpmn:process id="job-recruitment-workflow-india" 
              name="Job Recruitment Workflow India" 
              isExecutable="true">
```

- `id`: Process definition key (used to start process)
- `name`: Human-readable name
- `isExecutable="true"`: Can be executed by engine

#### How to Connect BPMN to Java Code

**1. Service Tasks - Call Java Classes**

In BPMN:
```xml
<bpmn:serviceTask id="CollectApplicantDataTask" 
                  name="Collect Applicant Data" 
                  camunda:class="com.dynamicworkflow.delegate.CollectApplicantDataDelegate">
```

In Java:
```java
@Component
public class CollectApplicantDataDelegate implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        // Your code here
        String applicationId = (String) execution.getVariable("applicationId");
        // Process data...
    }
}
```

**2. User Tasks - Assign to Users/Groups**

In BPMN:
```xml
<bpmn:userTask id="HRReviewTask" 
               name="HR Application Review" 
               camunda:candidateGroups="hr,managers">
```

This creates a task in Camunda Tasklist for users in "hr" or "managers" group.

**3. Process Variables - Pass Data**

In BPMN:
```xml
<bpmn:sequenceFlow id="Flow_7" name="Accept" 
                   sourceRef="HRDecisionGateway" 
                   targetRef="ParallelReviewGateway">
    <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
        ${hrDecision == 'accept'}
    </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

This checks the `hrDecision` variable to decide which path to take.

#### Deployment Process Flow

```
Application Startup
        ↓
Spring Boot Initializes
        ↓
Camunda Auto-Configuration Runs
        ↓
Scans src/main/resources/processes/
        ↓
Finds job-recruitment-workflow.bpmn
        ↓
Parses BPMN XML
        ↓
Validates Process Definition
        ↓
Stores in Database (H2)
        ↓
Process is Ready to Use!
```

**No Camunda Modeler deployment needed!** Just put the `.bpmn` file in the folder and restart.

---

## 5. Spring Boot Architecture

### Application Entry Point

**File:** `JobRecruitmentWorkflowApplication.java`

```java
@SpringBootApplication
public class JobRecruitmentWorkflowApplication {
    public static void main(String[] args) {
        SpringApplication.run(JobRecruitmentWorkflowApplication.class, args);
    }
}
```

**What `@SpringBootApplication` does:**
1. `@Configuration` - Marks as configuration class
2. `@EnableAutoConfiguration` - Auto-configures based on dependencies
3. `@ComponentScan` - Scans for components, services, controllers

### Component Layers

```
┌─────────────────────────────────────────┐
│         Controller Layer                │
│  (REST API Endpoints)                   │
│  - JobApplicationController.java        │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│          Service Layer                  │
│  (Business Logic)                       │
│  - JobApplicationService.java           │
│  - WorkflowDefinitionService.java       │
│  - ValidationService.java               │
└─────────────────┬───────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────┐
│          Model Layer                    │
│  (Data Structures)                      │
│  - WorkflowDefinition.java              │
│  - WorkflowStep.java                    │
│  - FormField.java                       │
└─────────────────────────────────────────┘
```

### Dependency Injection

Spring Boot uses **Dependency Injection** to wire components together.

**Example:**

```java
@RestController
@RequestMapping("/api/job-applications")
public class JobApplicationController {
    
    // Spring automatically injects these
    private final JobApplicationService jobApplicationService;
    private final WorkflowDefinitionService workflowDefinitionService;
    private final RuntimeService runtimeService;
    
    // Constructor injection (recommended)
    public JobApplicationController(
            JobApplicationService jobApplicationService,
            WorkflowDefinitionService workflowDefinitionService,
            RuntimeService runtimeService) {
        this.jobApplicationService = jobApplicationService;
        this.workflowDefinitionService = workflowDefinitionService;
        this.runtimeService = runtimeService;
    }
}
```

**How it works:**
1. Spring scans for `@Service`, `@Component`, `@RestController` annotations
2. Creates instances (beans) of these classes
3. Injects dependencies through constructor
4. Manages lifecycle of all beans

---

## 6. Controller Layer

### What is a Controller?

A **Controller** handles HTTP requests and returns responses. It's the entry point for REST API calls.

### Anatomy of a Controller

**File:** `JobApplicationController.java`

```java
@RestController                          // 1. Marks as REST controller
@RequestMapping("/api/job-applications") // 2. Base URL path
@CrossOrigin(origins = "*")              // 3. Allow CORS
public class JobApplicationController {
    
    // Dependencies injected by Spring
    private final JobApplicationService jobApplicationService;
    
    // Constructor
    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }
    
    // GET endpoint
    @GetMapping("/health")               // 4. HTTP method + path
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        return ResponseEntity.ok(response); // 5. Return response
    }
    
    // POST endpoint
    @PostMapping("/start")
    public ResponseEntity<ApplicationResponse> startApplication() {
        ApplicationResponse response = jobApplicationService.startApplication();
        return ResponseEntity.ok(response);
    }
    
    // POST with path variable
    @PostMapping("/{applicationId}/step")
    public ResponseEntity<ApplicationResponse> submitStep(
            @PathVariable String applicationId,      // 6. Path variable
            @RequestBody Map<String, Object> stepData) { // 7. Request body
        
        ApplicationResponse response = jobApplicationService.submitStep(
            applicationId, stepData);
        return ResponseEntity.ok(response);
    }
}
```

### Key Annotations Explained

1. **`@RestController`**
   - Combines `@Controller` + `@ResponseBody`
   - Automatically converts return values to JSON

2. **`@RequestMapping("/api/job-applications")`**
   - Base path for all endpoints in this controller
   - Example: `/api/job-applications/health`

3. **`@CrossOrigin(origins = "*")`**
   - Allows requests from any origin (frontend)
   - Needed for browser security (CORS)

4. **`@GetMapping`, `@PostMapping`**
   - HTTP method mappings
   - GET for retrieving data
   - POST for creating/submitting data

5. **`@PathVariable`**
   - Extracts value from URL path
   - `/api/job-applications/{applicationId}` → `applicationId` variable

6. **`@RequestBody`**
   - Converts JSON request body to Java object
   - Spring automatically deserializes JSON

7. **`ResponseEntity<T>`**
   - Wrapper for HTTP response
   - Allows setting status code, headers, body

### Request-Response Flow

```
Browser/Frontend
        ↓
    HTTP Request
    POST /api/job-applications/start
        ↓
    Spring DispatcherServlet
        ↓
    Finds matching @PostMapping
        ↓
    JobApplicationController.startApplication()
        ↓
    Calls JobApplicationService.startApplication()
        ↓
    Service processes request
        ↓
    Returns ApplicationResponse
        ↓
    Controller wraps in ResponseEntity
        ↓
    Spring converts to JSON
        ↓
    HTTP Response (JSON)
        ↓
    Browser/Frontend
```



---

## 7. Service Layer

### What is a Service?

A **Service** contains business logic. It's where the actual work happens.

### Service Example: JobApplicationService

**File:** `JobApplicationService.java`

```java
@Service  // Marks as Spring service
public class JobApplicationService {
    
    // Camunda services injected
    private final RuntimeService runtimeService;
    private final TaskService taskService;
    private final HistoryService historyService;
    
    // Our services
    private final WorkflowDefinitionService workflowDefinitionService;
    private final ValidationService validationService;
    
    // In-memory data storage
    private final Map<String, Map<String, Object>> applicationDataStore = 
        new ConcurrentHashMap<>();
    
    // Constructor injection
    public JobApplicationService(ProcessEngine processEngine, 
                               WorkflowDefinitionService workflowDefinitionService,
                               ValidationService validationService) {
        this.runtimeService = processEngine.getRuntimeService();
        this.taskService = processEngine.getTaskService();
        this.historyService = processEngine.getHistoryService();
        this.workflowDefinitionService = workflowDefinitionService;
        this.validationService = validationService;
    }
    
    // Business method
    public ApplicationResponse startApplication() {
        // 1. Generate unique ID
        String applicationId = generateApplicationId();
        
        // 2. Initialize data
        Map<String, Object> applicationData = new HashMap<>();
        applicationData.put("applicationId", applicationId);
        applicationData.put("applicationStatus", "STARTED");
        
        // 3. Store in memory
        applicationDataStore.put(applicationId, applicationData);
        
        // 4. Start Camunda process
        Map<String, Object> processVariables = new HashMap<>();
        processVariables.put("applicationId", applicationId);
        
        ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
            "job-recruitment-workflow-india",  // Process definition key
            applicationId,                      // Business key
            processVariables                    // Variables
        );
        
        // 5. Return response
        ApplicationResponse response = new ApplicationResponse();
        response.setApplicationId(applicationId);
        response.setStatus("STARTED");
        return response;
    }
}
```

### How Services Interact with Camunda

#### RuntimeService - Process Management

```java
// Start a process
ProcessInstance processInstance = runtimeService.startProcessInstanceByKey(
    "job-recruitment-workflow-india",  // Process ID from BPMN
    applicationId,                      // Business key (for tracking)
    processVariables                    // Initial variables
);

// Get process variables
Map<String, Object> variables = runtimeService.getVariables(processInstanceId);

// Set process variables
runtimeService.setVariable(processInstanceId, "hrDecision", "accept");

// Query active processes
List<ProcessInstance> processes = runtimeService.createProcessInstanceQuery()
    .processDefinitionKey("job-recruitment-workflow-india")
    .active()
    .list();
```

#### TaskService - Task Management

```java
// Find active task
Task currentTask = taskService.createTaskQuery()
    .processInstanceId(processInstanceId)
    .active()
    .singleResult();

// Complete task with variables
Map<String, Object> taskVariables = new HashMap<>();
taskVariables.put("hrDecision", "accept");
taskVariables.put("hrComments", "Good candidate");
taskService.complete(currentTask.getId(), taskVariables);

// Query tasks by candidate group
List<Task> hrTasks = taskService.createTaskQuery()
    .taskCandidateGroup("hr")
    .list();
```

#### HistoryService - Historical Data

```java
// Query completed processes
List<HistoricProcessInstance> completedProcesses = 
    historyService.createHistoricProcessInstanceQuery()
    .processDefinitionKey("job-recruitment-workflow-india")
    .finished()
    .list();

// Get historical variables
List<HistoricVariableInstance> variables = 
    historyService.createHistoricVariableInstanceQuery()
    .processInstanceId(processInstanceId)
    .list();
```

---

## 8. Frontend-Backend Connection

### How Frontend Connects to Backend

#### Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (Browser)              │
│  ┌───────────────────────────────────┐  │
│  │  HTML + CSS + JavaScript          │  │
│  │  - index.html                     │  │
│  │  - hr-dashboard.html              │  │
│  │  - teamlead-dashboard.html        │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│                  │ HTTP Requests         │
│                  │ (Fetch API)           │
└──────────────────┼───────────────────────┘
                   │
                   ↓
┌─────────────────────────────────────────┐
│    Spring Boot Backend (Port 8082)      │
│  ┌───────────────────────────────────┐  │
│  │  REST API Controllers             │  │
│  │  /api/job-applications/*          │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│                  ↓                       │
│  ┌───────────────────────────────────┐  │
│  │  Services (Business Logic)        │  │
│  └───────────────┬───────────────────┘  │
│                  │                       │
│                  ↓                       │
│  ┌───────────────────────────────────┐  │
│  │  Camunda Process Engine           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Static Resources Serving

**Configuration in `application.yml`:**

```yaml
spring:
  web:
    resources:
      static-locations: classpath:/static/
  mvc:
    static-path-pattern: /**
```

**What this means:**
- Files in `src/main/resources/static/` are served directly
- `index.html` → http://localhost:8082/index.html
- `hr-dashboard.html` → http://localhost:8082/hr-dashboard.html
- No controller needed for static files!

### JavaScript Fetch API

**Frontend Code (JavaScript):**

```javascript
// GET request
async function loadApplications() {
    try {
        const response = await fetch('/api/job-applications/all');
        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// POST request
async function startApplication() {
    try {
        const response = await fetch('/api/job-applications/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Application started:', data.applicationId);
    } catch (error) {
        console.error('Error:', error);
    }
}

// POST with body
async function submitStep(applicationId, stepData) {
    try {
        const response = await fetch(`/api/job-applications/${applicationId}/step`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(stepData)
        });
        const data = await response.json();
        console.log('Step submitted:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### Request-Response Example

**1. Frontend makes request:**
```javascript
fetch('/api/job-applications/start', { method: 'POST' })
```

**2. Browser sends HTTP request:**
```
POST /api/job-applications/start HTTP/1.1
Host: localhost:8082
Content-Type: application/json
```

**3. Spring Boot receives request:**
- DispatcherServlet routes to controller
- `JobApplicationController.startApplication()` is called

**4. Controller calls service:**
```java
ApplicationResponse response = jobApplicationService.startApplication();
```

**5. Service processes:**
- Generates application ID
- Starts Camunda process
- Returns response object

**6. Controller returns response:**
```java
return ResponseEntity.ok(response);
```

**7. Spring converts to JSON:**
```json
{
  "applicationId": "APP-1234567890-ABCD1234",
  "status": "STARTED",
  "message": "Application started successfully"
}
```

**8. Frontend receives response:**
```javascript
const data = await response.json();
console.log(data.applicationId);
```

### CORS Configuration

**Why needed?**
- Browser security prevents cross-origin requests
- Frontend (http://localhost:8082) calling API (http://localhost:8082) is same-origin, but we enable CORS for flexibility

**Configuration:**
```java
@CrossOrigin(origins = "*")  // Allow all origins
```

Or globally in configuration:
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```



---

## 9. Process Variables and Data Flow

### What are Process Variables?

**Process Variables** are data stored in the Camunda process instance. They flow through the workflow and can be accessed by:
- Service tasks (Java delegates)
- User tasks (forms)
- Gateways (decision logic)
- Scripts

### How Data Flows Through the Workflow

```
1. Application Submitted
   Variables: { applicationId, firstName, lastName, email, ... }
        ↓
2. HR Review Task
   HR adds: { hrDecision: "accept", hrComments: "Good candidate" }
        ↓
3. Parallel Gateway Split
   Variables available to both TL and PM
        ↓
4. Team Lead Review
   TL adds: { tlDecision: "accept", tlComments: "Strong skills" }
        ↓
5. Project Manager Review
   PM adds: { pmDecision: "accept", pmComments: "Good fit" }
        ↓
6. Parallel Gateway Join
   All variables merged
        ↓
7. Head HR Review
   Head HR adds: { headHRDecision: "accept", offerCTC: "12.5" }
        ↓
8. Store Application
   All variables saved to database
```

### Setting Variables in Java

```java
// When starting process
Map<String, Object> variables = new HashMap<>();
variables.put("applicationId", "APP-123");
variables.put("firstName", "John");
variables.put("lastName", "Doe");
runtimeService.startProcessInstanceByKey("process-key", variables);

// When completing task
Map<String, Object> taskVariables = new HashMap<>();
taskVariables.put("hrDecision", "accept");
taskVariables.put("hrComments", "Approved");
taskService.complete(taskId, taskVariables);

// Setting variable on running process
runtimeService.setVariable(processInstanceId, "status", "APPROVED");
```

### Using Variables in BPMN

**1. In Gateway Conditions:**
```xml
<bpmn:sequenceFlow id="Flow_Accept" sourceRef="Gateway" targetRef="NextTask">
    <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">
        ${hrDecision == 'accept'}
    </bpmn:conditionExpression>
</bpmn:sequenceFlow>
```

**2. In Service Task (Java Delegate):**
```java
public class MyDelegate implements JavaDelegate {
    @Override
    public void execute(DelegateExecution execution) {
        // Get variable
        String applicationId = (String) execution.getVariable("applicationId");
        
        // Set variable
        execution.setVariable("processed", true);
    }
}
```

**3. In User Task Form:**
```xml
<bpmn:userTask id="ReviewTask" name="Review">
    <bpmn:documentation>
        Review application for ${firstName} ${lastName}
        Email: ${email}
    </bpmn:documentation>
    <bpmn:extensionElements>
        <camunda:formData>
            <camunda:formField id="decision" label="Decision" type="enum">
                <camunda:value id="accept" name="Accept" />
                <camunda:value id="reject" name="Reject" />
            </camunda:formField>
        </camunda:formData>
    </bpmn:extensionElements>
</bpmn:userTask>
```

### Syncing Variables Between Camunda and Application

**Our Implementation:**

```java
private void syncApplicationStatusWithCamunda() {
    // Get all active processes
    List<ProcessInstance> processes = runtimeService.createProcessInstanceQuery()
        .processDefinitionKey("job-recruitment-workflow-india")
        .active()
        .list();
    
    for (ProcessInstance process : processes) {
        String applicationId = process.getBusinessKey();
        
        // Get process variables from Camunda
        Map<String, Object> processVariables = 
            runtimeService.getVariables(process.getId());
        
        // Get application data from our store
        Map<String, Object> appData = applicationDataStore.get(applicationId);
        
        // Sync variables
        if (processVariables.containsKey("hrDecision")) {
            appData.put("hrDecision", processVariables.get("hrDecision"));
            appData.put("hrComments", processVariables.get("hrComments"));
        }
        
        if (processVariables.containsKey("tlDecision")) {
            appData.put("tlDecision", processVariables.get("tlDecision"));
            appData.put("tlComments", processVariables.get("tlComments"));
        }
        
        // ... sync other variables
    }
}
```

**Why we need this:**
- Camunda stores variables in its database
- Our application stores data in memory (ConcurrentHashMap)
- We sync them so dashboards show latest data
- Sync runs every time `/api/job-applications/all` is called

---

## 10. Running Everything Together

### What Happens When You Run `mvn spring-boot:run`

```
Step 1: Maven Compiles Code
        ↓
Step 2: Spring Boot Application Starts
        ↓
Step 3: Embedded Tomcat Server Starts (Port 8082)
        ↓
Step 4: Spring Auto-Configuration Runs
        ↓
Step 5: Camunda Process Engine Initializes
        ↓
Step 6: H2 Database Tables Created
        ↓
Step 7: BPMN Files Deployed from src/main/resources/processes/
        ↓
Step 8: Controllers, Services, Components Registered
        ↓
Step 9: Camunda Web Apps Start
        - Cockpit: /camunda/app/cockpit/default/
        - Tasklist: /camunda/app/tasklist/default/
        - Admin: /camunda/app/admin/default/
        ↓
Step 10: Static Resources Available
        - Frontend: /index.html
        - Dashboards: /hr-dashboard.html, etc.
        ↓
Step 11: Application Ready!
        - Listening on http://localhost:8082
```

### Detailed Startup Sequence

#### 1. Maven Phase

```bash
mvn spring-boot:run
```

Maven:
- Resolves dependencies from `pom.xml`
- Downloads missing JARs from Maven Central
- Compiles Java files from `src/main/java/`
- Copies resources from `src/main/resources/`

#### 2. Spring Boot Initialization

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v2.6.15)
```

Spring Boot:
- Scans classpath for dependencies
- Detects Camunda, H2, Web dependencies
- Triggers auto-configuration

#### 3. Camunda Initialization

```
INFO  o.c.b.s.SpringProcessEngineConfiguration : 
      Camunda BPM version: 7.18.0
INFO  o.c.b.e.i.ProcessEngineImpl : 
      ProcessEngine default created
```

Camunda:
- Creates ProcessEngine bean
- Initializes RuntimeService, TaskService, etc.
- Creates database schema in H2
- Deploys BPMN files

#### 4. BPMN Deployment

```
INFO  o.c.b.e.i.d.DeploymentCache : 
      Deployment job-recruitment-workflow.bpmn deployed
INFO  o.c.b.e.i.p.ProcessDefinitionEntity : 
      Process definition job-recruitment-workflow-india:1 deployed
```

#### 5. Web Server Start

```
INFO  o.s.b.w.e.tomcat.TomcatWebServer : 
      Tomcat started on port(s): 8082 (http)
INFO  c.d.JobRecruitmentWorkflowApplication : 
      Started JobRecruitmentWorkflowApplication in 12.345 seconds
```

### All Components Running Together

Once started, you have:

```
┌─────────────────────────────────────────────────────────┐
│         Single Spring Boot Application                  │
│              (Port 8082)                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ✅ Embedded Tomcat Server                              │
│  ✅ Spring Boot Application                             │
│  ✅ REST API Controllers                                │
│  ✅ Business Services                                   │
│  ✅ Camunda Process Engine                              │
│  ✅ Camunda Web Applications                            │
│     - Cockpit                                           │
│     - Tasklist                                          │
│     - Admin                                             │
│  ✅ H2 Database                                         │
│  ✅ Static Frontend Files                               │
│     - index.html                                        │
│     - hr-dashboard.html                                 │
│     - teamlead-dashboard.html                           │
│     - projectmanager-dashboard.html                     │
│     - headhr-dashboard.html                             │
│  ✅ BPMN Process Definitions                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Everything runs in ONE Java process!**

### Why This Works

1. **Embedded Tomcat**
   - Spring Boot includes Tomcat
   - No separate server installation needed
   - Configured automatically

2. **Embedded Camunda**
   - Camunda runs inside Spring Boot
   - Shares same database
   - Shares same web server

3. **Auto-Configuration**
   - Spring Boot detects dependencies
   - Configures everything automatically
   - No XML configuration needed

4. **Single Port**
   - Everything accessible on port 8082
   - Frontend, API, Camunda all together
   - Simplifies deployment



---

## 11. Complete Request Flow Example

Let's trace a complete request from frontend to backend and back.

### Scenario: Submit Application Step

#### 1. User Fills Form (Frontend)

```html
<!-- index.html -->
<form id="step-form">
    <input type="text" name="firstName" value="John">
    <input type="text" name="lastName" value="Doe">
    <input type="email" name="email" value="john@example.com">
    <button onclick="submitStep()">Next</button>
</form>
```

#### 2. JavaScript Collects Data

```javascript
// workflow.js
async function submitStep() {
    const stepData = {
        currentStep: 'personal-info',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobileNumber: '9876543210',
        dateOfBirth: '1995-05-15',
        gender: 'male'
    };
    
    const response = await fetch(
        `/api/job-applications/${applicationId}/step`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(stepData)
        }
    );
    
    const result = await response.json();
    console.log(result);
}
```

#### 3. HTTP Request Sent

```
POST /api/job-applications/APP-123/step HTTP/1.1
Host: localhost:8082
Content-Type: application/json

{
  "currentStep": "personal-info",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobileNumber": "9876543210",
  "dateOfBirth": "1995-05-15",
  "gender": "male"
}
```

#### 4. Spring DispatcherServlet Routes Request

```
DispatcherServlet
    ↓
Finds @PostMapping("/{applicationId}/step")
    ↓
Calls JobApplicationController.submitStep()
```

#### 5. Controller Receives Request

```java
@PostMapping("/{applicationId}/step")
public ResponseEntity<ApplicationResponse> submitStep(
        @PathVariable String applicationId,           // "APP-123"
        @RequestBody Map<String, Object> stepData) {  // JSON → Map
    
    // Call service
    ApplicationResponse response = 
        jobApplicationService.submitStep(applicationId, stepData);
    
    return ResponseEntity.ok(response);
}
```

#### 6. Service Processes Request

```java
public ApplicationResponse submitStep(String applicationId, 
                                     Map<String, Object> stepData) {
    // 1. Get current step
    String currentStepId = (String) stepData.get("currentStep");
    
    // 2. Validate data
    WorkflowStep step = workflowDefinitionService.getStepById(currentStepId);
    validationService.validateStepData(step, stepData);
    
    // 3. Store data
    Map<String, Object> appData = applicationDataStore.get(applicationId);
    appData.putAll(stepData);
    
    // 4. Update Camunda process
    String processInstanceId = (String) appData.get("processInstanceId");
    Task currentTask = taskService.createTaskQuery()
        .processInstanceId(processInstanceId)
        .active()
        .singleResult();
    
    if (currentTask != null) {
        taskService.complete(currentTask.getId(), stepData);
    }
    
    // 5. Determine next step
    String nextStepId = workflowDefinitionService.getNextStep(currentStepId);
    
    // 6. Return response
    ApplicationResponse response = new ApplicationResponse();
    response.setApplicationId(applicationId);
    response.setCurrentStep(nextStepId);
    response.setStatus("IN_PROGRESS");
    return response;
}
```

#### 7. Camunda Process Advances

```
Camunda Process Engine
    ↓
Current Task: PersonalInfoTask
    ↓
Task Completed with variables
    ↓
Process moves to next task: JobPreferencesTask
    ↓
Variables stored in database
```

#### 8. Response Sent Back

```java
// Controller returns
return ResponseEntity.ok(response);
```

Spring converts to JSON:
```json
{
  "applicationId": "APP-123",
  "currentStep": "job-preferences",
  "status": "IN_PROGRESS",
  "message": "Step submitted successfully"
}
```

#### 9. Frontend Receives Response

```javascript
const result = await response.json();
console.log(result.currentStep);  // "job-preferences"

// Update UI to show next step
renderNextStep(result.currentStep);
```

---

## 12. Key Concepts Summary

### Spring Boot Magic

1. **Auto-Configuration**
   - Detects dependencies
   - Configures beans automatically
   - No XML configuration

2. **Embedded Server**
   - Tomcat included
   - No separate installation
   - Single JAR deployment

3. **Dependency Injection**
   - Automatic wiring
   - Constructor injection
   - Lifecycle management

### Camunda Integration

1. **Embedded Engine**
   - Runs inside Spring Boot
   - Shares database
   - Shares web server

2. **Auto-Deployment**
   - BPMN files from classpath
   - No manual deployment
   - Automatic on startup

3. **Process Variables**
   - Data flows through workflow
   - Accessible in Java and BPMN
   - Stored in database

### Maven Build System

1. **Dependency Management**
   - Downloads libraries
   - Manages versions
   - Resolves conflicts

2. **Build Lifecycle**
   - clean: Remove old files
   - compile: Compile Java
   - test: Run tests
   - package: Create JAR
   - install: Install to local repo

3. **Spring Boot Plugin**
   - `mvn spring-boot:run`
   - Quick development
   - No JAR creation needed

---

## 13. Troubleshooting Common Issues

### Issue 1: Port Already in Use

**Error:**
```
Web server failed to start. Port 8082 was already in use.
```

**Solution:**
```bash
# Find process using port 8082
lsof -i :8082

# Kill the process
kill -9 <PID>

# Or change port in application.yml
server:
  port: 8083
```

### Issue 2: BPMN File Not Deployed

**Error:**
```
No process definition found with key: job-recruitment-workflow-india
```

**Solution:**
- Check file is in `src/main/resources/processes/`
- Check file extension is `.bpmn`
- Check process `id` in BPMN matches the key
- Restart application

### Issue 3: Camunda Web Apps Not Loading

**Error:**
```
404 Not Found: /camunda/app/cockpit/default/
```

**Solution:**
- Check `camunda-bpm-spring-boot-starter-webapp` dependency in pom.xml
- Run `mvn clean install`
- Restart application

### Issue 4: Frontend Not Loading

**Error:**
```
404 Not Found: /index.html
```

**Solution:**
- Check file is in `src/main/resources/static/`
- Check `spring.web.resources.static-locations` in application.yml
- Clear browser cache
- Restart application

---

## 14. Best Practices

### 1. Dependency Injection

✅ **Good: Constructor Injection**
```java
@Service
public class MyService {
    private final OtherService otherService;
    
    public MyService(OtherService otherService) {
        this.otherService = otherService;
    }
}
```

❌ **Avoid: Field Injection**
```java
@Service
public class MyService {
    @Autowired
    private OtherService otherService;  // Harder to test
}
```

### 2. Exception Handling

✅ **Good: Proper Error Handling**
```java
@PostMapping("/start")
public ResponseEntity<ApplicationResponse> startApplication() {
    try {
        ApplicationResponse response = service.startApplication();
        return ResponseEntity.ok(response);
    } catch (ValidationException e) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse(e.getMessage()));
    } catch (Exception e) {
        logger.error("Failed to start application", e);
        return ResponseEntity.status(500)
            .body(new ErrorResponse("Internal server error"));
    }
}
```

### 3. Logging

✅ **Good: Use SLF4J Logger**
```java
private static final Logger logger = LoggerFactory.getLogger(MyClass.class);

logger.info("Application started: {}", applicationId);
logger.error("Failed to process", exception);
```

### 4. Configuration

✅ **Good: Externalize Configuration**
```yaml
# application.yml
app:
  workflow:
    timeout: 3600
    max-retries: 3
```

```java
@Value("${app.workflow.timeout}")
private int timeout;
```

---

## 15. Further Learning Resources

### Official Documentation

1. **Spring Boot**
   - https://spring.io/projects/spring-boot
   - https://docs.spring.io/spring-boot/docs/current/reference/html/

2. **Camunda BPM**
   - https://docs.camunda.org/manual/7.18/
   - https://camunda.com/developers/

3. **Maven**
   - https://maven.apache.org/guides/

### Recommended Topics

1. **Spring Boot Basics**
   - Auto-configuration
   - Dependency injection
   - REST controllers
   - Configuration properties

2. **Camunda BPM**
   - BPMN 2.0 modeling
   - Process engine API
   - User tasks and forms
   - Service tasks and delegates

3. **Java Concepts**
   - Annotations
   - Lambda expressions
   - Streams API
   - Concurrent collections

---

## Conclusion

This project demonstrates how to:

✅ Embed Camunda BPM in Spring Boot
✅ Deploy BPMN files automatically
✅ Create REST APIs with controllers
✅ Manage business logic in services
✅ Connect frontend to backend
✅ Handle process variables
✅ Run everything with one command

**Key Takeaway:** Spring Boot's auto-configuration and embedded approach makes it incredibly easy to build complex workflow applications without manual server setup or deployment!

---

**Questions?** Check the other documentation files or review the code with these concepts in mind!
