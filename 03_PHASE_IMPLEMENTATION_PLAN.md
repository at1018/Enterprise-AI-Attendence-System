# AI Classroom Attendance Platform

# Phase Implementation Plan

**Document:** `03_PHASE_IMPLEMENTATION_PLAN.md`
**Version:** 1.0
**Status:** Development Baseline
**Audience:** Engineering Team, GitHub Copilot, Technical Reviewers
**Related Documents:**

* `docs/01_MASTER_DEVELOPMENT_INSTRUCTION.md`
* `docs/02_ARCHITECTURE_BASELINE.md`

---

# 1. Purpose

This document defines the implementation roadmap for the AI Classroom Attendance Platform.

The purpose of this document is to convert the approved architecture into a controlled, incremental development process.

The system MUST NOT be implemented as one large feature.

Development MUST proceed phase by phase.

Each phase has:

* A clearly defined objective
* Explicit dependencies
* Defined implementation scope
* Backend responsibilities
* Database responsibilities
* Frontend responsibilities
* AI/Edge responsibilities where applicable
* Security requirements
* Testing requirements
* Definition of Done
* Explicit out-of-scope functionality

GitHub Copilot and developers MUST implement only the current phase unless a dependency requires a minimal supporting change.

---

# 2. Source of Truth

The following document hierarchy MUST be followed:

```text
01_MASTER_DEVELOPMENT_INSTRUCTION.md
        ↓
02_ARCHITECTURE_BASELINE.md
        ↓
03_PHASE_IMPLEMENTATION_PLAN.md
        ↓
Current Phase Specification
        ↓
Source Code
```

If an implementation conflicts with the architecture baseline, the architecture baseline takes precedence.

If a phase requirement conflicts with a higher-level architecture decision, STOP and resolve the conflict before implementing.

---

# 3. Core Technology Decisions

The following technologies are locked for the MVP.

| Layer            | Technology                              |
| ---------------- | --------------------------------------- |
| Backend          | Node.js + TypeScript + Express.js       |
| Database         | PostgreSQL                              |
| ORM              | Prisma                                  |
| Frontend         | React + TypeScript + Vite               |
| Edge AI          | Python                                  |
| API              | REST                                    |
| Authentication   | Token-based authentication              |
| Testing          | Jest / appropriate Node.js testing tools                                  |
| Testing          | Jest / appropriate NestJS testing tools |
| Frontend Testing | Appropriate React testing framework     |
| Edge Testing     | Python testing framework                |

The project MUST NOT switch to another backend framework, ORM, database, or frontend framework without an approved architecture change.

---

# 4. Architecture Strategy

The application will initially use a modular monolith.

```text
                    ┌─────────────────────┐
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │
                               │ HTTPS / REST
                               ↓
                    ┌─────────────────────┐
                    │   NestJS Backend    │
                    │   Modular Monolith   │
                    └──────────┬──────────┘
                               │
                               ↓
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │ platform            │
                    │ school_a            │
                    │ school_b            │
                    │ school_c            │
                    └─────────────────────┘


      ┌─────────────────────┐
      │ CCTV / IP Camera    │
      └──────────┬──────────┘
                 ↓
      ┌─────────────────────┐
      │ Python Edge Agent   │
      │                     │
      │ Face Detection      │
      │ Recognition         │
      │ Evidence            │
      │ Local Queue         │
      └──────────┬──────────┘
                 │
                 │ Authenticated events
                 ↓
          NestJS Backend
```

---

# 5. Development Principles

All phases MUST follow these principles.

## 5.1 Incremental implementation

Do not implement the entire application in one phase.

## 5.2 No future feature leakage

A phase MUST NOT implement functionality belonging to later phases unless it is a minimal dependency.

## 5.3 Backend is authoritative

The frontend MUST NOT be trusted for:

* Tenant identity
* Role identity
* Permissions
* Database schema selection
* Attendance finalization authority

## 5.4 Tenant isolation is mandatory

Every tenant-aware operation MUST operate within the authenticated tenant context.

## 5.5 Teacher remains the final attendance authority

AI produces evidence and preliminary results.

The teacher produces the final decision.

## 5.6 System failure must not equal absence

Camera failure, AI failure, network failure, or Edge Agent failure MUST NOT automatically mark a student absent.

## 5.7 Test security continuously

Tenant isolation and authorization tests are not optional final-stage tests.

They must be introduced early and expanded throughout development.

---

# 6. Phase Overview

```text
PHASE 0
Project Foundation
        ↓
PHASE 1
Multi-Tenant Database Foundation
        ↓
PHASE 2
Authentication & RBAC
        ↓
PHASE 3
School / Academic Setup
        ↓
PHASE 4
Classroom / Camera / Timetable
        ↓
PHASE 5
Manual Attendance
        ↓
PHASE 6
Edge Agent Foundation
        ↓
PHASE 7
Face Enrollment & Recognition
        ↓
PHASE 8
Three-Checkpoint Automated Attendance
        ↓
PHASE 9
Teacher Review / Override / Audit
        ↓
PHASE 10
Reports & Dashboards
        ↓
PHASE 11
Pilot Hardening
```

---

# 7. Phase 0 — Project Foundation

## 7.1 Objective

Create the initial development environment, repository structure, application skeleton, configuration system, development database, testing foundation, and engineering conventions.

This phase establishes the foundation on which all later phases depend.

---

## 7.2 Why This Phase Comes First

Before implementing business functionality, the project needs:

* Consistent repository structure
* NestJS backend
* React frontend
* PostgreSQL
* Prisma
* Docker development environment
* Configuration management
* Testing infrastructure
* Code quality rules
* Documentation structure

---

## 7.3 Scope

### Backend

Create:

```text
backend/
```

using NestJS + TypeScript.

Establish:

* Application bootstrap
* Configuration module
* Environment validation
* Global validation
* Global error handling foundation
* Logging foundation
* Health endpoint
* Basic module structure

---

### Frontend

Create:

```text
frontend/
```

using:

* React
* TypeScript
* Vite

Establish:

* Application entry point
* Routing foundation
* API client foundation
* Environment configuration
* Basic layout

---

### Database

Create PostgreSQL development environment.

Add Prisma.

Establish:

```text
database/
```

and:

