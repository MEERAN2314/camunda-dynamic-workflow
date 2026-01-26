# Job Recruitment Workflow - Dynamic Workflow Module

A production-ready Spring Boot application with Camunda BPM integration featuring a comprehensive multi-level approval workflow for job recruitment.

## 🌟 Overview

This application demonstrates an enterprise-grade recruitment workflow with:
- **Dynamic JSON-driven forms** - No hardcoded forms, everything configured via JSON
- **Multi-level approval process** - HR → Team Lead & Project Manager (Parallel) → Head HR
- **Complete audit trail** - All decisions and comments tracked
- **Real-time dashboards** - Role-based interfaces for each reviewer
- **Camunda BPM integration** - Full BPMN 2.0 workflow orchestration

## 🚀 Quick Start

### Prerequisites
- Java 11+
- Maven 3.6+

### Running the Application

1. **Clone and build**:
```bash
mvn clean install
mvn spring-boot:run
```

2. **Access the applications**:

| Role | Dashboard URL | Purpose |
|------|--------------|---------|
| 🏠 Applicant | http://localhost:8082/ | Submit job application |
| 👔 HR | http://localhost:8082/hr-dashboard.html | Initial screening |
| 🎯 Team Lead | http://localhost:8082/teamlead-dashboard.html | Technical assessment |
| 📊 Project Manager | http://localhost:8082/projectmanager-dashboard.html | Project fit review |
| 👑 Head HR | http://localhost:8082/headhr-dashboard.html | Final hiring decision |
| 📋 Camunda Tasklist | http://localhost:8082/camunda/app/tasklist/default/ | Complete approval tasks |
| 🔍 Camunda Cockpit | http://localhost:8082/camunda/app/cockpit/default/ | Monitor workflows |

**Camunda Credentials**: `admin` / `admin`

## 📋 Quick Test

### API Testing with curl:
```bash
# Health check
curl http://localhost:8082/api/job-applications/health

# Start new application
curl -X POST http://localhost:8082/api/job-applications/start

# Get workflow definition
curl http://localhost:8082/api/job-applications/workflow-definition

# Manual sync with Camunda
curl http://localhost:8082/api/job-applications/sync
```

### Complete Workflow Test:
1. **Submit Application**: Go to http://localhost:8082/ and complete 3 steps
2. **HR Review**: Open HR dashboard, review in Camunda Tasklist, accept
3. **TL Review**: Open Team Lead dashboard, review in Camunda Tasklist, accept
4. **PM Review**: Open Project Manager dashboard, review in Camunda Tasklist, accept
5. **Head HR Review**: Open Head HR dashboard, make final decision in Camunda Tasklist
6. **Verify**: Check Camunda Cockpit to see completed process

See `TESTING_GUIDE.md` for detailed step-by-step testing instructions.

## 🎯 Key Features

### Dynamic Workflow Engine
- ✅ **JSON-driven forms** - All fields, validations, and steps defined in JSON
- ✅ **Dynamic rendering** - Forms generated on-the-fly from configuration
- ✅ **Flexible validation** - Pattern matching, length checks, numeric ranges
- ✅ **Conditional fields** - Show/hide fields based on user input

### Multi-Level Approval System
- ✅ **HR Review** - Initial screening and approval (First Gate)
- ✅ **Parallel Review** - Team Lead & Project Manager review simultaneously (Second Gate)
- ✅ **Head HR Final Decision** - Final authority for hiring (Final Gate)
- ✅ **Smart rejection** - Process stops immediately if any reviewer rejects

### Role-Based Dashboards
- ✅ **Consistent design** - All dashboards follow the same professional styling
- ✅ **Real-time updates** - Auto-refresh every 10 seconds
- ✅ **Status indicators** - Color-coded badges (Pending/Approved/Rejected)
- ✅ **Complete history** - Applications remain visible after review
- ✅ **Review comments** - Each reviewer can see their own comments
- ✅ **Accurate statistics** - Pending vs. Reviewed counts

