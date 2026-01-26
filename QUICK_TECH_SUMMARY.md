# Quick Technical Summary

## How Everything Works Together

### 1. Maven (`pom.xml`)
- **Manages dependencies** - Downloads Spring Boot, Camunda, H2, etc.
- **Builds project** - Compiles Java code
- **Runs application** - `mvn spring-boot:run` starts everything

### 2. Spring Boot
- **Application framework** - Provides structure
- **Auto-configuration** - Automatically sets up Camunda, database, web server
- **Embedded Tomcat** - Web server included (no separate installation)
- **Dependency injection** - Wires components together

### 3. Camunda BPM 7.18.0
- **Embedded in Spring Boot** - Runs inside the application
- **Auto-deploys BPMN** - Files from `src/main/resources/processes/`
- **Provides web apps** - Cockpit, Tasklist, Admin
- **Process engine** - Executes workflows

### 4. BPMN Deployment
- Put `.bpmn` file in `src/main/resources/processes/`
- Spring Boot automatically finds and deploys it
- No Camunda Modeler deployment needed!

### 5. Controllers
- Handle HTTP requests (REST API)
- Convert JSON to Java objects
- Call services for business logic
- Return JSON responses

### 6. Services
- Contain business logic
- Interact with Camunda (RuntimeService, TaskService)
- Manage application data
- Process workflow steps

### 7. Frontend-Backend Connection
- Static files in `src/main/resources/static/`
- JavaScript uses Fetch API
- Calls REST endpoints (`/api/job-applications/*`)
- Receives JSON responses

### 8. Running Everything
```bash
mvn spring-boot:run
```
This single command:
- Compiles code
- Starts Spring Boot
- Starts Tomcat (port 8082)
- Initializes Camunda
- Deploys BPMN files
- Serves frontend files
- Makes everything available!

## Key Files

| File | Purpose |
|------|---------|
| `pom.xml` | Dependencies and build config |
| `application.yml` | Application configuration |
| `JobRecruitmentWorkflowApplication.java` | Main entry point |
| `JobApplicationController.java` | REST API endpoints |
| `JobApplicationService.java` | Business logic |
| `job-recruitment-workflow.bpmn` | Workflow definition |
| `index.html` | Frontend application |

## Data Flow

```
User → Frontend (HTML/JS) → REST API (Controller) → Service → Camunda → Database
                                                      ↓
                                                   Response
                                                      ↓
User ← Frontend ← JSON ← Controller ← Service ← Camunda ← Database
```

## Why One Command Works

**Spring Boot Magic:**
1. Detects Camunda dependency → Auto-configures process engine
2. Detects H2 dependency → Auto-configures database
3. Detects Web dependency → Starts embedded Tomcat
4. Scans for BPMN files → Auto-deploys them
5. Serves static files → Frontend accessible
6. Registers controllers → REST API available

**Everything runs in ONE Java process on ONE port (8082)!**

## Camunda Version: 7.18.0

- Released: 2022
- Stable and production-ready
- Compatible with Spring Boot 2.6.15
- Includes all features we need

## Commands Explained

### `mvn clean install`
- **clean**: Delete old compiled files
- **install**: Compile, test, package, install to local Maven repo
- **Use when**: First time setup, after major changes

### `mvn spring-boot:run`
- Compile and run application
- No JAR creation needed
- Quick development cycle
- **Use when**: Development, testing

## Architecture in One Picture

```
┌─────────────────────────────────────┐
│   Single Spring Boot Application    │
│         (Port 8082)                  │
├─────────────────────────────────────┤
│ ✅ REST API                          │
│ ✅ Business Logic                    │
│ ✅ Camunda Engine                    │
│ ✅ Camunda Web Apps                  │
│ ✅ H2 Database                       │
│ ✅ Frontend Files                    │
│ ✅ BPMN Workflows                    │
└─────────────────────────────────────┘
```

**All accessible at http://localhost:8082**

---

For detailed explanations, see `TECHNICAL_IMPLEMENTATION_GUIDE.md`
