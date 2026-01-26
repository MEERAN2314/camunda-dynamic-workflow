# Troubleshooting Guide

## Common Issues and Solutions

### 1. ServletContextListener ClassNotFoundException

**Error**: `java.lang.NoClassDefFoundError: jakarta/servlet/ServletContextListener`

**Solution**: This was fixed by:
- Downgrading Spring Boot from 2.7.18 to 2.6.15
- Downgrading Camunda from 7.20.0 to 7.18.0
- Adding explicit `javax.servlet-api` dependency

**Why**: Camunda 7.x still uses the older `javax.servlet` API, while newer Spring Boot versions use `jakarta.servlet`.

### 2. Port Already in Use

**Error**: `Port 8082 was already in use`

**Solutions**:
```bash
# Option 1: Kill process using the port
lsof -ti:8082 | xargs kill -9

# Option 2: Use a different port
# Edit application.yml and change server.port to 8083 or another port

# Option 3: Run with different port
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8083
```

### 3. Maven Build Issues

**Error**: `Failed to execute goal`

**Solutions**:
```bash
# Clean and rebuild
mvn clean install

# Skip tests if needed
mvn clean install -DskipTests

# Force update dependencies
mvn clean install -U
```

### 4. H2 Database Connection Issues

**Error**: Database connection problems

**Solutions**:
- Check if H2 console is accessible at http://localhost:8082/h2-console
- Verify JDBC URL: `jdbc:h2:mem:camunda-db`
- Username: `sa`, Password: (empty)

### 5. Camunda Web Apps Not Loading

**Error**: 404 when accessing Camunda Cockpit

**Solutions**:
- Ensure `camunda-bpm-spring-boot-starter-webapp` dependency is included
- Check if application started successfully
- Verify URL: http://localhost:8082/camunda/app/cockpit/default/
- Default credentials: admin/admin

### 6. JSON Workflow Definition Not Loading

**Error**: `Failed to load workflow definition`

**Solutions**:
- Check if `workflow-definition.json` exists in `src/main/resources/`
- Verify JSON syntax is valid
- Check application logs for detailed error messages

### 7. CORS Issues (Frontend to Backend)

**Error**: Cross-origin request blocked

**Solutions**:
- `@CrossOrigin(origins = "*")` is already added to controllers
- For production, specify exact origins instead of "*"

### 8. Memory Issues

**Error**: OutOfMemoryError

**Solutions**:
```bash
# Increase JVM memory
export MAVEN_OPTS="-Xmx1024m -XX:MaxPermSize=256m"
mvn spring-boot:run

# Or run with specific memory settings
java -Xmx1024m -jar target/job-recruitment-workflow-0.0.1-SNAPSHOT.jar
```

## Version Compatibility Matrix

| Spring Boot | Camunda BPM | Java | Status |
|-------------|-------------|------|--------|
| 2.6.15      | 7.18.0      | 11+  | ✅ Recommended |
| 2.7.x       | 7.19.0+     | 11+  | ⚠️ May have issues |
| 3.x         | 7.20.0+     | 17+  | ❌ Not compatible |

## Debugging Tips

### 1. Enable Debug Logging
Add to `application.yml`:
```yaml
logging:
  level:
    com.dynamicworkflow: DEBUG
    org.camunda: DEBUG
    org.springframework: DEBUG
```

### 2. Check Application Health
```bash
curl http://localhost:8082/api/job-applications/health
```

### 3. Monitor Process Instances
- Access Camunda Cockpit: http://localhost:8082/camunda/app/cockpit/default/
- Check running process instances
- View process variables

### 4. Database Inspection
- H2 Console: http://localhost:8082/h2-console
- Check tables: `ACT_*` (Camunda tables)
- View process data and variables

## Performance Optimization

### 1. Database Connection Pool
For production, add HikariCP configuration:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

### 2. Camunda Job Executor
```yaml
camunda:
  bpm:
    job-execution:
      enabled: true
      core-pool-size: 3
      max-pool-size: 10
```

## Getting Help

1. **Check Logs**: Always check application logs first
2. **Camunda Documentation**: https://docs.camunda.org/
3. **Spring Boot Documentation**: https://spring.io/projects/spring-boot
4. **GitHub Issues**: Create an issue with full error logs and steps to reproduce

## Quick Recovery Commands

```bash
# Complete reset
mvn clean
rm -rf target/
mvn clean install
mvn spring-boot:run

# Check if everything is working
curl http://localhost:8082/api/job-applications/health
curl http://localhost:8082/api/job-applications/workflow-definition
```