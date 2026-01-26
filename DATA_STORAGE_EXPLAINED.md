# Data Storage Explained - How Application Data is Stored

## Your Question: Is Data Stored as Cache?

**Short Answer:** The application data is stored in **TWO places**:
1. **In-Memory (ConcurrentHashMap)** - Like a cache, but not exactly
2. **H2 Database** - For Camunda process data

Let me explain in detail!

---

## 1. Application Data Storage (In-Memory)

### What We Use: ConcurrentHashMap

**Location:** `JobApplicationService.java`

```java
@Service
public class JobApplicationService {
    
    // In-memory storage for application data
    private final Map<String, Map<String, Object>> applicationDataStore = 
        new ConcurrentHashMap<>();
    
    private final Map<String, String> applicationStatusStore = 
        new ConcurrentHashMap<>();
}
```

### What is ConcurrentHashMap?

**ConcurrentHashMap** is a Java data structure that:
- Stores data in memory (RAM)
- Key-Value pairs: `applicationId → application data`
- Thread-safe (multiple users can access simultaneously)
- Fast access (no database query needed)

**Example:**
```java
// Storing data
Map<String, Object> applicationData = new HashMap<>();
applicationData.put("firstName", "John");
applicationData.put("lastName", "Doe");
applicationData.put("email", "john@example.com");

applicationDataStore.put("APP-123", applicationData);

// Retrieving data
Map<String, Object> data = applicationDataStore.get("APP-123");
String firstName = (String) data.get("firstName");  // "John"
```

### Is This a Cache?

**Not exactly!** Here's the difference:

#### Cache
- Temporary storage
- Can be cleared/evicted
- Usually has expiration time
- Backup data exists elsewhere
- Used for performance optimization

#### Our ConcurrentHashMap
- Primary storage for application data
- No expiration time
- No backup (data lost on restart)
- Used as main data store
- **More like in-memory database**

### What Data is Stored Here?

```java
{
  "APP-1234567890-ABCD1234": {
    "applicationId": "APP-1234567890-ABCD1234",
    "applicationStatus": "PENDING_HR_REVIEW",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "mobileNumber": "9876543210",
    "dateOfBirth": "1995-05-15",
    "gender": "male",
    "position": "software-engineer",
    "expectedSalaryCTC": 12.5,
    "noticePeriod": "1-month",
    "totalExperience": 5,
    "highestEducation": "btech-be",
    "skills": ["java", "spring-boot", "javascript"],
    "submissionTimestamp": "2025-01-27T10:30:00",
    "processInstanceId": "process-123",
    "hrDecision": "accept",
    "hrComments": "Good candidate",
    "tlDecision": "accept",
    "tlComments": "Strong technical skills",
    "pmDecision": "accept",
    "pmComments": "Good fit for projects"
  }
}
```

### Advantages of In-Memory Storage

✅ **Very Fast**
- No database query
- Direct memory access
- Instant retrieval

✅ **Simple**
- No database schema needed
- No SQL queries
- Easy to implement

✅ **Good for Development**
- Quick prototyping
- No database setup
- Easy testing

### Disadvantages of In-Memory Storage

❌ **Data Lost on Restart**
- If you restart the application, all data is gone
- No persistence

❌ **Limited by RAM**
- Can't store millions of applications
- Memory constraints

❌ **Single Server Only**
- Can't scale to multiple servers
- No data sharing between instances

---

## 2. Camunda Process Data Storage (H2 Database)

### What is H2 Database?

**H2** is an in-memory relational database that:
- Stores data in memory (like ConcurrentHashMap)
- But also supports disk persistence
- SQL-based
- Embedded in application

**Configuration in `application.yml`:**
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:camunda-db
    driver-class-name: org.h2.Driver
    username: sa
    password: 
```

### What Camunda Stores in H2

Camunda automatically creates these tables:

```
ACT_RE_*  - Repository (Process Definitions)
├── ACT_RE_DEPLOYMENT      - BPMN deployments
├── ACT_RE_PROCDEF         - Process definitions
└── ACT_RE_DECISION_DEF    - Decision definitions

ACT_RU_*  - Runtime (Active Processes)
├── ACT_RU_EXECUTION       - Process instances
├── ACT_RU_TASK            - Active tasks
├── ACT_RU_VARIABLE        - Process variables
└── ACT_RU_JOB             - Jobs/timers