```text
prisma/
```

where appropriate according to the final repository structure.

---

### Infrastructure

Create:

```text
docker-compose.yml
```

for local development.

Initial services should be limited to what is actually required.

---

## 7.4 Required Backend Foundation

Implement:

```text
src/
├── app.module.ts
├── main.ts
├── common/
├── config/
└── health/
```

Future modules should be added only when their phases begin.

---

## 7.5 Configuration

Configuration MUST NOT be hard-coded.

Examples:

```text
DATABASE_URL
PORT
NODE_ENV
JWT_SECRET
```

Only variables actually required by the current phase should be introduced.

Secrets MUST NOT be committed to Git.

Provide:

```text
.env.example
```

without real secrets.

---

## 7.6 Testing

At minimum:

* Backend application starts
* Health endpoint works
* Configuration validation works
* Basic frontend application renders
* Database connection can be verified

---

## 7.7 Definition of Done

Phase 0 is complete when:

* NestJS backend starts successfully
* React frontend starts successfully
* PostgreSQL starts successfully
* Prisma is configured
* Docker development environment works
* Environment configuration works
* Health endpoint works
* Basic automated tests pass
* `.env` secrets are excluded from Git
* Repository structure follows the architecture baseline
* No business functionality has been prematurely implemented

---

## 7.8 Out of Scope

Do NOT implement:

* Authentication
* RBAC
* Tenant business logic
* Tenant provisioning
* Tenant schema creation
* Tenant migration or version management
* Student management
* Teacher management
* Attendance
* Teacher attendance review
* Dashboards
* Biometric enrollment
* Face recognition
* Camera processing
* Timetable
* AI
* Edge AI
* Parent application
* Reporting

---

# 8. Phase 1 — Multi-Tenant Database Foundation

## 8.1 Objective

Implement the database foundation for enterprise multi-school tenancy.

The target model is:

```text
PostgreSQL
│
├── platform
├── school_a
├── school_b
└── school_c
```

---

## 8.2 Why This Phase Comes Second

Tenant architecture affects nearly every later module.

Authentication, student management, attendance, reporting, and authorization all depend on correct tenant isolation.

Therefore tenant architecture MUST be established before business modules are developed.

## 8.2.1 Phase 1 Feasibility Gate

The approved architectural target is:

```text
PostgreSQL
+
Schema-Per-School
+
Prisma
```

The exact runtime Prisma tenant/schema-routing mechanism has not yet been technically validated. Phase 1 production implementation is blocked until the following sequence is complete:

```text
Approved Architecture Target
        ↓
Dedicated Prisma + PostgreSQL
Schema-per-School Feasibility Validation
        ↓
Architecture Decision / ADR
        ↓
Phase 1 Implementation
        ↓
Phase 1 Validation
        ↓
Phase 1 Completion
```

Phase 1 production implementation is blocked until the Prisma + PostgreSQL schema-per-school feasibility validation passes and the runtime tenant/schema access strategy is formally documented through an ADR. The phase plan must not select or prescribe the final runtime mechanism before that validation and decision.

Feasibility validation answers:

> Can the approved PostgreSQL schema-per-school architecture be implemented safely and reliably with Prisma under real concurrent pooled database usage?

Feasibility validation and Phase 1 implementation are separate activities. Phase 1 uses a controlled trusted/test tenant-context abstraction for validation; full authentication and RBAC belong to Phase 2.

---

# 8.3 Platform Schema

The platform schema stores system-level information.

Potential entities include:

```text
Tenant
TenantConfiguration
UserIdentity
DeviceRegistry
```

Exact entities should be finalized during implementation based on actual requirements.

The platform schema MUST NOT become a place where all school transactional data is stored centrally.

---

# 8.4 School Schema

Each school schema contains school-specific data.

Examples:

```text
students
teachers
classes
sections
subjects
classrooms
cameras
timetable
attendance
audit
```

Only entities belonging to the school should be stored in that school's schema.

---

# 8.5 Prisma Implementation

Before Phase 1 implementation, a dedicated feasibility validation MUST evaluate the Prisma implementation strategy for PostgreSQL schema-per-tenant architecture.

Do NOT allow Copilot to invent an unsafe implementation such as:

```text
schema = request.query.schema
```

or:

```text
schema = request.body.schema
```

or:

```text
schema = frontendSelectedSchema
```

The tenant schema MUST be derived from trusted backend-controlled tenant context.

The exact Prisma strategy MUST be documented through an ADR after feasibility validation and before production implementation.

The feasibility validation must cover:

* Exact runtime tenant/schema routing
* Prisma-generated SQL behavior
* Prisma client lifecycle
* Transaction behavior
* Transaction-local tenant context
* Connection pooling
* Connection reuse
* Tenant-state cleanup
* Concurrent tenant requests
* Transaction commit
* Transaction rollback
* Runtime tenant provisioning
* Tenant schema initialization
* Tenant migration and versioning
* Protection against arbitrary schema input
* Protection against arbitrary tenant input

The validation must not prescribe a final runtime mechanism, including any specific `search_path` strategy, unless it has already been validated and approved in an ADR.

The eventual mechanism MUST be:

* Safe
* Testable
* Compatible with the selected Prisma version
* Compatible with PostgreSQL
* Explicitly documented
* Protected against cross-tenant access

---

# 8.6 Tenant Context

Introduce a trusted backend tenant-context and database-access boundary abstraction without implementing full authentication or RBAC.

Conceptually:

```text
Authenticated Request
        ↓
Tenant ID
        ↓
Tenant Registry
        ↓
Trusted Tenant Configuration
        ↓
Tenant Database Context
```

The client MUST NOT control schema names.

Phase 1 must establish:

* Platform tenant registry and metadata foundation
* School/tenant identity mapping
* Trusted tenant-context abstraction
* Database access boundary
* Tenant-to-schema mapping
* Disabled-tenant handling
* Invalid-tenant handling

The backend must derive trusted tenant context from server-controlled/authenticated context once authentication exists. During Phase 1, a controlled internal/test tenant context is used solely to validate tenant isolation and database access behavior.

Phase 1 must NOT implement:

* Login
* Password authentication
* JWT authentication
* Refresh tokens
* RBAC
* A complete authorization system

Full authentication and RBAC are implemented in Phase 2.