### Camunda Integration
- ✅ **Full BPMN 2.0** - Complete workflow lifecycle management
- ✅ **Parallel gateway** - TL and PM review simultaneously
- ✅ **Process variables** - All decisions synced between Camunda and application
- ✅ **Task assignment** - Role-based task routing
- ✅ **Process monitoring** - Real-time workflow tracking in Cockpit

### Indian Job Market Customization
- ✅ **Mobile validation** - 10-digit Indian mobile numbers (6-9 prefix)
- ✅ **CTC in Lakhs** - Annual salary in Indian format
- ✅ **Notice periods** - Immediate, 15 days, 1-2 months
- ✅ **Indian education** - B.Tech, BCA, MCA, M.Tech options
- ✅ **Inclusive gender** - Transgender and prefer not to say options

## 🏗️ Architecture

### Technology Stack
- **Backend**: Spring Boot 2.6.15 + Camunda BPM 7.18
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Database**: H2 (development) / PostgreSQL (production ready)
- **Process Engine**: Camunda BPM embedded
- **Build Tool**: Maven 3.6+
- **Java Version**: 11+

### Design Patterns
- **Service Layer Pattern** - Business logic separation
- **DTO Pattern** - Data transfer objects
- **Delegate Pattern** - Camunda service tasks
- **Repository Pattern** - Data access abstraction
- **MVC Pattern** - Model-View-Controller architecture

## 🔄 Workflow Process

### Complete Approval Flow

```
Application Submitted
        ↓
   Data Collection
        ↓
    HR Review (Gate 1)
        ↓
   [HR Decision?]
    ↙         ↘
Reject      Accept
  ↓            ↓
 End    Parallel Gateway
           ↙       ↘
      TL Review  PM Review
           ↘       ↙
        Parallel Join
              ↓
      [Both Approved?]
       ↙           ↘
     No            Yes
      ↓             ↓
     End      Head HR Review (Gate 3)
                    ↓
            [Head HR Decision?]
             ↙            ↘
          Reject        Accept
            ↓              ↓
           End      Store & Success
```

### Detailed Stages

#### 1. Applicant Submission (3 Steps)
- **Personal Information**: Name, email, mobile, DOB, gender
- **Job Preferences**: Position, expected CTC, notice period
- **Experience & Education**: Years of experience, education level, skills

**Status**: `STARTED` → `IN_PROGRESS` → `PENDING_HR_REVIEW`

#### 2. HR Review (First Gate)
- HR views application in dashboard
- Reviews in Camunda Tasklist
- Makes Accept/Reject decision with comments
- **If Rejected**: Process ends immediately
- **If Accepted**: Moves to parallel review

**Status**: `PENDING_HR_REVIEW` → `HR_APPROVED` or `REJECTED_BY_HR`

#### 3. Parallel Review (Second Gate)
**Team Lead Review**:
- Technical skills assessment
- Reviews in Camunda Tasklist
- Makes Accept/Reject decision with comments

**Project Manager Review** (Simultaneous):
- Project fit assessment
- Reviews in Camunda Tasklist
- Makes Accept/Reject decision with comments

**Approval Logic**:
- Both TL AND PM must approve to proceed
- If either rejects, application is rejected

**Status**: `HR_APPROVED` → `PENDING_HEAD_HR_REVIEW` or `REJECTED_BY_TL_PM`

#### 4. Head HR Final Review (Final Gate)
- Reviews all previous approvals and comments
- Makes final hiring decision in Camunda Tasklist
- Can specify offer CTC
- **If Accepted**: Application stored, candidate hired
- **If Rejected**: Application rejected

**Status**: `PENDING_HEAD_HR_REVIEW` → `ACCEPTED` or `REJECTED_BY_HEAD_HR`

### Approval Requirements

**For ACCEPTANCE** (All must approve):
- ✅ HR
- ✅ Team Lead
- ✅ Project Manager
- ✅ Head HR