ACT_HI_*  - History (Completed Processes)
├── ACT_HI_PROCINST        - Historical process instances
├── ACT_HI_TASKINST        - Historical tasks
├── ACT_HI_VARINST         - Historical variables
└── ACT_HI_ACTINST         - Historical activities
```

### What Data is Stored in H2?

**1. Process Definitions**
- BPMN XML content
- Process ID, version
- Deployment information

**2. Process Instances**
- Running workflows
- Process state
- Current activity

**3. Process Variables**
```sql
-- Example data in ACT_RU_VARIABLE table
ID_  | PROC_INST_ID_ | NAME_           | TEXT_
-----|---------------|-----------------|------------------
1    | process-123   | applicationId   | APP-123
2    | process-123   | firstName       | John
3    | process-123   | hrDecision      | accept
4    | process-123   | tlDecision      | accept
5    | process-123   | pmDecision      | accept
```

**4. Tasks**
- User tasks (HR Review, TL Review, etc.)
- Task assignees
- Task state (active/completed)

**5. History**
- Completed processes
- Completed tasks
- Historical variables

### H2 Console

You can view the database at: http://localhost:8082/h2-console

**Login:**
- JDBC URL: `jdbc:h2:mem:camunda-db`
- Username: `sa`
- Password: (empty)

**Query Example:**
```sql
-- View all process instances
SELECT * FROM ACT_RU_EXECUTION;

-- View all process variables
SELECT * FROM ACT_RU_VARIABLE;

-- View all active tasks
SELECT * FROM ACT_RU_TASK;
```

---

## 3. Complete Data Flow

### When You Submit Application

```
User Submits Form
        ↓
Frontend sends JSON to Backend
        ↓
Controller receives request
        ↓
Service processes data
        ↓
┌───────────────────────────────────────┐
│  Data is stored in TWO places:        │
│                                       │
│  1. ConcurrentHashMap (In-Memory)    │
│     - Application data                │
│     - Quick access for dashboards     │
│                                       │
│  2. H2 Database (Camunda)             │
│     - Process instance                │
│     - Process variables               │
│     - Task information                │
└───────────────────────────────────────┘
```

### Storage Diagram

```
┌─────────────────────────────────────────────────────┐
│           Java Application (JVM Memory)              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  ConcurrentHashMap (In-Memory)             │    │
│  │  ┌──────────────────────────────────────┐  │    │
│  │  │ APP-123 → {                          │  │    │
│  │  │   firstName: "John",                 │  │    │
│  │  │   lastName: "Doe",                   │  │    │
│  │  │   email: "john@example.com",         │  │    │
│  │  │   hrDecision: "accept",              │  │    │
│  │  │   tlDecision: "accept",              │  │    │
│  │  │   ...                                │  │    │
│  │  │ }                                    │  │    │
│  │  └──────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │  H2 Database (In-Memory)                   │    │
│  │  ┌──────────────────────────────────────┐  │    │
│  │  │ Camunda Tables:                      │  │    │
│  │  │ - ACT_RU_EXECUTION (processes)       │  │    │
│  │  │ - ACT_RU_VARIABLE (variables)        │  │    │
│  │  │ - ACT_RU_TASK (tasks)                │  │    │
│  │  │ - ACT_HI_PROCINST (history)          │  │    │
│  │  └──────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 4. Why Two Storage Locations?

### ConcurrentHashMap (Application Data)

**Purpose:**
- Store complete application data
- Quick access for dashboards
- No need to query Camunda

**Used by:**
- HR Dashboard
- Team Lead Dashboard
- Project Manager Dashboard
- Head HR Dashboard
- REST API endpoints

**Example:**
```java
// Quick retrieval for dashboard
Map<String, Object> appData = applicationDataStore.get("APP-123");
String firstName = (String) appData.get("firstName");
```

### H2 Database (Camunda Data)

**Purpose:**
- Store process state
- Track workflow progress
- Manage tasks
- Store process variables

**Used by:**
- Camunda Process Engine
- Camunda Tasklist
- Camunda Cockpit
- Process execution

**Example:**
```java
// Camunda stores and retrieves variables
runtimeService.setVariable(processInstanceId, "hrDecision", "accept");
String decision = (String) runtimeService.getVariable(processInstanceId, "hrDecision");
```

---

## 5. Data Synchronization

### The Problem

Data exists in two places:
- Application data in ConcurrentHashMap
- Process variables in H2 Database

They can get out of sync!

### The Solution: Sync Method

**File:** `JobApplicationService.java`

