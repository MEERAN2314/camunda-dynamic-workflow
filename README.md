# Job Recruitment Workflow - Dynamic Workflow Module

A Spring Boot application with Camunda BPM integration for dynamic job recruitment workflows.

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
- **Frontend**: http://localhost:8082/
- **HR Dashboard**: http://localhost:8082/hr-dashboard.html
- **Camunda Cockpit**: http://localhost:8082/camunda/app/cockpit/default/ (admin/admin)
- **Camunda Tasklist**: http://localhost:8082/camunda/app/tasklist/default/ (admin/admin)
- **API Health**: http://localhost:8082/api/job-applications/health

## 📋 API Testing

### Quick Test with curl:
```bash
# Health check
curl http://localhost:8082/api/job-applications/health

# Start new application
curl -X POST http://localhost:8082/api/job-applications/start

# Get workflow definition
curl http://localhost:8082/api/job-applications/workflow-definition
```

### Postman Testing
See `API_ENDPOINTS.md` for complete API documentation and testing examples.

## 🎯 Features

- **Dynamic Workflow**: JSON-driven multi-step forms
- **Camunda Integration**: Full BPMN workflow lifecycle with HR review process
- **HR Dashboard**: Dedicated interface for HR to review applications
- **Indian Job Market**: Tailored for Indian recruitment process
- **Responsive UI**: Works on desktop and mobile
- **Real-time Validation**: Client and server-side validation
- **Process Monitoring**: Camunda Cockpit integration
- **Decision Workflow**: Accept/Reject workflow with automated notifications

## 🏗️ Architecture

- **Backend**: Spring Boot 2.6.15 + Camunda BPM 7.18
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Database**: H2 (development) / PostgreSQL (production ready)
- **Process Engine**: Camunda BPM embedded

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/dynamicworkflow/
│   │   ├── controller/          # REST API controllers
│   │   ├── service/             # Business logic
│   │   ├── model/               # Data models
│   │   ├── dto/                 # Data transfer objects
│   │   ├── delegate/            # Camunda delegates
│   │   └── config/              # Configuration classes
│   └── resources/
│       ├── static/              # Frontend files
│       ├── processes/           # BPMN files
│       └── workflow-definition.json
```

## 🔧 Configuration

The application runs on **port 8082** by default. You can change this in `application.yml`:

```yaml
server:
  port: 8082
```

## 📖 Documentation

- `API_ENDPOINTS.md` - Complete API documentation
- `DEPENDENCIES_CHECK.md` - Dependencies and requirements
- `task_requirements.md` - Original project requirements

## 🧪 Testing

The application includes comprehensive testing capabilities:
- Unit tests for services and controllers
- Integration tests for API endpoints
- Camunda process testing with camunda-bpm-assert

Run tests with:
```bash
mvn test
```

## 🌐 Deployment

For production deployment:
1. Update `application.yml` with production database settings
2. Build the application: `mvn clean package`
3. Run the JAR: `java -jar target/job-recruitment-workflow-0.0.1-SNAPSHOT.jar`

## 📝 License

This project is for educational and demonstration purposes.