### 8.6.1 Tenant Provisioning Foundation

Phase 1 must define the controlled provisioning foundation:

```text
Create School/Tenant
        ↓
Create Approved School Schema
        ↓
Initialize Required Baseline Objects
        ↓
Record Schema/Version Metadata
        ↓
Tenant Becomes Available
```

The provisioning design must define:

* Provisioning idempotency
* Failure handling
* Retry behavior
* Partial-failure handling
* Rollback/recovery strategy

It must not accept arbitrary client-controlled schema names and must not implement business-domain entities such as students, teachers, classes, or attendance.

### 8.6.2 Tenant Migration Foundation

Phase 1 must define, without inventing an unvalidated implementation mechanism:

* Platform schema version tracking
* Tenant schema version tracking
* Platform migration strategy
* Tenant migration strategy
* New-school migration behavior
* Existing-school migration behavior
* Idempotent migration execution
* Migration failure handling
* Retry behavior
* Rollback/recovery strategy
* Deployment sequencing

---

# 8.7 Tenant Isolation Tests

Mandatory tests:

### Test 1

School A user accesses School A data.

Expected:

```text
ALLOW
```

### Test 2

School A user attempts to access School B data.

Expected:

```text
DENY
```

### Test 3

School A user attempts to modify School B data.

Expected:

```text
DENY
```

### Test 4

Invalid tenant identifier.

Expected:

```text
DENY
```

### Test 5

Manipulated resource identifier belonging to another tenant.

Expected:

```text
DENY
```

### Required Tenant-Context and Client-Manipulation Tests

The Phase 1 test plan must also cover:

* Tenant A → Tenant A = ALLOW
* Tenant B → Tenant B = ALLOW
* Tenant A → Tenant B = DENY
* Tenant B → Tenant A = DENY
* Missing tenant context = DENY
* Invalid tenant = DENY
* Disabled tenant = DENY
* Invalid tenant-to-schema mapping = DENY
* Client-supplied tenant override = DENY
* Client-supplied schema override = DENY
* Query parameter attempting schema selection = DENY
* Request body attempting tenant selection = DENY
* Request header attempting unauthorized tenant selection = DENY

### Required Runtime Isolation Tests

Where the selected implementation uses database session or transaction state, test:

* Concurrent Tenant A and Tenant B requests remain isolated
* Connection reuse does not leak tenant state
* Connection-pool reuse does not leak tenant state
* Transaction commit does not leak tenant state
* Transaction rollback does not leak tenant state
* Tenant context is cleaned up after the operation
* Repeated alternating tenant requests remain isolated
* A failed transaction followed by another tenant request remains isolated
* A connection returned to the pool contains no prior tenant state

The purpose is to detect tenant-state leakage, not to prescribe a runtime mechanism.

---

# 8.8 Definition of Done

### Architecture

* Prisma/schema-per-school feasibility validation passes
* Runtime tenant/schema strategy is formally decided
* An ADR documents the approved decision
* No unresolved architectural blocker remains

### Tenant Isolation

* PostgreSQL is operational
* Platform schema exists
* School schema strategy is implemented
* Tenant registry and metadata foundation exists
* Tenant context foundation exists
* Database access boundary exists
* Tenant isolation tests exist
* Tenant A → Tenant A succeeds
* Tenant B → Tenant B succeeds
* Tenant A → Tenant B is denied
* Tenant B → Tenant A is denied
* Missing, invalid, and disabled tenant contexts are denied
* Invalid tenant-to-schema mappings are denied
* Client tenant and schema overrides are denied
* Foreign-resource access is denied
* Cross-tenant reads fail
* Cross-tenant writes fail
* Client cannot select arbitrary database schemas

### Runtime Isolation

* Concurrent tenant requests are isolated
* Transaction commit is tested
* Transaction rollback is tested
* Connection reuse is tested
* Connection-pool reuse is tested
* Tenant-context cleanup is tested
* No tenant-state leakage is demonstrated

### Provisioning

* Tenant provisioning strategy is documented
* Schema initialization strategy is documented
* Provisioning idempotency is defined
* Provisioning failure, retry, and recovery behavior is defined

### Migration

* Platform migration strategy is documented
* Tenant migration strategy is documented
* Version tracking is defined
* New-tenant migration path is defined
* Existing-tenant migration path is defined
* Migration failure, retry, and recovery behavior is defined
* Deployment sequencing is defined

### Security and Documentation

* Arbitrary client-controlled schema selection is prohibited
* Arbitrary client-controlled tenant selection is prohibited
* Unsafe dynamic SQL schema interpolation is prohibited
* Global mutable tenant state is not used
* No secrets are committed to Git
* Relevant ADR exists
* Phase documentation is updated
* Unresolved risks are explicitly recorded

### Scope

* No authentication implementation
* No RBAC implementation
* No student or teacher business functionality
* No attendance functionality
* No biometric functionality
* No Edge AI functionality

---

# 8.9 Out of Scope

Do NOT implement:

* Authentication
* Login, password authentication, JWTs, or refresh tokens
* RBAC
* Complete authorization system
* Students
* Teachers
* Academic management
* Attendance
* Face recognition
* Timetable UI
* Cameras
* Teacher dashboard
* Reports
* Edge AI
* Parent functionality

---

# 9. Phase 2 — Authentication & RBAC

## 9.1 Objective

Implement secure authentication and authorization.

Initial roles:

```text
SCHOOL_ADMIN
SUBJECT_TEACHER
CLASS_TEACHER
PRINCIPAL
```

---

# 9.2 Authentication Flow

```text
Login
 ↓
Credential Verification
 ↓
Authenticated Identity
 ↓
Tenant Resolution
 ↓
Authorization Context
 ↓
Access Token
```

---

# 9.3 Authorization Flow

Every protected request should conceptually follow:

```text
Request
 ↓
Authentication
 ↓
Identity
 ↓
Tenant Context
 ↓
Role Check
 ↓
Resource Check
 ↓
Permission Decision
 ↓
Allow / Deny
```

---

# 9.4 RBAC

Implement role-based permissions.

However, RBAC alone is insufficient.

Example:

A SUBJECT_TEACHER may have attendance permissions, but only for authorized classes/subjects.