```java
private void syncApplicationStatusWithCamunda() {
    // Get all active processes from Camunda
    List<ProcessInstance> processes = runtimeService.createProcessInstanceQuery()
        .processDefinitionKey("job-recruitment-workflow-india")
        .active()
        .list();
    
    for (ProcessInstance process : processes) {
        String applicationId = process.getBusinessKey();
        
        // Get process variables from Camunda (H2)
        Map<String, Object> processVariables = 
            runtimeService.getVariables(process.getId());
        
        // Get application data from ConcurrentHashMap
        Map<String, Object> appData = applicationDataStore.get(applicationId);
        
        // Sync: Copy from Camunda to ConcurrentHashMap
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

**When Sync Happens:**
- Every time `/api/job-applications/all` is called
- Dashboards auto-refresh every 10 seconds
- Manual sync with "Force Sync" button

---

## 6. What Happens on Application Restart?

### Data Loss

```
Application Running
├── ConcurrentHashMap: Has all application data ✅
└── H2 Database: Has all Camunda data ✅

Application Restart
├── ConcurrentHashMap: EMPTY ❌ (data lost)
└── H2 Database: EMPTY ❌ (in-memory, data lost)

Application Started Again
├── ConcurrentHashMap: EMPTY (no data)
└── H2 Database: EMPTY (no data)
```

**Both are in-memory, so both lose data on restart!**



---

## 7. Production-Ready Storage (How to Make it Persistent)

### Current Setup (Development)

```
┌─────────────────────────────────────┐
│  In-Memory Storage (Temporary)      │
│  - ConcurrentHashMap                │
│  - H2 Database (in-memory)          │
│  ❌ Data lost on restart            │
└─────────────────────────────────────┘
```

### Production Setup (Persistent)

```
┌─────────────────────────────────────┐
│  Persistent Storage (Permanent)     │
│  - PostgreSQL/MySQL Database        │
│  - File System / Cloud Storage      │
│  ✅ Data survives restart           │
└─────────────────────────────────────┘
```

### Option 1: Use PostgreSQL for Camunda

**Update `application.yml`:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/recruitment_db
    driver-class-name: org.postgresql.Driver
    username: postgres
    password: your_password
  jpa:
    database-platform: org.hibernate.dialect.PostgreSQLDialect
    hibernate:
      ddl-auto: update
```

**Add PostgreSQL dependency in `pom.xml`:**
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```

**Result:**
- Camunda data stored in PostgreSQL (persistent)
- Data survives application restart
- Can handle production load

### Option 2: Add JPA Entities for Application Data

**Create Entity:**
```java
@Entity
@Table(name = "job_applications")
public class JobApplication {
    
    @Id
    private String applicationId;
    
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    
    @Column(columnDefinition = "TEXT")
    private String applicationData;  // Store as JSON
    
    private String status;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
    
    // Getters and setters
}
```

**Create Repository:**
```java
@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, String> {
    List<JobApplication> findByStatus(String status);
}
```

**Update Service:**
```java
@Service
public class JobApplicationService {
    
    private final JobApplicationRepository repository;
    
    public ApplicationResponse startApplication() {
        // Create entity
        JobApplication application = new JobApplication();
        application.setApplicationId(generateApplicationId());
        application.setStatus("STARTED");
        
        // Save to database
        repository.save(application);
        
        // Also start Camunda process
        // ...
    }
}
```

**Result:**
- Application data stored in database (persistent)
- Data survives application restart
- Can query and report on data

### Option 3: Hybrid Approach (Recommended for Production)

```
┌─────────────────────────────────────────────────────┐
│  Application Layer                                   │
│  ┌────────────────────────────────────────────┐    │
│  │  ConcurrentHashMap (Cache)                 │    │
│  │  - Fast access                             │    │
│  │  - Temporary storage                       │    │
│  └────────────────┬───────────────────────────┘    │
│                   │                                  │
│                   ↓ Sync                             │
│  ┌────────────────────────────────────────────┐    │
│  │  PostgreSQL Database (Persistent)          │    │
│  │  - Application data (JPA entities)         │    │
│  │  - Camunda data (process tables)           │    │
│  │  - Survives restart                        │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Benefits:**
- Fast access (cache)
- Persistent storage (database)
- Best of both worlds

---

## 8. Comparison: Cache vs In-Memory vs Database

### Cache (e.g., Redis, Memcached)

```
Purpose: Speed up data access
Storage: In-memory (RAM)
Persistence: Optional (can be configured)
Expiration: Yes (TTL - Time To Live)
Use Case: Temporary storage, frequently accessed data
Example: Session data, API responses
```

**Example:**
```java
@Cacheable("applications")
public Application getApplication(String id) {
    // First call: Query database (slow)
    // Subsequent calls: Return from cache (fast)
    return repository.findById(id);
}
```

### In-Memory Storage (Our ConcurrentHashMap)

```
Purpose: Primary data storage (in our case)
Storage: In-memory (RAM)
Persistence: No
Expiration: No (until restart)
Use Case: Development, prototyping, small datasets
Example: Our application data
```