**For REJECTION** (Any can reject):
- ❌ HR rejects → Immediate rejection
- ❌ Team Lead rejects → Rejection (even if PM accepts)
- ❌ Project Manager rejects → Rejection (even if TL accepts)
- ❌ Head HR rejects → Final rejection

## 📊 Dashboard Features

### Common Features (All Dashboards)
- ✅ **Auto-refresh** - Updates every 10 seconds
- ✅ **Manual refresh** - Refresh button for immediate update
- ✅ **Statistics cards** - Total, Pending, Reviewed counts
- ✅ **Status badges** - Color-coded (Yellow/Green/Red)
- ✅ **Camunda links** - Direct access to Tasklist and Cockpit
- ✅ **Responsive design** - Works on desktop and mobile
- ✅ **Professional styling** - Consistent design across all dashboards

### HR Dashboard
- View all submitted applications
- See application status (Pending/Accepted/Rejected)
- Review in Camunda Tasklist
- Make Accept/Reject decisions with comments

### Team Lead Dashboard
- View HR-approved applications
- See HR comments
- Technical skills assessment
- Applications remain visible after review
- Status: Pending TL Review / Approved by You / Rejected by You

### Project Manager Dashboard
- View HR-approved applications
- See HR comments and applicant skills
- Project fit assessment
- Applications remain visible after review
- Status: Pending PM Review / Approved by You / Rejected by You

### Head HR Dashboard
- View applications approved by both TL and PM
- See all previous approvals and comments
- Make final hiring decision
- Specify offer CTC
- Applications remain visible after review
- Status: Pending Final Review / Approved by You / Rejected by You
- **Force Sync** button for manual Camunda sync

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/dynamicworkflow/
│   │   ├── controller/          # REST API controllers
│   │   │   └── JobApplicationController.java
│   │   ├── service/             # Business logic
│   │   │   ├── JobApplicationService.java
│   │   │   ├── WorkflowDefinitionService.java
│   │   │   └── ValidationService.java
│   │   ├── model/               # Data models
│   │   │   ├── WorkflowDefinition.java
│   │   │   ├── WorkflowStep.java
│   │   │   └── FormField.java
│   │   ├── dto/                 # Data transfer objects
│   │   │   └── ApplicationResponse.java
│   │   ├── delegate/            # Camunda delegates
│   │   │   ├── CollectApplicantDataDelegate.java
│   │   │   ├── StoreApplicationDelegate.java
│   │   │   └── SendRejectionDelegate.java
│   │   └── config/              # Configuration classes
│   └── resources/
│       ├── static/              # Frontend files
│       │   ├── index.html       # Applicant portal
│       │   ├── hr-dashboard.html
│       │   ├── teamlead-dashboard.html
│       │   ├── projectmanager-dashboard.html
│       │   ├── headhr-dashboard.html
│       │   └── css/style.css
│       ├── processes/           # BPMN files
│       │   └── job-recruitment-workflow.bpmn
│       ├── workflow-definition.json
│       └── application.yml
```

## 🔧 Configuration

### Application Port
The application runs on **port 8082** by default. Change in `application.yml`:

```yaml
server:
  port: 8082
```

### Workflow Definition
Edit `src/main/resources/workflow-definition.json` to customize:
- Form fields and validation rules
- Step order and descriptions
- Field types and options
- Conditional field logic

### Camunda Configuration
Default admin user in `application.yml`:
```yaml
camunda:
  bpm:
    admin-user:
      id: admin
      password: admin