Therefore authorization MUST eventually support:

```text
Role
+
Tenant
+
Resource
+
Relationship
```

---

# 9.5 Security Requirements

Never trust:

* Frontend role
* Frontend tenant ID
* Frontend permissions
* User-provided schema
* User-provided school database name

All authorization decisions MUST occur server-side.

---

# 9.6 Tests

Test:

* Valid login
* Invalid login
* Expired token
* Missing token
* Invalid token
* Correct role access
* Incorrect role access
* Cross-tenant access
* Resource-level authorization

---

# 9.7 Definition of Done

* Authentication works
* Protected routes work
* Roles are implemented
* Authorization guards/policies work
* Tenant context is enforced
* Cross-tenant authorization tests pass
* Unauthorized users receive appropriate denial
* Sensitive credentials are not logged

---

# 9.8 Out of Scope

Do NOT implement:

* Face login
* Biometric authentication
* Parent login
* Attendance
* Camera integration
* AI

---

# 10. Phase 3 — School / Academic Setup

## 10.1 Objective

Build the foundational school data model.

This phase creates the entities required before classroom attendance can exist.

---

# 10.2 Core Entities

Potential entities:

```text
School
AcademicYear
Class
Section
Student
Teacher
Subject
ClassTeacherAssignment
SubjectTeacherAssignment
StudentEnrollment
```

Exact schema naming must follow the architecture baseline and project conventions.

---

# 10.3 Student Management

Support:

* Manual student creation
* Student editing
* Student activation/deactivation
* Class/section assignment
* Student enrollment

Student data should include only information required for the platform.

---

# 10.4 Teacher Management

Support:

* Teacher creation
* Teacher update
* Teacher role assignment
* Teacher class assignment
* Teacher subject assignment

---

# 10.5 Import

Support:

```text
CSV
Excel
```

for student and relevant academic data.

Import MUST include:

* Validation
* Duplicate detection
* Error reporting
* Transaction safety where appropriate

Invalid rows MUST NOT silently become incorrect records.

---

# 10.6 Authorization

School Admin should manage school configuration.

Teachers should only see authorized academic resources.

---

# 10.7 Tests

Test:

* Student CRUD
* Teacher CRUD
* Class CRUD
* Section CRUD
* Subject CRUD
* Assignment rules
* CSV import validation
* Excel import validation
* Duplicate handling
* Tenant isolation
* Role authorization

---

# 10.8 Definition of Done

A School Admin can:

```text
Create school structure
↓
Create classes/sections
↓
Create students
↓
Create teachers
↓
Create subjects
↓
Assign students
↓
Assign teachers
```

All data remains tenant-isolated.

---

# 10.9 Out of Scope

Do NOT implement:

* Automated attendance
* Face recognition
* Classroom camera processing
* AI
* Reports
* Parent notifications

---

# 11. Phase 4 — Classroom / Camera / Timetable

## 11.1 Objective

Create the physical and scheduling model required for period-wise classroom attendance.

---

# 11.2 Hierarchy

```text
School
 ↓
Class
 ↓
Section
 ↓
Classroom
 ↓
Camera
```

Timetable connects:

```text
Class
+
Section
+
Subject
+
Teacher
+
Classroom
+
Time
```

---

# 11.3 Classroom

Support:

* Classroom creation
* Classroom editing
* Classroom status
* Class-to-room assignment

---

# 11.4 Camera

Support:

* Camera registration
* Camera identifier
* Classroom association
* Camera status
* Device metadata

Do not expose sensitive camera credentials through the frontend.

---

# 11.5 Timetable

Support:

* Academic schedule
* Period
* Subject
* Teacher
* Class/section
* Classroom
* Start time
* End time

---

# 11.6 Scheduled Attendance Session

The system should be capable of determining:

```text
Which class?
Which section?
Which subject?
Which teacher?
Which classroom?
Which period?
Which students?
```

This becomes the basis for later attendance processing.

---

# 11.7 Tests

Test:

* Classroom creation
* Camera registration
* Camera-to-classroom mapping
* Timetable creation
* Invalid overlapping schedules where prohibited
* Teacher assignment
* Correct student roster resolution
* Tenant isolation

---

# 11.8 Definition of Done

For a scheduled period the backend can determine:

```text
Class 8-A
Mathematics
Teacher X
Room 201
08:00–08:45
40 students
```

without requiring AI.

---

# 11.9 Out of Scope

Do NOT implement:

* Face recognition
* Automated attendance
* AI checkpoints
* Edge Agent
* Parent notifications

---

# 12. Phase 5 — Manual Attendance

## 12.1 Objective

Implement the Manual Attendance Foundation before introducing AI.

This is a critical validation phase.

This phase covers attendance sessions, teacher-marked present/absent/excused/not-marked states, teacher confirmation, manual fallback, and an audit-ready structure. It does not cover review of AI-generated attendance.

---

# 12.2 Why Manual Attendance Comes Before AI

The business workflow must be proven independently of AI.

The system must first correctly support:

```text
Scheduled Class
 ↓
Attendance Session
 ↓
Student Attendance
 ↓
Teacher Manual Review
 ↓
Teacher Confirmation
```

AI will later provide evidence for this workflow.

---

# 12.3 Attendance Session

An attendance session represents attendance for:

```text
School
Class
Section
Subject
Teacher
Classroom
Date
Period
```

---

# 12.4 Attendance Status

Initial statuses may include:

```text
PRESENT
ABSENT
EXCUSED
NOT_MARKED
```

The exact state model must remain consistent with the architecture.

---

# 12.5 Teacher Workflow

```text
Open Current Class
 ↓
View Student List
 ↓
Mark Attendance
 ↓
Review
 ↓
Correct if required
 ↓
Confirm
```

---

# 12.6 Manual Correction

If a teacher changes an already generated system value, the system must eventually capture:

```text
Previous Value
New Value
Reason
Teacher
Timestamp
```

---

# 12.7 Manual Fallback

Manual attendance MUST be possible even if:

* Camera unavailable
* AI unavailable
* Edge Agent unavailable
* Network temporarily unavailable

System failure MUST NOT force absence.

---

# 12.8 Tests

Test:

* Create attendance session
* Mark present
* Mark absent
* Edit attendance
* Confirm attendance
* Prevent invalid duplicate session
* Teacher authorization
* Class authorization
* Tenant isolation

