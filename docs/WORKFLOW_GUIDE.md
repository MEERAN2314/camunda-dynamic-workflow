# Multi-Level Approval Workflow Guide

## Overview

This document describes the enhanced multi-level approval workflow for the job recruitment system. The workflow implements a comprehensive approval process with parallel reviews and multiple decision gates.

## Workflow Stages

### Stage 1: Application Submission
**User Tasks: 3 Steps**

1. **Personal Information**
   - First Name, Last Name
   - Email, Mobile Number
   - Date of Birth, Gender

2. **Job Preferences**
   - Position Applied For
   - Expected CTC (Annual in Lakhs)
   - Notice Period

3. **Experience & Education**
   - Total Years of Experience
   - Highest Education Level
   - Technical Skills

**Status**: `STARTED` → `IN_PROGRESS` → `PENDING_HR_REVIEW`

---

### Stage 2: Data Collection
**Service Task: Automated**

- Collects all applicant data
- Formats data for HR review
- Prepares process variables for BPMN workflow

---

### Stage 3: HR Review (First Gate)
**User Task: HR Dashboard**

**Access**: http://localhost:8082/hr-dashboard.html

**Decision Options**:
- ✅ **Accept**: Application moves to parallel review
- ❌ **Reject**: Application rejected immediately

**Form Fields**:
- Decision: Accept/Reject
- HR Comments (required)
- Interview Required? (boolean)

**Outcomes**:
- **If Accepted**: → Parallel Gateway (TL & PM Review)
- **If Rejected**: → Send Rejection Notification → End

**Status**: `PENDING_HR_REVIEW` → `HR_APPROVED` or `REJECTED_BY_HR`

---

### Stage 4: Parallel Review (Second Gate)
**Parallel Gateway: Two Simultaneous Reviews**

#### 4A. Team Lead Review
**User Task: Team Lead Dashboard**

**Access**: http://localhost:8082/teamlead-dashboard.html

**Decision Options**:
- ✅ **Accept**: Technical skills approved
- ❌ **Reject**: Technical skills insufficient

**Form Fields**:
- TL Decision: Accept/Reject
- TL Comments

**Candidate Groups**: `teamlead`

---

#### 4B. Project Manager Review
**User Task: Project Manager Dashboard**

**Access**: http://localhost:8082/projectmanager-dashboard.html

**Decision Options**:
- ✅ **Accept**: Good project fit
- ❌ **Reject**: Not suitable for projects

**Form Fields**:
- PM Decision: Accept/Reject
- PM Comments

**Candidate Groups**: `projectmanager`

---

**Parallel Join Logic**:
- Both TL and PM reviews must complete
- System checks both decisions

**Exclusive Gateway Decision**:
```
IF (tlDecision == 'accept' AND pmDecision == 'accept')
    → Proceed to Head HR Review
ELSE IF (tlDecision == 'reject' OR pmDecision == 'reject')
    → Send Rejection Notification → End
```

**Status**: `HR_APPROVED` → `PENDING_HEAD_HR_REVIEW` or `REJECTED_BY_TL_PM`

---

### Stage 5: Head HR Final Review (Final Gate)
**User Task: Head HR Dashboard**

**Access**: http://localhost:8082/headhr-dashboard.html

**Decision Options**:
- ✅ **Accept - Hire Candidate**: Final approval
- ❌ **Reject Application**: Final rejection

**Form Fields**:
- Head HR Decision: Accept/Reject
- Head HR Comments
- Offer CTC (in Lakhs) - for accepted candidates

**Candidate Groups**: `headhr`

**Available Information**:
- All applicant details
- HR comments and decision
- Team Lead comments and decision
- Project Manager comments and decision

**Outcomes**:
- **If Accepted**: → Store Application Data → Success End
- **If Rejected**: → Send Rejection Notification → End

**Status**: `PENDING_HEAD_HR_REVIEW` → `ACCEPTED` or `REJECTED_BY_HEAD_HR`

---

## Decision Flow Summary

```
Application Submitted
        ↓
   Data Collection
        ↓
    HR Review
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
     End      Head HR Review
                    ↓
            [Head HR Decision?]
             ↙            ↘
          Reject        Accept
            ↓              ↓
           End      Store & Success
```

---

## Rejection Points

The application can be rejected at three points:

1. **HR Rejection**
   - Reason: Initial screening failed
   - Notification: "Rejected by HR"
   - Status: `REJECTED_BY_HR`

2. **TL/PM Rejection**
   - Reason: Either Team Lead OR Project Manager rejected
   - Notification: "Rejected by Team Lead/Project Manager"
   - Status: `REJECTED_BY_TL_PM`

3. **Head HR Rejection**
   - Reason: Final decision to not hire
   - Notification: "Rejected by Head HR"
   - Status: `REJECTED_BY_HEAD_HR`

---

## Approval Requirements

For an application to be **ACCEPTED**:

✅ HR must approve
✅ Team Lead must approve
✅ Project Manager must approve
✅ Head HR must approve

**All four approvals are required for hiring.**

---

## Camunda User Groups

Configure these user groups in Camunda for proper task assignment:

- `hr` - HR personnel
- `managers` - HR managers
- `teamlead` - Team leads
- `projectmanager` - Project managers
- `headhr` - Head HR personnel

---

## Dashboard Access Summary

| Role | Dashboard URL | Purpose |
|------|--------------|---------|
| Applicant | `/index.html` | Submit application |
| HR | `/hr-dashboard.html` | Initial screening |
| Team Lead | `/teamlead-dashboard.html` | Technical review |
| Project Manager | `/projectmanager-dashboard.html` | Project fit review |
| Head HR | `/headhr-dashboard.html` | Final hiring decision |

---

## Process Variables

Key process variables used in the workflow:

- `applicationId` - Unique application identifier
- `hrDecision` - HR decision (accept/reject)
- `hrComments` - HR comments
- `interviewRequired` - Interview flag
- `tlDecision` - Team Lead decision
- `tlComments` - Team Lead comments
- `pmDecision` - Project Manager decision
- `pmComments` - Project Manager comments
- `headHRDecision` - Head HR decision
- `headHRComments` - Head HR comments
- `offerCTC` - Offered CTC amount
- `firstName`, `lastName`, `email`, etc. - Applicant data

---

## Benefits of This Workflow

1. **Multi-Level Validation**: Multiple checkpoints ensure quality hires
2. **Parallel Efficiency**: TL and PM review simultaneously, saving time
3. **Clear Accountability**: Each role has specific responsibilities
4. **Audit Trail**: Complete history of all decisions and comments
5. **Flexibility**: Head HR can override if needed
6. **Fail-Fast**: Early rejection saves time for all parties
7. **Comprehensive Review**: Technical, project fit, and strategic alignment all considered

---

## Testing the Workflow

1. Start application: `POST /api/job-applications/start`
2. Complete all 3 steps
3. HR reviews in dashboard → Accept
4. TL reviews in dashboard → Accept
5. PM reviews in dashboard → Accept
6. Head HR reviews in dashboard → Accept/Reject
7. Check final status in Camunda Cockpit

---

## Monitoring

Use Camunda Cockpit to monitor:
- Active process instances
- Completed tasks
- Process variables
- Decision history
- Performance metrics

**Cockpit URL**: http://localhost:8082/camunda/app/cockpit/default/