```

## 📖 Documentation

### Main Documentation
- `README.md` - This file (project overview)
- `API_ENDPOINTS.md` - Complete API documentation
- `TESTING_GUIDE.md` - Step-by-step testing instructions
- `WORKFLOW_GUIDE.md` - Detailed workflow documentation

### Technical Documentation
- `IMPLEMENTATION_COMPLETE.md` - Complete implementation details
- `IMPROVEMENTS_SUMMARY.md` - Before/After comparison
- `WORKFLOW_DIAGRAM.txt` - Visual workflow diagram
- `QUICK_REFERENCE.md` - Quick reference card

### Fix Documentation
- `SYNC_FIX_SUMMARY.md` - Camunda sync mechanism
- `DASHBOARD_PERSISTENCE_FIX.md` - Dashboard persistence solution
- `HEAD_HR_STATUS_FIX.md` - Head HR status fix details

### Other Documentation
- `DEPENDENCIES_CHECK.md` - Dependencies and requirements
- `task_requirements.md` - Original project requirements
- `DASHBOARD_LINKS.md` - Dashboard URLs reference

## 🧪 Testing

### Manual Testing
See `TESTING_GUIDE.md` for complete step-by-step testing instructions.

### Automated Testing
The application includes comprehensive testing capabilities:
- Unit tests for services and controllers
- Integration tests for API endpoints
- Camunda process testing with camunda-bpm-assert

Run tests with:
```bash
mvn test
```

### API Testing
Use the provided curl commands or import into Postman:
```bash
# Get all applications
curl http://localhost:8082/api/job-applications/all

# Manual sync with Camunda
curl http://localhost:8082/api/job-applications/sync

# Get workflow definition
curl http://localhost:8082/api/job-applications/workflow-definition
```

## 🌐 Deployment

### Development
```bash
mvn spring-boot:run
```

### Production
1. Update `application.yml` with production database settings:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/recruitment_db
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

2. Build the application:
```bash
mvn clean package
```

3. Run the JAR:
```bash
java -jar target/job-recruitment-workflow-0.0.1-SNAPSHOT.jar
```

### Docker (Optional)
Create a `Dockerfile`:
```dockerfile
FROM openjdk:11-jre-slim
COPY target/job-recruitment-workflow-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app.jar"]
```

Build and run:
```bash
docker build -t recruitment-workflow .
docker run -p 8082:8082 recruitment-workflow
```

## 🎓 Learning Outcomes

This project demonstrates:
- ✅ **BPMN 2.0** - Complete workflow modeling
- ✅ **Parallel Gateway** - Simultaneous task execution
- ✅ **Exclusive Gateway** - Decision-based routing
- ✅ **Service Tasks** - Automated task execution
- ✅ **User Tasks** - Human task assignment
- ✅ **Process Variables** - Data flow through workflow
- ✅ **Multi-level Approval** - Complex approval chains
- ✅ **Role-based Access** - Task assignment by role
- ✅ **Dynamic Forms** - JSON-driven UI generation
- ✅ **Real-time Sync** - Camunda and application data sync

## 🚀 Key Improvements

### Multi-Level Approval
- Added Team Lead and Project Manager review stages
- Implemented parallel gateway for simultaneous reviews
- Added Head HR final decision stage
- Complete audit trail with all decisions and comments

### Dashboard Enhancements
- Created 3 new dashboards (TL, PM, Head HR)
- Consistent professional styling across all dashboards
- Dynamic status badges (Pending/Approved/Rejected)
- Applications persist after review (complete history)
- Review comments visible to each reviewer
- Accurate statistics (Pending vs. Reviewed)

### Camunda Integration
- Real-time sync between Camunda and application
- Process variables synced automatically
- Manual sync option for debugging
- Support for both active and completed processes

## 🤝 Contributing

This is an educational project. Feel free to:
- Fork the repository
- Create feature branches
- Submit pull requests
- Report issues
- Suggest improvements

## 📝 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- Spring Boot team for the excellent framework
- Camunda team for the powerful BPM engine
- All contributors and testers

## 📞 Support

For questions or issues:
1. Check the documentation in the `docs/` folder
2. Review `TESTING_GUIDE.md` for common issues
3. Check browser console (F12) for JavaScript errors
4. Check application logs for Java errors
5. Use "Force Sync" button on Head HR dashboard for sync issues

---

**Built with ❤️ using Spring Boot and Camunda BPM**

**Status**: ✅ Production-Ready | 🎯 Enterprise-Grade | 🚀 Fully Functional