---

# 12.9 Definition of Done

A teacher can successfully complete:

```text
Select scheduled class
 ↓
View students
 ↓
Mark attendance
 ↓
Review
 ↓
Confirm
```

and the final attendance record is persisted correctly.

---

# 12.10 Out of Scope

Do NOT implement:

* Face recognition
* Camera processing
* AI checkpoints
* Edge Agent
* AI confidence scoring

---

# 13. Phase 6 — Edge Agent Foundation

## 13.1 Objective

Create the Python Edge Agent foundation for communication with school CCTV/IP cameras and backend services.

---

# 13.2 Responsibilities

The Edge Agent will eventually handle:

```text
Camera Connection
 ↓
Frame Acquisition
 ↓
Face Detection
 ↓
Face Recognition
 ↓
Evidence Generation
 ↓
Local Queue
 ↓
Backend Synchronization
```

In this phase only the infrastructure foundation is implemented.

---

# 13.3 Edge Agent Structure

Suggested structure:

```text
edge-ai/
├── app/
├── camera/
├── communication/
├── storage/
├── configuration/
├── logging/
└── tests/
```

Exact structure can evolve according to implementation needs.

---

# 13.4 Device Identity

Each Edge Agent should have:

```text
Device ID
Tenant Association
Authentication Credential
Status
Last Seen
```

Device identity must be backend-controlled.

---

# 13.5 Offline Queue

Create a durable local event queue.

Conceptually:

```text
Event
 ↓
Local Storage
 ↓
Send to Backend
 ↓
Success → Mark Synced
Failure → Retry
```

---

# 13.6 Idempotency

Each event must have a unique event identifier.

Backend processing should be idempotent.

Repeated submission of the same event must not create duplicate attendance evidence.

---

# 13.7 Tests

Test:

* Edge Agent startup
* Configuration validation
* Device authentication
* Backend connectivity
* Local event persistence
* Retry
* Duplicate event handling
* Offline mode

---

# 13.8 Definition of Done

The Edge Agent can:

```text
Start
 ↓
Authenticate
 ↓
Connect to backend
 ↓
Create local event
 ↓
Queue event
 ↓
Send event
 ↓
Retry failed event
 ↓
Avoid duplicate submission
```

---

# 13.9 Out of Scope

Do NOT implement:

* Face detection
* Face recognition
* Face enrollment
* Attendance calculation
* AI checkpoint logic

---

# 14. Phase 7 — Face Enrollment & Recognition

## 14.1 Objective

Introduce facial recognition capability while keeping biometric processing primarily within the school's Edge environment.

Biometric implementation must not proceed until the following lifecycle controls are defined and included in the implementation design:

* Biometric data ownership and control
* Retention policy
* Deletion workflow
* Deletion authorization
* Deletion verification
* Deletion auditability
* School/tenant isolation
* Protection against cross-school biometric access
* Local/edge processing boundaries
* Minimum necessary biometric data storage

Phase 11 may validate and harden these controls, but Phase 7 must establish them before biometric data is introduced.

---

# 14.2 Recognition Architecture

```text
Camera
 ↓
Edge Agent
 ↓
Face Detection
 ↓
Face Quality Check
 ↓
Face Recognition
 ↓
Confidence
 ↓
Student Identity
 ↓
Recognition Evidence
```

---

# 14.3 Face Enrollment

Enrollment should associate a student's biometric representation with their school identity.

Prefer:

```text
Biometric Template
```

over unnecessary retention of raw facial images.

---

# 14.4 Enrollment Requirements

Enrollment must include:

* Student identity
* School tenant
* Enrollment status
* Model/provider metadata where appropriate
* Creation timestamp
* Version information

---

# 14.5 Biometric Isolation

Biometric data MUST NOT become a global cross-school dataset.

Conceptually:

```text
School A
 └── School A biometric storage

School B
 └── School B biometric storage
```

---

# 14.6 Recognition Result

Recognition output should include information such as:

```text
Student ID
Confidence
Timestamp
Camera ID
Quality information
Model/provider version
```

The exact payload must avoid unnecessary biometric information.

---

# 14.7 Recognition Confidence

Recognition must not be binary-only.

Possible conceptual categories:

```text
HIGH_CONFIDENCE
MEDIUM_CONFIDENCE
LOW_CONFIDENCE
UNKNOWN
```

Low-confidence recognition should become reviewable evidence rather than an automatic final attendance decision.

---

# 14.8 Basic Anti-Spoofing

Initial MVP:

* Basic liveness/anti-spoofing capability
* Recognition quality checks

The system should prioritize recognition accuracy first.

Advanced anti-spoofing can be introduced after pilot validation.

---

# 14.9 Tests

Test:

* Enrollment
* Recognition
* Unknown face
* Low confidence
* Poor image quality
* Occlusion
* Incorrect identity
* Tenant isolation
* Biometric access control

---

# 14.10 Definition of Done

The Edge Agent can recognize enrolled students and produce structured recognition evidence with confidence information.

No recognition result directly finalizes attendance.

---

# 14.11 Out of Scope

Do NOT implement:

* Final attendance calculation
* Three-checkpoint logic
* Teacher review
* Parent notifications
* Learning analytics

---

# 15. Phase 8 — Three-Checkpoint Automated Attendance

## 15.1 Objective

Convert recognition evidence into classroom-level, period-wise preliminary attendance.

---

# 15.2 Checkpoints

Every scheduled class session has:

```text
START
MIDDLE
END
```

---

# 15.3 Flow

```text
Scheduled Class
 ↓
Start Checkpoint
 ↓
Middle Checkpoint
 ↓
End Checkpoint
 ↓
Aggregate Recognition Evidence
 ↓
Preliminary Attendance
```

---

# 15.4 Example

```text
Student: Rahul

START   ✓
MIDDLE  ✓
END     ✓

→ AI VERIFIED PRESENT
```

---

# 15.5 Exception Example

```text
Student: Priya

START   ✓
MIDDLE  ✗
END     ✓

→ ATTENDANCE EXCEPTION
```

The system MUST NOT automatically classify Priya as permanently absent.

Possible reasons include:

