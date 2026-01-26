# Testing Guide - Multi-Level Approval Workflow

## Quick Test Steps

### Step 1: Start Application
```bash
mvn clean install
mvn spring-boot:run
```

Wait for: `Started JobRecruitmentWorkflowApplication`

---

### Step 2: Submit Application

1. Open: http://localhost:8082/
2. Fill **Personal Information**:
   - First Name: Meeran
   - Last Name: Ashfaaq
   - Email: meeran@example.com
   - Mobile: 9342854858
   - Date of Birth: 1995-05-15
   - Gender: Male
3. Click **Next**

4. Fill **Job Preferences**:
   - Position: Software Engineer
   - Expected CTC: 28 LPA
   - Notice Period: 1 Month
5. Click **Next**

6. Fill **Experience & Education**:
   - Experience: 4 Years
   - Education: B.Tech/B.E
   - Skills: Check Java, Spring Boot, JavaScript
7. Click **Submit Application**

**Note the Application ID** (e.g., APP-1234567890-ABCD1234)

---

### Step 3: HR Review

1. Open: http://localhost:8082/hr-dashboard.html
2. You should see your application
3. Click **"Review in Camunda Tasklist"**
4. Login to Camunda:
   - Username: `admin`
   - Password: `admin`
5. Click on the task "HR Application Review"
6. Fill the form:
   - Decision: **Accept Application**
   - HR Comments: "Strong candidate with good experience"
   - Interview Required: ✓ (checked)
7. Click **Complete**

---

### Step 4: Team Lead Review

1. Stay in Camunda Tasklist or refresh
2. You should see "Team Lead Review" task
3. Click on it
4. Fill the form:
   - Team Lead Decision: **Accept**
   - Team Lead Comments: "Excellent technical skills in Java and Spring Boot"
5. Click **Complete**

---

### Step 5: Project Manager Review

1. Stay in Camunda Tasklist or refresh
2. You should see "Project Manager Review" task
3. Click on it
4. Fill the form:
   - Project Manager Decision: **Accept**
   - Project Manager Comments: "Perfect fit for our microservices project"
5. Click **Complete**

---

### Step 6: Check Head HR Dashboard

1. Open: http://localhost:8082/headhr-dashboard.html
2. **If you don't see the application**, click **"Force Sync with Camunda"** button
3. You should now see the application with:
   - ✅ All applicant details
   - ✅ HR Comments
   - ✅ Previous Approvals section showing:
     - Team Lead: ✓ Approved - "Excellent technical skills..."
     - Project Manager: ✓ Approved - "Perfect fit for our microservices project"

---

### Step 7: Head HR Final Decision

1. From Head HR Dashboard, click **"Make Final Decision in Camunda"**
2. In Camunda Tasklist, find "Head HR Final Review" task
3. Click on it
4. Fill the form:
   - Head HR Final Decision: **Accept - Hire Candidate**
   - Head HR Comments: "Approved for hiring. Great addition to the team."
   - Offer CTC: 12.5
5. Click **Complete**

---

### Step 8: Verify Completion

1. Go to Camunda Cockpit: http://localhost:8082/camunda/app/cockpit/default/
2. Click on "Processes" → "job-recruitment-workflow-india"
3. You should see your process instance completed
4. Click on it to see the full process flow
5. Check "Variables" tab to see all decisions

---

## Verification Checklist

### ✅ HR Dashboard
- [ ] Shows application with status "Pending Review"
- [ ] Can click "Review in Camunda Tasklist"
- [ ] Application details are visible

### ✅ Team Lead Dashboard
- [ ] Shows application after HR approval
- [ ] Displays HR comments
- [ ] Shows all applicant details
- [ ] Can review in Camunda

### ✅ Project Manager Dashboard
- [ ] Shows application after HR approval
- [ ] Displays HR comments
- [ ] Shows all applicant details including skills
- [ ] Can review in Camunda

### ✅ Head HR Dashboard
- [ ] Shows application after TL & PM approval
- [ ] Displays all applicant details
- [ ] Shows HR comments
- [ ] Shows "Previous Approvals" section with:
  - [ ] Team Lead decision and comments
  - [ ] Project Manager decision and comments
- [ ] Can make final decision in Camunda

### ✅ Camunda Integration
- [ ] Process starts when application submitted
- [ ] HR task appears in Tasklist
- [ ] TL and PM tasks appear simultaneously (parallel)
- [ ] Head HR task appears after both TL & PM complete
- [ ] Process completes after Head HR decision
- [ ] All variables are stored correctly

---

## Common Issues & Solutions

### Issue 1: Head HR Dashboard Shows Empty

**Solution:**
1. Click **"Force Sync with Camunda"** button
2. Open browser console (F12) and check logs
3. Verify TL and PM tasks are completed in Camunda Tasklist

### Issue 2: Tasks Not Appearing in Camunda Tasklist

**Solution:**
1. Refresh the Tasklist page
2. Check you're logged in as `admin`
3. Verify process is running in Camunda Cockpit

### Issue 3: Application Not Showing in Dashboard

**Solution:**
1. Click "Refresh Applications" button
2. Check browser console for errors
3. Verify application was submitted successfully

### Issue 4: Can't Complete Task in Camunda

**Solution:**
1. Ensure all required fields are filled
2. Check for validation errors
3. Try refreshing the Tasklist page

---

## API Testing (Optional)

### Get All Applications
```bash
curl http://localhost:8082/api/job-applications/all | jq
```

### Manual Sync
```bash
curl http://localhost:8082/api/job-applications/sync
```

### Health Check
```bash
curl http://localhost:8082/api/job-applications/health
```

### Get Workflow Definition
```bash
curl http://localhost:8082/api/job-applications/workflow-definition | jq
```

---

## Dashboard URLs Quick Reference

| Dashboard | URL |
|-----------|-----|
| Applicant Portal | http://localhost:8082/ |
| HR Dashboard | http://localhost:8082/hr-dashboard.html |
| Team Lead Dashboard | http://localhost:8082/teamlead-dashboard.html |
| Project Manager Dashboard | http://localhost:8082/projectmanager-dashboard.html |
| Head HR Dashboard | http://localhost:8082/headhr-dashboard.html |
| Camunda Tasklist | http://localhost:8082/camunda/app/tasklist/default/ |
| Camunda Cockpit | http://localhost:8082/camunda/app/cockpit/default/ |

**Camunda Credentials:** admin / admin

---

## Expected Timeline

- **Application Submission:** 2 minutes
- **HR Review:** 1 minute
- **TL Review:** 1 minute (parallel with PM)
- **PM Review:** 1 minute (parallel with TL)
- **Head HR Review:** 1 minute
- **Total:** ~6 minutes for complete workflow

---

## Success Criteria

✅ Application flows through all stages
✅ All dashboards show correct data
✅ Parallel gateway works (TL & PM review simultaneously)
✅ Head HR sees all previous approvals
✅ Process completes successfully in Camunda
✅ All decisions are stored and visible

---

## Need Help?

1. Check `SYNC_FIX_SUMMARY.md` for sync issues
2. Check `WORKFLOW_GUIDE.md` for workflow details
3. Check `IMPLEMENTATION_COMPLETE.md` for complete documentation
4. Check browser console (F12) for JavaScript errors
5. Check application logs for Java errors

---

**Happy Testing! 🚀**