**Example:**
```java
Map<String, Object> data = new HashMap<>();
data.put("name", "John");
applicationDataStore.put("APP-123", data);
```

### Database (e.g., PostgreSQL, MySQL)

```
Purpose: Persistent data storage
Storage: Disk (HDD/SSD)
Persistence: Yes
Expiration: No (manual deletion)
Use Case: Production, large datasets, critical data
Example: User accounts, transactions, records
```

**Example:**
```java
@Entity
public class Application {
    @Id
    private String id;
    private String name;
}

repository.save(application);  // Saved to disk
```

---

## 9. Summary Table

| Feature | ConcurrentHashMap | H2 (In-Memory) | PostgreSQL |
|---------|-------------------|----------------|------------|
| **Storage Location** | RAM | RAM | Disk |
| **Persistence** | ❌ No | ❌ No | ✅ Yes |
| **Speed** | ⚡ Very Fast | ⚡ Fast | 🐢 Slower |
| **Survives Restart** | ❌ No | ❌ No | ✅ Yes |
| **Scalability** | ❌ Limited | ❌ Limited | ✅ High |
| **Query Support** | ❌ No | ✅ SQL | ✅ SQL |
| **Use Case** | Development | Development | Production |
| **Our Usage** | Application data | Camunda data | Not used (yet) |

---

## 10. Frequently Asked Questions

### Q1: Is the data stored as cache?

**A:** Not exactly. It's stored in **in-memory data structures** (ConcurrentHashMap and H2 database), which are similar to cache but serve as the primary storage, not temporary cache.

### Q2: What happens if I restart the application?

**A:** All data is lost because both ConcurrentHashMap and H2 (in-memory mode) store data in RAM, which is cleared on restart.

### Q3: How can I make data persistent?

**A:** Switch to a persistent database like PostgreSQL or MySQL, and optionally add JPA entities for application data.

### Q4: Why use in-memory storage?

**A:** 
- ✅ Simple for development and prototyping
- ✅ Very fast
- ✅ No database setup required
- ✅ Good for learning and demos

### Q5: Is this production-ready?

**A:** The current in-memory setup is **NOT production-ready**. For production, you should:
1. Use PostgreSQL/MySQL instead of H2
2. Add JPA entities for application data
3. Implement proper data persistence
4. Add backup and recovery mechanisms

### Q6: Where is Camunda data stored?

**A:** Camunda stores its data (process instances, tasks, variables) in the H2 database, which is in-memory by default.

### Q7: Can I see the data?

**A:** Yes!
- **ConcurrentHashMap**: Call `/api/job-applications/all` to see JSON
- **H2 Database**: Access H2 Console at http://localhost:8082/h2-console

### Q8: How much data can I store?

**A:** Limited by available RAM. For production with many applications, use a persistent database.

---

## 11. Visual Summary

### Current Architecture (Development)

```
┌─────────────────────────────────────────────────┐
│         Application (JVM Process)                │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Application Data                      │    │
│  │  ConcurrentHashMap (In-Memory)         │    │
│  │  ❌ Lost on restart                    │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Camunda Data                          │    │
│  │  H2 Database (In-Memory)               │    │
│  │  ❌ Lost on restart                    │    │
│  └────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Production Architecture (Recommended)

```
┌─────────────────────────────────────────────────┐
│         Application (JVM Process)                │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Application Cache (Optional)          │    │
│  │  ConcurrentHashMap                     │    │
│  │  ⚡ Fast access                        │    │
│  └────────────────┬───────────────────────┘    │
│                   │                              │
└───────────────────┼──────────────────────────────┘
                    │
                    ↓ Reads/Writes
┌─────────────────────────────────────────────────┐
│         PostgreSQL Database (Disk)               │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Application Data Tables               │    │
│  │  - job_applications                    │    │
│  │  - applicant_details                   │    │
│  │  ✅ Persistent                         │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │  Camunda Data Tables                   │    │
│  │  - ACT_RU_EXECUTION                    │    │
│  │  - ACT_RU_TASK                         │    │
│  │  - ACT_RU_VARIABLE                     │    │
│  │  ✅ Persistent                         │    │
│  └────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## Conclusion

**To answer your question:**

The data is stored in **in-memory data structures** (ConcurrentHashMap and H2 database), which are:
- Similar to cache (in RAM)
- But used as primary storage (not temporary cache)
- Fast but not persistent (lost on restart)
- Good for development, not for production

For production, you should migrate to a persistent database like PostgreSQL!

---

**Need help migrating to persistent storage? Let me know!**