* Authorized activity
* Nurse visit
* Office visit
* Temporary absence
* Camera obstruction
* Recognition failure
* Room change

Teacher review resolves the final state.

---

# 15.6 Evidence Model

Keep:

```text
Recognition Evidence
```

separate from:

```text
Preliminary Attendance
```

and:

```text
Final Attendance
```

---

# 15.7 Attendance Calculation

The calculation engine must be deterministic and documented.

The implementation should avoid hidden AI decisions for basic attendance-state calculation.

AI should provide evidence.

Business rules should calculate preliminary status.

---

# 15.8 Confidence Handling

Low-confidence recognition should contribute to reviewable evidence according to documented rules.

It should not silently become a final attendance result.

---

# 15.9 Tests

Test:

* All three checkpoints recognized
* One checkpoint missing
* Multiple checkpoints missing
* Unknown student
* Low confidence
* Camera failure
* Edge failure
* Duplicate events
* Late events
* Offline synchronization
* Wrong classroom
* Wrong scheduled period
* Tenant isolation

---

# 15.10 Definition of Done

The system can automatically generate:

```text
AI VERIFIED PRESENT
```

or:

```text
ATTENDANCE EXCEPTION / NEEDS REVIEW
```

based on recognition evidence from the three checkpoints.

No AI result bypasses teacher authority.

---

# 15.11 Out of Scope

Do NOT implement:

* Behavior analysis
* Classroom interaction analysis
* Answer analysis
* Attention scoring
* Emotion recognition
* Learning analytics
* AI tutor

---

# 16. Phase 9 — Teacher Review / Override / Audit

## 16.1 Objective

Implement AI Attendance Review, Teacher Override, and Audit for AI-generated preliminary attendance decisions.

This phase covers:

* Review of AI-generated preliminary attendance
* Review of attendance exceptions
* Teacher acceptance
* Teacher override
* Mandatory override reason
* Notes
* Final confirmation
* Audit trail
* Preservation of original AI evidence

Manual attendance confirmation belongs to Phase 5. This phase does not redefine the manual attendance foundation.

---

# 16.2 Review Flow

```text
AI Processing
 ↓
Preliminary Attendance
 ↓
Teacher Reviews
 ↓
Accept
OR
Change Result
 ↓
Reason Required
 ↓
Teacher Confirms
 ↓
Final Attendance
```

---

# 16.3 Teacher Dashboard

Example:

```text
Class 8-A | Mathematics

Total Students: 40

AI Verified Present     36
Needs Review              3
Not Detected              1
```

Student list:

```text
Rahul       ✓ Present
Amit        ✓ Present
Priya       ⚠ Review
Neha        ✓ Present
Rohit       ⚠ Review
```

---

# 16.4 Override Rules

If:

```text
AI = PRESENT
Teacher = ABSENT
```

the teacher MUST provide a reason.

If:

```text
AI = ABSENT / EXCEPTION
Teacher = PRESENT
```

the teacher should also provide a reason where required by the finalized business rules.

---

# 16.5 Audit Trail

Store:

```text
Student
Previous State
New State
Reason
Teacher
Timestamp
Source
```

The original AI evidence MUST remain preserved.

---

# 16.6 Final Attendance

Only after teacher confirmation should attendance become final.

Conceptually:

```text
AI Evidence
 ↓
Preliminary Result
 ↓
Teacher Decision
 ↓
Final Attendance
```

---

# 16.7 Tests

Test:

* Teacher accepts AI result
* Teacher changes AI result
* Reason required
* Audit created
* Original AI result preserved
* Unauthorized teacher cannot modify attendance
* Confirmed attendance cannot be changed without proper authorization/workflow
* Tenant isolation

---

# 16.8 Definition of Done

A teacher can review AI-generated attendance, modify it where necessary, provide required reasons, and confirm final attendance.

Every modification is auditable.

---

# 16.9 Out of Scope

Do NOT implement:

* Parent application
* Student performance analytics
* Classroom interaction intelligence
* AI tutor
* Advanced predictive analytics

---

# 17. Phase 10 — Reports & Dashboards

## 17.1 Objective

Provide useful attendance visibility to teachers, school administrators, and principals.

---

# 17.2 Teacher Dashboard

Show:

* Current class
* Current subject
* Student attendance
* AI verified count
* Review count
* Exception count
* Final attendance count

---

# 17.3 School Admin Dashboard

Potential metrics:

```text
Total Students
Total Classes
Attendance Rate
AI Verified %
Review %
Exceptions
Manual Attendance %
```

---

# 17.4 Principal Dashboard

Potential high-level views:

* Class-wise attendance
* Section-wise attendance
* Subject-wise attendance
* Teacher review rates
* Attendance exceptions
* Trends

---

# 17.5 Student Attendance History

Authorized users can view:

```text
Student
 ↓
Date
 ↓
Period
 ↓
Subject
 ↓
Attendance Status
```

---

# 17.6 Reports

Support appropriate exports such as:

```text
CSV
Excel
PDF
```

only where required by the MVP.

Reports MUST respect tenant and role boundaries.

---

# 17.7 Tests

Test:

* Correct aggregation
* Date filtering
* Class filtering
* Subject filtering
* Tenant isolation
* Role restrictions
* Export correctness

---

# 17.8 Definition of Done

Authorized users can view attendance information appropriate to their role without exposing data belonging to other schools.

---

# 17.9 Out of Scope

Do NOT implement:

* Predictive student failure
* Behavioral scoring
* Emotion analysis
* Answer analysis
* Generative educational assistant

---

# 18. Phase 11 — Pilot Hardening

## 18.1 Objective

Prepare the MVP for controlled real-school pilot deployment.

This phase focuses on reliability, accuracy, security, observability, privacy, performance, and operational readiness.

---

# 18.2 Recognition Accuracy

Pilot target:

```text
≥95% recognition accuracy
```

Accuracy measurement must use a defined evaluation dataset and methodology.

Do not claim accuracy without measurement.

---

# 18.3 Attendance Accuracy

Pilot target:

```text
≥90% attendance accuracy
```

Attendance accuracy must be measured against teacher-verified ground truth.

---

# 18.4 Teacher Time Saving

Target:

```text
≥10 minutes saved per class
```

Measure actual teacher workflow time.

---

# 18.5 Teacher Acceptance

Measure:

* Ease of use
* Trust
* Review workload
* Accuracy perception
* Preference over manual attendance

---

# 18.6 Paid Pilot Validation

Target:

```text
School agrees to paid pilot
```

This validates the product commercially rather than only technically.

---

# 18.7 Security Testing

Perform:

* Authentication testing
* Authorization testing
* Tenant isolation testing
* API validation testing
* Secret leakage testing
* Input validation testing
* Device authentication testing
* Database access testing

---

# 18.8 Privacy Testing

Validate:

* Biometric access control
* Data minimization
* Retention rules
* Deletion workflow
* Deletion audit trail
* School-level isolation
* Access logging

The system MUST NOT claim legal compliance merely because data is stored locally.

Actual legal/privacy compliance requires appropriate organizational and legal review.

---

# 18.9 Reliability

Test:

* Camera disconnect
* Edge Agent crash
* Network failure
* Backend restart
* Database restart
* Duplicate events
* Delayed events
* Offline queue
* Synchronization recovery

---

# 18.10 Performance

Measure:

* API latency
* Attendance processing latency
* Edge recognition throughput
* Database query performance
* Concurrent classroom sessions
* Synchronization throughput

Performance targets should be established using actual pilot workload.

---

# 18.11 Observability

Provide:

* Structured logs
* Health checks
* Device status
* Last-seen information
* Error tracking
* Attendance processing status

Do not log sensitive biometric information unnecessarily.

---

# 18.12 Deployment

Prepare:

```text
School Server
+
Edge Agent
+
CCTV/IP Cameras
+
Backend
+
Database
+
Frontend
```

Deployment architecture should remain simple for the MVP.

Do not introduce Kubernetes or distributed microservices unless actual scale requires them.

---

# 18.13 Definition of Done

Pilot readiness requires:

* Recognition target measured
* Attendance accuracy measured
* Teacher time saving measured
* Security tests pass
* Tenant isolation tests pass
* Offline behavior validated
* Camera failure behavior validated
* Biometric deletion workflow validated
* Audit trail validated
* Monitoring/logging available
* Deployment documented
* Rollback/recovery procedure documented
* Pilot school onboarding process documented

---

# 18.14 Out of Scope

Do NOT expand the product into:

* Full ERP
* Fees
* Transport
* Exams
* Learning management
* AI tutor
* Behavior scoring
* Emotion recognition
* Classroom answer analysis

unless approved as a future product phase.

---

# 19. Attendance State Architecture

The system MUST maintain a clear separation between evidence and decisions.

```text
                    ┌──────────────────────┐
                    │ Recognition Evidence │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Preliminary Result   │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Teacher Review       │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Teacher Decision     │
                    └──────────┬───────────┘
                               ↓
                    ┌──────────────────────┐
                    │ Final Attendance     │
                    └──────────────────────┘
```

The AI MUST NOT directly overwrite teacher-confirmed final attendance.

---

# 20. Attendance Checkpoint Model

Each scheduled attendance session has:

```text
START
MIDDLE
END
```

Conceptual evidence:

```text
AttendanceSession
│
├── StartCheckpoint
│   └── RecognitionEvidence[]
│
├── MiddleCheckpoint
│   └── RecognitionEvidence[]
│
└── EndCheckpoint
    └── RecognitionEvidence[]
```

The exact database structure may be optimized during implementation, but the conceptual separation MUST remain.

---

# 21. Manual Fallback Principle

The system must always provide a manual path.

```text
AI Available
    ↓
Automated Attendance
    ↓
Teacher Review

AI Unavailable
    ↓
Manual Attendance
    ↓
Teacher Confirmation
```

Never:

```text
AI Unavailable
    ↓
Student Absent
```

---

# 22. Edge Event Lifecycle

Every Edge event should conceptually follow:

```text
CREATED
 ↓
QUEUED
 ↓
SENT
 ↓
ACKNOWLEDGED
```

Failure:

```text
SENT
 ↓
FAILED
 ↓
RETRY
 ↓
SENT
```

Terminal failure should be observable and reviewable.

---

# 23. Idempotency Principle

Every event should have a unique identifier.

Example:

```text
event_id = UUID
```

If:

```text
Event A
```

is submitted multiple times, the backend MUST process it as one logical event.

This is required for reliable offline synchronization.

---

# 24. Tenant Isolation Development Rule

Every new tenant-aware endpoint MUST answer these questions:

1. How is the tenant determined?
2. Can the client manipulate the tenant?
3. Which schema/database context is used?
4. Is authorization checked?
5. Is resource ownership checked?
6. What happens if a cross-tenant ID is supplied?
7. Is there a test proving cross-tenant access is denied?

If these questions cannot be answered, the feature is not complete.

---

# 25. API Development Rule

APIs should follow consistent patterns.

Conceptually:

```text
POST   /auth/login

GET    /students
POST   /students
GET    /students/:id
PATCH  /students/:id

GET    /teachers
POST   /teachers

GET    /classes
POST   /classes

GET    /timetable
POST   /timetable

GET    /attendance/sessions
POST   /attendance/sessions
GET    /attendance/sessions/:id
PATCH  /attendance/records/:id
POST   /attendance/sessions/:id/confirm
```

These are examples, not immutable endpoint names.

The actual API contract should be documented as each phase is implemented.

---

# 26. API Validation

All externally supplied data MUST be validated.

Validate:

* IDs
* Dates
* Times
* Enum values
* Required fields
* File uploads
* Pagination
* Filters

Do not trust frontend validation alone.

---

# 27. Database Integrity

Where appropriate, enforce integrity using:

* Foreign keys
* Unique constraints
* Check constraints
* Transactions
* Proper indexes

Do not rely solely on application-level validation for critical invariants.

---

# 28. Testing Strategy

Testing should exist at multiple levels.

## Unit

Test individual services and business rules.

## Integration

Test:

```text
NestJS
+
Prisma
+
PostgreSQL
```

## API

Test authenticated and unauthorized requests.

## Tenant Isolation

Test:

```text
Tenant A → Tenant A
Tenant A → Tenant B
```

## Edge

Test:

* Camera
* Queue
* Retry
* Synchronization
* Recognition pipeline

## End-to-End

Eventually test:

```text
School Setup
 ↓
Timetable
 ↓
Attendance Session
 ↓
Recognition
 ↓
Checkpoint
 ↓
Teacher Review
 ↓
Confirmation
```

---

# 29. Phase Gate Rules

A phase MUST NOT be considered complete merely because code compiles.

A phase is complete only when:

```text
Implementation
+
Tests
+
Security Validation
+
Documentation
+
Definition of Done
```

are complete.

---

# 30. Copilot Phase Execution Rule

Before implementing any phase, GitHub Copilot MUST be instructed to read:

```text
docs/01_MASTER_DEVELOPMENT_INSTRUCTION.md
docs/02_ARCHITECTURE_BASELINE.md
docs/03_PHASE_IMPLEMENTATION_PLAN.md
```

Then it should implement ONLY the requested phase.

Recommended instruction pattern:

```text
Read the following project documents before making changes:

1. docs/01_MASTER_DEVELOPMENT_INSTRUCTION.md
2. docs/02_ARCHITECTURE_BASELINE.md
3. docs/03_PHASE_IMPLEMENTATION_PLAN.md

You are implementing PHASE X only.

First inspect the existing repository and understand the current implementation.

Implement only the scope defined for PHASE X.

Do not implement future phases.

Do not redesign the architecture unless a documented contradiction is discovered.

Preserve existing functionality.

Follow all tenant isolation, authentication, authorization, privacy, and security requirements.

Add appropriate automated tests.

Run the relevant tests.

Fix implementation or test failures.

Verify the Definition of Done for PHASE X.

At the end, report:
1. Files created
2. Files modified
3. Features implemented
4. Tests added
5. Tests executed
6. Test results
7. Definition of Done status
8. Any unresolved issues
9. Any architectural decision that requires human approval
```

---

# 31. Copilot Must Not Do These Things

GitHub Copilot MUST NOT:

* Build the entire application at once
* Skip database design
* Skip tenant isolation tests
* Trust frontend tenant IDs
* Allow client-selected schemas
* Store secrets in source code
* Implement future AI features prematurely
* Add microservices without approval
* Add unnecessary infrastructure
* Treat AI attendance as final attendance
* Automatically mark students absent because AI failed
* Remove audit history
* Delete original AI evidence after teacher correction
* Invent undocumented business rules
* Change the technology stack
* Introduce a new ORM
* Replace NestJS
* Replace Prisma
* Replace PostgreSQL

---

# 32. Architecture Change Rule

If implementation reveals that an architecture decision is technically invalid or unsafe:

```text
STOP
 ↓
Document problem
 ↓
Explain alternatives
 ↓
Evaluate security / scalability / maintainability
 ↓
Human approval
 ↓
Update architecture document
 ↓
Continue implementation
```

Do not silently change architecture.

---

# 33. Future Features

The following are intentionally NOT part of the current MVP.

Future roadmap:

```text
MVP
│
└── Attendance
       ↓
Future
│
├── Classroom Interaction Intelligence
├── Answer & Reasoning Analysis
├── Student Progress Intelligence
├── Early Warning System
└── Teacher / Parent AI Copilot
```

These features MUST NOT influence current MVP implementation unless an abstraction is genuinely required.

---

# 34. MVP Completion Definition

The MVP is considered functionally complete when a real school can perform the following workflow:

```text
School Setup
      ↓
Create Classes / Sections
      ↓
Add Students
      ↓
Add Teachers
      ↓
Create Subjects
      ↓
Assign Teachers
      ↓
Create Classrooms
      ↓
Register Cameras
      ↓
Create Timetable
      ↓
Start Scheduled Class
      ↓
Camera / Edge Agent
      ↓
Face Recognition
      ↓
START Checkpoint
      ↓
MIDDLE Checkpoint
      ↓
END Checkpoint
      ↓
Preliminary Attendance
      ↓
Teacher Review
      ↓
Teacher Override if Required
      ↓
Reason / Note
      ↓
Teacher Confirmation
      ↓
Final Attendance
      ↓
Reports / History
```

---

# 35. MVP Success Criteria

The pilot should target:

| Metric                    |                            Target |
| ------------------------- | --------------------------------: |
| Face recognition accuracy |                              ≥95% |
| Attendance accuracy       |                              ≥90% |
| Teacher time saved        |                 ≥10 minutes/class |
| Teacher preference        | Prefer system over manual process |
| Commercial validation     |       School agrees to paid pilot |

These are pilot validation targets, not claims about current system performance.

---

# 36. Final Development Priority

When trade-offs occur, prioritize in this order:

```text
1. Tenant Isolation
2. Security
3. Data Integrity
4. Attendance Correctness
5. Teacher Control
6. Reliability
7. Recognition Accuracy
8. Usability
9. Performance
10. Advanced Features
```

The system should never sacrifice tenant isolation or attendance integrity for convenience.

---

# 37. Final Product Principle

The product is not merely:

```text
Face Recognition Attendance
```

The intended product architecture is:

```text
Face Recognition
        +
Presence Intelligence
        +
Teacher Verification
        +
Auditable Attendance
```

Face recognition answers:

> Who is this student?

Presence intelligence answers:

> Was the student present during the scheduled classroom period?

Teacher verification answers:

> What should the final attendance record be?

Auditability answers:

> Why was the final attendance decision made?

This distinction is central to the product.

---

# 38. Final Architecture-to-Implementation Mapping

```text
ARCHITECTURE
     ↓
Foundation
     ↓
Tenant Isolation
     ↓
Authentication
     ↓
Academic Data
     ↓
Classroom + Timetable
     ↓
Manual Attendance
     ↓
Edge Infrastructure
     ↓
Recognition
     ↓
Checkpoint Intelligence
     ↓
Teacher Verification
     ↓
Reporting
     ↓
Pilot Hardening
```

Every phase builds on the previous phase.

No phase should bypass a required foundation.

---

# 39. Final Rule

The MVP should remain focused.

Build:

```text
Reliable Classroom Attendance
```

before building:

```text
Classroom Intelligence
Student Intelligence
School Intelligence
```

The long-term vision can be ambitious.

The first product must be reliable, secure, privacy-conscious, auditable, and genuinely useful to teachers.

**Phase-by-phase implementation is mandatory.**
