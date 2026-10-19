# Enterprise AI Classroom Attendance Platform

# Architecture Baseline

**Document:** `docs/02_ARCHITECTURE_BASELINE.md`

**Status:** Architecture Baseline
**Version:** 1.0
**Purpose:** Define the technical architecture and permanent implementation structure of the platform.

---

# 1. Purpose

This document defines the baseline technical architecture for the Enterprise AI Classroom Attendance Platform.

It must be read together with:

```text
docs/01_MASTER_DEVELOPMENT_INSTRUCTION.md
```

The Master Development Instruction defines the permanent engineering, security, privacy, tenant isolation, and development rules.

This Architecture Baseline defines:

* Technology stack
* Repository structure
* Backend architecture
* Frontend architecture
* Database architecture
* Multi-tenant architecture
* Tenant isolation approach
* Authentication and authorization direction
* Edge AI architecture
* API architecture
* Communication patterns
* Testing architecture
* Infrastructure structure

Future phase implementation prompts must follow this document.

Major architecture changes must not be made without explicit approval from the project owner.

---

# 2. Architecture Goals

The system must be designed to be:

```text
Secure
↓
Reliable
↓
Modular
↓
Maintainable
↓
Testable
↓
Extensible
↓
Enterprise-ready
```

The architecture must support growth from:

```text
Single School Pilot
        ↓
Multiple Schools
        ↓
Multiple Classrooms
        ↓
Multiple Cameras
        ↓
Multiple Edge Devices
        ↓
Enterprise Multi-School Platform
```

The MVP should remain simple.

The architecture must avoid unnecessary complexity while preserving clear boundaries for future growth.

---

# 3. High-Level System Architecture

The platform consists of four major areas.

```text
┌─────────────────────────────────────────────┐
│                  FRONTEND                   │
│                                             │
│            React + TypeScript               │
│                                             │
│   Admin Dashboard / Teacher Dashboard       │
└──────────────────────┬──────────────────────┘
                       │
                       │ HTTPS / REST API
                       ▼
┌─────────────────────────────────────────────┐
│                   BACKEND                   │
│                                             │
│          Node.js + TypeScript               │
│                  Express.js                     │
│                                             │
│ Authentication                              │
│ Authorization                               │
│ Tenant Resolution                           │
│ Business Logic                              │
│ Attendance Management                       │
│ Audit Logging                               │
│ Edge Communication                          │
└──────────────────────┬──────────────────────┘
                       │
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                 POSTGRESQL                  │
│                                             │
│              platform schema                │
│                                             │
│              school schemas                 │
└─────────────────────────────────────────────┘


        SCHOOL LOCAL INFRASTRUCTURE
                       │
                       ▼

┌─────────────────────────────────────────────┐
│                 EDGE AGENT                  │
│                                             │
│                   Python                    │
│                                             │
│ Camera Processing                           │
│ Face Detection                              │
│ Face Recognition                           │
│ Local Storage                               │
│ Offline Queue                               │
│ Event Synchronization                       │
└──────────────────────┬──────────────────────┘
                       │
                       │
                       ▼
              CCTV / IP CAMERAS
```

---

# 4. Technology Stack

## 4.1 Backend

The backend will use:

```text
Node.js
TypeScript
Express.js
```

### Why Node.js

Node.js provides:

* Good asynchronous processing
* Strong ecosystem
* Good REST API support
* Good integration capabilities
* Easy real-time expansion in the future
* Strong TypeScript support
* Suitable architecture for enterprise APIs

---

## 4.2 Backend Framework

The backend framework will be:

```text
Express.js
```

Express.js is selected because it provides:

* Minimal and flexible web framework
* Strong middleware support
* TypeScript support
* Routing capabilities
* Large ecosystem
* Good performance
* Easy to implement custom authentication/authorization middleware

The project must use modular folder structure to separate business domains.

---

# 5. Backend Language

The backend language will be:

```text
TypeScript
```

Do not use plain JavaScript for backend business logic.

TypeScript is required for:

* Type safety
* Better maintainability
* Clear interfaces
* Safer refactoring
* Enterprise-scale development

Avoid unnecessary use of:

```text
any
```

Use:

* Interfaces
* Types
* DTOs
* Enums
* Explicit return types where useful

---

# 6. Backend Database

The primary database will be:

```text
PostgreSQL
```

PostgreSQL will store:

* Platform data
* Tenant information
* Users
* School data
* Students
* Teachers
* Classes
* Timetable
* Attendance
* Audit information
* Configuration

PostgreSQL is not responsible for performing facial recognition.

Facial recognition processing belongs to the Edge Agent.

---

# 7. ORM

The backend will use:

```text
Prisma ORM
```

Prisma will be used for:

* Database access
* Type-safe queries
* Database schema definitions
* Migrations where appropriate

Database access must remain controlled.

Business logic must not be scattered directly across database queries.

The architecture must maintain:

```text
Controller
    ↓
Service
    ↓
Repository / Data Access
    ↓
Prisma
    ↓
PostgreSQL
```

---

# 8. Database Migration Strategy

Database changes must be version controlled.

The migration approach must support:

```text
Platform Schema
        ↓
Tenant Schema
        ↓
Tenant Schema
        ↓
Tenant Schema
```

Every database structure change must be managed through a controlled migration process.

Do not manually change database structures in production.

Before implementing the multi-tenant phase, the exact Prisma multi-schema migration strategy must be finalized and tested.

Tenant migrations must not leave schools running with inconsistent database structures.

## 8.1 Tenant Provisioning Workflow

Schema-per-school tenancy requires a controlled tenant provisioning workflow:

```text
Create Tenant
        ↓
Validate Tenant Identity
        ↓
Create Approved School Schema
        ↓
Initialize Required Schema Structure
        ↓
Record Schema and Version Metadata
        ↓
Tenant Becomes Available
```

This is an architectural workflow only. It must not permit client-controlled schema names or bypass the trusted tenant registry.

## 8.2 Platform and Tenant Migrations

The migration strategy must distinguish between:

```text
Platform Schema Migrations
```

and:

```text
Tenant Schema Migrations
```

The final tenant migration strategy must address:

* Version tracking
* Idempotency
* Partial failure
* Retry behavior
* Rollback or recovery strategy
* Newly provisioned schools
* Existing schools
* Deployment sequencing

The exact Prisma migration mechanism remains subject to feasibility validation and has not been finalized in this architecture baseline.

## 8.3 Prisma Feasibility Status

The following is the approved architectural target:

```text
PostgreSQL
+
Schema-Per-School
+
Prisma
```

The following implementation details are not yet technically finalized:

```text
Exact Runtime Tenant/Schema Routing Mechanism
Exact Prisma Client Lifecycle
Exact Connection/Session Strategy
Exact Tenant Migration Implementation
Exact Tenant Provisioning Implementation
```

This is an architecturally approved target; the implementation mechanism is pending dedicated Prisma and PostgreSQL feasibility validation. No specific Prisma schema-per-school runtime strategy is considered technically proven by this document.

---

# 9. Frontend Technology

The frontend will use:

```text
React
TypeScript
Vite
```

The frontend will initially provide:

* Login
* School administration interface
* Teacher interface
* Attendance review
* Attendance confirmation
* Basic dashboards

The frontend must remain independent from backend implementation details.

These are product capabilities of the overall platform. They do not imply implementation during Phase 0 or Phase 1. Implementation must follow the phase plan:

```text
Phase 0
Project Foundation Only

Phase 1
Multi-Tenant Database Foundation Only

Phase 2+
Authentication, RBAC, Business Features, Attendance UI, and Later Capabilities
```

---

# 10. Edge AI Technology

The Edge AI system will use:

```text
Python
```

Python is selected for the Edge Agent because of the strong ecosystem for:

* Computer vision
* Face detection
* Face recognition
* Machine learning
* AI model integration

The Edge Agent is a separate component from the Node.js backend.

---

# 11. Edge AI Responsibility

The Edge Agent is responsible for:

```text
Camera Connection
        ↓
Frame Acquisition
        ↓
Face Detection
        ↓
Face Quality Validation
        ↓
Face Recognition
        ↓
Recognition Evidence
        ↓
Local Event Queue
        ↓
Synchronization
```

The Edge Agent must not contain:

* Frontend logic
* School administration logic
* User management logic
* Attendance business policy

The Edge Agent produces recognition evidence.

The backend controls attendance workflows and business decisions.

---

# 12. Repository Structure

The project will use a monorepo-style repository structure.

```text
ai-school-platform/
│
├── backend/
│
├── frontend/
│
├── edge-ai/
│
├── database/
│
├── infrastructure/
│
├── docs/
│
├── scripts/
│
├── docker-compose.yml
│
├── README.md
│
└── .gitignore
```

Each major component has a clear responsibility.

---

# 13. Backend Folder Structure

The backend will follow a modular Express.js structure.

Recommended baseline:

```text
backend/
│
├── src/
│   │
│   ├── main.ts
│   │
│   ├── app.module.ts
│   │
│   ├── common/
│   │   │
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── middleware/
│   │   ├── pipes/
│   │   ├── constants/
│   │   └── utils/
│   │
│   ├── config/
│   │
│   ├── database/
│   │
│   ├── modules/
│   │   │
│   │   ├── auth/
│   │   ├── tenants/
│   │   ├── users/
│   │   ├── schools/
│   │   ├── academics/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── classrooms/
│   │   ├── timetable/
│   │   ├── attendance/
│   │   ├── audit/
│   │   └── edge/
│   │
│   └── health/
│
├── prisma/
│
├── test/
│
├── package.json
│
├── tsconfig.json
│
├── nest-cli.json
│
├── .env.example
│
└── README.md
```

Not all modules need to be implemented immediately.

Modules must only be created when required by the relevant development phase.

---

# 14. Backend Module Architecture

Each business domain should be organized as a Express.js module.

Example:

```text
modules/
│
├── students/
│   │
│   ├── students.module.ts
│   ├── students.controller.ts
│   ├── students.service.ts
│   │
│   ├── dto/
│   │
│   ├── interfaces/
│   │
│   └── tests/
```

The exact internal structure may evolve.

However, the responsibilities must remain separated.

---

# 15. Backend Layer Architecture

The backend should follow:

```text
HTTP Request
        ↓
Controller
        ↓
Validation
        ↓
Authentication
        ↓
Authorization
        ↓
Tenant Context
        ↓
Service
        ↓
Business Logic
        ↓
Repository / Data Access
        ↓
Prisma
        ↓
PostgreSQL
```

Each layer has a separate responsibility.

---

# 16. Controller Responsibilities

Controllers are responsible for:

* Receiving HTTP requests
* Using DTO validation
* Calling services
* Returning responses

Controllers must remain thin.

Controllers must not contain:

* Complex attendance calculations
* Complex database logic
* Tenant schema selection logic
* Facial recognition logic

Example:

```text
Controller
      ↓
StudentService
      ↓
StudentRepository
      ↓
Database
```

---

# 17. Service Responsibilities

Services contain application workflows.

Examples:

```text
Create Student

Update Student

Create Attendance Session

Calculate Preliminary Attendance

Confirm Attendance
```

Services coordinate:

* Business rules
* Repositories
* Authorization requirements
* Transactions

---

# 18. Repository / Data Access Responsibilities

Repositories or dedicated data access services are responsible for:

* Database queries
* Persistence
* Retrieval
* Database-specific operations

Business rules should not be duplicated across repositories.

---

# 19. Domain Boundaries

The platform will eventually contain the following logical domains.

```text
Platform
│
├── Authentication
│
├── Tenant Management
│
├── User Management
│
├── School Management
│
├── Academic Management
│
├── Student Management
│
├── Teacher Management
│
├── Classroom Management
│
├── Timetable
│
├── Attendance
│
├── Edge Device Management
│
└── Audit
```

These are logical domains.

Do not create unnecessary microservices.

Initially, these domains exist inside the same backend application.

---

# 20. Modular Monolith Architecture

The backend will initially be a:

```text
MODULAR MONOLITH
```

This means:

```text
One Backend Application

Multiple Well-Defined Modules
```

Example:

```text
Express.js Backend
│
├── Auth Module
├── Tenant Module
├── Student Module
├── Attendance Module
└── Audit Module
```

This approach is preferred for the MVP.

Do not introduce microservices unless future scaling requirements justify them.

---

# 21. Multi-Tenant Architecture

The platform uses:

```text
Schema-Per-School Multi-Tenancy
```

Conceptually:

```text
PostgreSQL Database
│
├── platform
│
├── school_001
│
├── school_002
│
└── school_003
```

Each school is a tenant.

Each tenant receives a dedicated database schema.

---

# 22. Platform Schema

The platform schema stores global platform information.

Conceptual examples:

```text
platform
│
├── tenants
│
├── platform_users (if required)
│
├── tenant_registry
│
└── platform_configuration
```

The exact database structure will be finalized during the Multi-Tenant implementation phase.

The platform schema must not become a place where all school operational data is stored.

---

# 23. School Schema

Each school receives a dedicated schema.

Example:

```text
school_001
│
├── students
├── teachers
├── classes
├── sections
├── classrooms
├── subjects
├── timetable
├── attendance_sessions
├── attendance_records
└── audit_logs
```

Another school:

```text
school_002
│
├── students
├── teachers
├── classes
├── sections
├── classrooms
├── subjects
├── timetable
├── attendance_sessions
├── attendance_records
└── audit_logs
```

A school must not access another school's schema.

---

# 24. Tenant Identification

The frontend must not determine the tenant database schema.

The client must never send arbitrary values such as:

```text
schema = school_002
```

and expect the backend to trust it.

The correct flow is:

```text
User Login
      ↓
Authenticated Identity
      ↓
Tenant ID
      ↓
Backend Validation
      ↓
Tenant Registry Lookup
      ↓
Trusted Schema Mapping
      ↓
Tenant Context
      ↓
Database Operation
```

The backend controls tenant resolution.

Client input is not a trusted schema identifier:

```text
Client Input
        ≠
Trusted Schema Identifier
```

Schema selection must come only from a trusted, backend-controlled tenant registry or mapping. Any database mechanism that requires dynamic schema selection must validate the schema identifier against trusted server-side state before use.

---

# 25. Tenant Context

Every tenant-specific request must have a controlled tenant context.

Conceptually:

```text
Request
   ↓
Authentication
   ↓
User Identity
   ↓
Tenant Resolution
   ↓
Tenant Context
   ↓
Authorization
   ↓
Database Access
```

Tenant context must be available to authorized services.

It must not be derived from untrusted request parameters.

Tenant database context must have a bounded lifecycle and must not rely on persistent mutable state shared across requests. Feasibility validation must determine where tenant context begins, where it ends, whether it is transaction-scoped, how Prisma obtains the correct tenant-aware database context, how rollback behaves, how concurrent requests behave, and how connection pooling behaves.

---

# 26. Schema Access Security

The following pattern is prohibited:

```text
Request Parameter
       ↓
schemaName
       ↓
Direct Database Query
```

Example of prohibited client behavior:

```text
GET /students?schema=school_002
```

The schema must be resolved internally.

The client must not be able to select another school's database schema.

Client-provided schema names must never be trusted. Request-derived schema names must never be directly interpolated into SQL, and unvalidated schema identifiers must never be passed to raw SQL. Schema selection must come only from trusted backend-controlled tenant registry state.

A global mutable PostgreSQL `search_path` must not be used as the tenant-isolation mechanism. Tenant-specific database context must not remain on a pooled database connection after the tenant operation completes. Any PostgreSQL session or transaction context mechanism proposed for tenant routing remains subject to feasibility validation and must demonstrate safe behavior under connection pooling, concurrency, rollback, and connection reuse.

---

# 27. Cross-Tenant Protection

Every tenant-aware feature must protect against cross-tenant access.

Example:

```text
School A User
       ↓
Requests Student ID 123
       ↓
Backend resolves School A
       ↓
Search only School A schema
```

The backend must never search another school's schema simply because the user knows a resource identifier.

---

# 28. Tenant Isolation Testing

Tenant isolation must be tested.

Examples:

```text
School A User

tries to access

School B Student

Expected:

403 Forbidden
or
Safe Not Found Response
```

Also test:

```text
School A Teacher

tries to modify

School B Attendance

Expected:

Access Denied
```

Tenant isolation tests are mandatory for tenant-related features.

---

# 29. Authentication Architecture

Authentication will initially use:

```text
JWT-Based Authentication
```

The exact implementation details will be finalized during the Authentication phase.

The architecture must support:

```text
User
   ↓
Login
   ↓
Authentication
   ↓
JWT
   ↓
Backend Request
   ↓
Identity Validation
```

The backend must validate the token.

The frontend must not be trusted to declare the user's role or tenant.

---

# 30. Authorization Architecture

Authorization will use:

```text
Role-Based Access Control
+
Resource-Level Authorization
```

Initial roles include:

```text
SCHOOL_ADMIN

SUBJECT_TEACHER

CLASS_TEACHER

PRINCIPAL
```

Roles alone are not sufficient.

Example:

```text
SUBJECT_TEACHER
```

does not mean:

```text
Access Every Class
```

The backend must also verify the teacher's assigned resources.

---

# 31. Authorization Flow

The conceptual authorization flow is:

```text
Request
   ↓
Authentication
   ↓
User Identity
   ↓
Tenant Context
   ↓
Role Validation
   ↓
Resource Validation
   ↓
Permission Decision
   ↓
Allow / Deny
```

Express.js Guards should be used where appropriate.

Complex business authorization may also be enforced in services.

---

# 32. API Architecture

The platform will initially use:

```text
REST API
JSON
HTTPS
```

API versioning should be supported.

Recommended initial structure:

```text
/api/v1/
```

Example:

```text
/api/v1/auth

/api/v1/students

/api/v1/teachers

/api/v1/attendance
```

Do not expose tenant schema names in API paths.

---

# 33. API Request Validation

Use Express.js validation mechanisms.

Recommended approach:

```text
DTO
↓
class-validator
↓
ValidationPipe
```

Every external request must be validated.

Examples:

```text
CreateStudentDto

UpdateStudentDto

CreateTeacherDto
```

Do not accept uncontrolled request objects directly into database operations.

---

# 34. API Response Design

API responses should be consistent.

Recommended conceptual success response:

```json
{
  "success": true,
  "data": {}
}
```

Recommended conceptual error response:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data"
  }
}
```

The exact response format will be finalized during the Project Foundation phase.

Controllers should not expose:

* Database errors
* Prisma internals
* Stack traces
* Secrets

---

# 35. Error Handling

Use centralized error handling.

Express.js exception filters should be used where appropriate.

Errors should be:

```text
Logged Internally
        ↓
Translated Safely
        ↓
Returned Consistently
```

Do not expose:

```text
SQL Queries

Database Passwords

Stack Traces

Internal Architecture
```

to API users.

---

# 36. Logging Architecture

The backend must use structured logging.

Important events include:

```text
Application Startup

Application Shutdown

Authentication Failure

Authorization Failure

Tenant Access Violation

Database Error

Unexpected Error

Attendance Processing Failure
```

Sensitive information must not be unnecessarily logged.

---

# 37. Audit Architecture

The platform will support audit logging.

Important actions may include:

```text
Attendance Modified

Attendance Confirmed

Teacher Override

Student Deleted

Biometric Data Deleted

User Role Changed
```

Audit records should conceptually include:

```text
Who

What

When

Previous Value

New Value

Reason
```

when applicable.

Audit logging implementation will be added in the relevant phase.

---

# 38. Attendance Architecture

Attendance is a core business module.

The conceptual architecture is:

```text
Timetable
    ↓
Scheduled Class
    ↓
Attendance Session
    ↓
Attendance Checkpoints
    ↓
Recognition Evidence
    ↓
Preliminary Attendance
    ↓
Teacher Review
    ↓
Teacher Override
    ↓
Final Confirmation
```

The system must keep these concepts separate.

---

# 39. Attendance Session

An attendance session represents one scheduled classroom session.

Example:

```text
Class:

8-A

Subject:

Mathematics

Teacher:

Teacher A

Time:

10:00 AM – 10:45 AM
```

This produces:

```text
Attendance Session
```

Student attendance records belong to the attendance session.

---

# 40. Attendance Checkpoint Architecture

The initial attendance model uses three checkpoints.

```text
START
   ↓
MIDDLE
   ↓
END
```

Each checkpoint collects recognition evidence.

Conceptually:

```text
Student

Start:       DETECTED

Middle:      DETECTED

End:         DETECTED
```

The attendance calculation engine processes the evidence.

---

# 41. Attendance Calculation

Attendance calculation must be centralized.

Architecture:

```text
Recognition Evidence
        ↓
Attendance Policy
        ↓
Attendance Calculation Service
        ↓
Preliminary Attendance Result
```

Do not duplicate attendance calculations in:

* Controllers
* Frontend
* Edge Agent
* Multiple services

The backend is the source of truth for attendance policy.

---

# 42. AI Evidence Architecture

AI evidence must remain separate from final attendance.

Example:

```text
AI Evidence:

START     Recognized
MIDDLE    Recognized
END       Not Recognized
```

This is not automatically the same as:

```text
Final Attendance:

ABSENT
```

The system must distinguish:

```text
AI Evidence
```

from:

```text
Preliminary Attendance
```

and:

```text
Teacher Decision
```

and:

```text
Final Attendance
```

---

# 43. Teacher Review Architecture

Teacher review is a mandatory human verification layer.

Workflow:

```text
AI Processing
      ↓
Preliminary Result
      ↓
Teacher Reviews
      ↓
Teacher Accepts
      OR
Teacher Changes Result
      ↓
Reason Required
      ↓
Teacher Confirms
      ↓
Final Attendance
```

When the teacher changes a result:

```text
Original AI Result

must remain preserved.
```

---

# 44. Attendance Data States

Attendance should use controlled states.

Conceptual states may include:

```text
SCHEDULED

ACTIVE

PROCESSING

AWAITING_REVIEW

CONFIRMED
```

Student attendance results may conceptually include:

```text
PRESENT

ABSENT

NEEDS_REVIEW

NOT_DETECTED
```

The final enum definitions will be established during the Attendance implementation phase.

Do not allow arbitrary state transitions.

---

# 45. Manual Attendance Fallback

The platform must support manual attendance fallback.

Example:

```text
Camera Offline
       ↓
AI Attendance Unavailable
       ↓
Teacher Opens Attendance Session
       ↓
Teacher Marks Attendance
       ↓
Teacher Confirms
```

A technical system failure must not automatically mark a student absent.

System failure and student absence are separate concepts.

---

# 46. Edge Agent Architecture

The Edge Agent is a separate application.

Recommended structure:

```text
edge-ai/
│
├── src/
│   │
│   ├── main.py
│   │
│   ├── config/
│   │
│   ├── camera/
│   │
│   ├── detection/
│   │
│   ├── recognition/
│   │
│   ├── enrollment/
│   │
│   ├── storage/
│   │
│   ├── queue/
│   │
│   ├── synchronization/
│   │
│   └── health/
│
├── tests/
│
├── requirements.txt
│
├── .env.example
│
└── README.md
```

The exact folder structure may be refined during the Edge implementation phase.

---

# 47. Camera Architecture

The system should support compatible existing:

```text
CCTV Cameras

IP Cameras
```

The architecture should not assume a single camera.

Conceptually:

```text
School
│
├── Classroom A
│      └── Camera A
│
├── Classroom B
│      └── Camera B
│
└── Classroom C
       ├── Camera C1
       └── Camera C2
```

The MVP may initially support a simpler configuration.

The architecture must remain extensible.

---

# 48. Camera Processing Flow

Conceptual flow:

```text
Camera
   ↓
Edge Agent
   ↓
Frame Acquisition
   ↓
Face Detection
   ↓
Face Validation
   ↓
Face Recognition
   ↓
Recognition Event
   ↓
Local Queue
   ↓
Backend Synchronization
```

The Edge Agent should not send unnecessary continuous video data to the central backend.

---

# 49. Face Recognition Provider Abstraction

Face recognition must be abstracted.

Conceptually:

```text
RecognitionProvider Interface
            │
            ├── Provider A
            │
            └── Provider B
```

The attendance system must not directly depend on a specific AI model.

Possible conceptual interface:

```text
enroll()

identify()

delete()

health_check()
```

The actual interface will be finalized during the AI implementation phase.

---

# 50. Face Recognition Result

Face recognition should support multiple outcomes.

Conceptually:

```text
RECOGNIZED

LOW_CONFIDENCE

UNKNOWN

FAILED
```

Recognition confidence must be preserved where appropriate.

Confidence thresholds must not be scattered as magic numbers throughout the code.

Configuration must be centralized.

---

# 51. Biometric Data Architecture

The design principle is:

> Student facial and biometric processing should remain within the school's local infrastructure where possible.

Conceptually:

```text
School Infrastructure
│
├── Camera
│
├── Edge Device
│
├── Local Face Processing
│
└── Local Biometric Storage
```

The central platform should not receive unnecessary facial images.

The exact data synchronization model will be finalized during the biometric implementation phase.

Biometric retention rules must be finalized before biometric implementation. Biometric deletion must have an explicit owner and workflow, must be verifiable, and must not affect unrelated school data. Retention and deletion requirements must be documented before Phase 7 implementation. No specific retention period is defined by this architecture baseline.

---

# 52. Biometric Data Deletion

The architecture must support deletion.

Conceptually:

```text
Authorized Deletion Request
            ↓
Identify Student Biometric Data
            ↓
Delete Local Data
            ↓
Confirm Deletion
            ↓
Audit Record
```

Deletion must be handled through controlled application workflows.

---

# 53. Edge-to-Backend Communication

The Edge Agent communicates with the backend using secure APIs.

Conceptual flow:

```text
Edge Agent
     ↓
Authenticated Request
     ↓
Backend
     ↓
Device Validation
     ↓
Tenant Validation
     ↓
Event Processing
```

The Edge Agent must have its own controlled identity.

Do not treat an Edge device as a normal frontend user.

---

# 54. Device Identity

Each Edge device should eventually have:

```text
Device ID

Tenant Association

Authentication Credential

Status

Last Seen
```

The exact authentication mechanism will be implemented during the Edge Device phase.

---

# 55. Offline Architecture

The Edge Agent must tolerate network failures.

Conceptual flow:

```text
Recognition Event
        ↓
Local Durable Storage
        ↓
Attempt Synchronization
        ↓
Success?
     /       \
   Yes        No
    ↓          ↓
 Acknowledge   Retry Later
```

The system must not lose recognition events simply because the internet connection is temporarily unavailable.

---

# 56. Event Architecture

Recognition events should eventually contain information such as:

```text
Event ID

Tenant / Device Context

Student Identifier

Checkpoint

Timestamp

Recognition Result

Confidence

Processing Status
```

The exact data model will be implemented during the relevant phase.

Sensitive biometric information must be minimized.

---

# 57. Idempotency

Edge events may be retried.

Therefore:

```text
Event A
   ↓
Processed

Event A Again
   ↓
Do Not Duplicate
```

Events should use unique identifiers.

The backend must be able to detect duplicate processing where necessary.

---

# 58. Frontend Architecture

Recommended structure:

```text
frontend/
│
├── src/
│   │
│   ├── app/
│   │
│   ├── components/
│   │
│   ├── features/
│   │
│   ├── pages/
│   │
│   ├── services/
│   │
│   ├── hooks/
│   │
│   ├── types/
│   │
│   ├── utils/
│   │
│   └── main.tsx
│
├── public/
│
├── package.json
│
├── tsconfig.json
│
├── vite.config.ts
│
└── .env.example
```

The frontend should be organized around features as the application grows.

---

# 59. Frontend Feature Structure

Example:

```text
features/
│
├── auth/
│
├── students/
│
├── teachers/
│
├── attendance/
│
└── timetable/
```

Feature implementation should not be added until required by a phase.

---

# 60. Frontend Responsibilities

The frontend is responsible for:

```text
User Interface

User Interaction

Form Validation

API Communication

Displaying Results

User Experience
```

The frontend is not responsible for:

```text
Database Schema Selection

Tenant Security

Authorization Enforcement

Attendance Calculation

Facial Recognition
```

These belong to backend or Edge systems.

---

# 61. Frontend State Management

Do not introduce a complex global state management library at the beginning unless required.

Start with:

```text
React Local State

Hooks

Feature-Level State
```

Introduce additional state management only when the application complexity justifies it.

The exact approach can be finalized during frontend development.

---

# 62. Frontend API Communication

API communication should be centralized.

Conceptual structure:

```text
services/
│
├── apiClient
│
├── authService
│
├── studentService
│
└── attendanceService
```

Do not scatter raw API calls throughout unrelated UI components.

---

# 63. Database Architecture

The database architecture contains:

```text
PostgreSQL
│
├── platform schema
│
├── school_001 schema
│
├── school_002 schema
│
└── school_003 schema
```

The platform schema and tenant schemas have different responsibilities.

---

# 64. Database Naming

Database naming must be consistent.

Examples:

```text
snake_case
```

For example:

```text
attendance_sessions

attendance_records

academic_years

teacher_assignments
```

Avoid inconsistent naming.

---

# 65. Primary Keys

Database entities should use a consistent identifier strategy.

The exact identifier type will be finalized before implementation.

A recommended approach is:

```text
UUID
```

or another carefully selected globally safe identifier strategy.

Do not randomly mix identifier types without reason.

---

# 66. Database Integrity

Use database constraints where appropriate.

Examples:

```text
PRIMARY KEY

FOREIGN KEY

UNIQUE

NOT NULL

CHECK
```

Critical data integrity must not depend entirely on frontend validation.

---

# 67. Transaction Management

Operations involving multiple critical database changes should use transactions.

Example:

```text
Create Attendance Session
        +
Create Attendance Records
        +
Create Checkpoints
```

If a critical operation partially fails:

```text
Rollback
```

where appropriate.

Transaction boundaries must be defined in service workflows.

Any tenant-specific database context used during runtime must have a clearly defined transaction/request boundary. Feasibility validation must determine how tenant context begins and ends, how Prisma obtains the tenant-aware database context, how rollback behaves, how concurrent requests behave, and how connection pooling behaves. Tenant context must not rely on persistent mutable state shared across requests.

---

# 68. Configuration Architecture

Configuration must be environment-based.

Use:

```text
.env
```

for local development.

Provide:

```text
.env.example
```

Never commit actual secrets.

Configuration includes:

```text
Database URL

Application Port

JWT Configuration

Environment

Edge Configuration
```

---

# 69. Configuration Validation

Backend configuration should be validated during application startup.

The application should fail safely if critical configuration is missing.

Example:

```text
DATABASE_URL

Missing
    ↓
Application Startup Fails Clearly
```

Do not silently start with invalid configuration.

---

# 70. Docker Architecture

Docker will support local development.

Initial services may include:

```text
docker-compose.yml

│
├── postgres
│
├── backend
│
└── frontend
```

The Edge Agent may later be added.

The exact Docker configuration should remain simple during the MVP.

---

# 71. Environment Separation

The system should support:

```text
Development

Test

Production
```

Development configuration must not automatically become production configuration.

Avoid insecure production defaults.

---

# 72. Testing Architecture

The project must support automated testing.

Backend:

```text
Unit Tests

Integration Tests

API Tests

Authorization Tests

Tenant Isolation Tests
```

Frontend:

```text
Component Tests

Feature Tests
```

Edge:

```text
Unit Tests

Integration Tests where practical
```

---

# 73. Backend Unit Testing

Backend unit tests should focus on:

```text
Business Rules

Attendance Calculation

Validation

State Transitions

Service Logic
```

Business logic should be testable independently.

---

# 74. Integration Testing

Integration tests should verify:

```text
API
 ↓
Authentication
 ↓
Authorization
 ↓
Tenant Context
 ↓
Service
 ↓
Database
```

Integration testing must verify real interactions between important components.

---

# 75. Tenant Isolation Testing

Tenant isolation tests are mandatory.

Test scenarios should include:

```text
School A User

Attempts:

Read School B Data
```

Expected:

```text
Denied
```

Also:

```text
School A User

Attempts:

Modify School B Data
```

Expected:

```text
Denied
```

Tenant isolation must be tested at the backend.

Connection pooling is a tenant-isolation security concern. Validation must prove the following lifecycle:

```text
Tenant A Request
        ↓
Database Connection
        ↓
Tenant A Context
        ↓
Transaction Completes
        ↓
Connection Returns to Pool
        ↓
Tenant B Request
        ↓
No Tenant A State Remains
```

Tests must cover:

* Connection reuse
* Concurrent tenant requests
* Transaction rollback
* Transaction commit
* A connection returned to the pool
* A subsequent request using the same connection

The mechanism must not rely on persistent mutable tenant state shared across requests.

---

# 76. API Documentation

Express.js API documentation can eventually use:

```text
Swagger / OpenAPI
```

API documentation should be generated from controlled DTOs and API definitions where appropriate.

Swagger implementation may be included during the Project Foundation phase.

---

# 77. Health Check Architecture

The system should provide health checks.

Initial health checks may include:

```text
Backend Health
```

Later:

```text
Database Health

Edge Health

Camera Health
```

Health checks should be simple and meaningful.

---

# 78. Logging Architecture

Use structured logging.

Logs should help diagnose:

```text
Startup Problems

Request Failures

Authentication Problems

Authorization Failures

Tenant Violations

Database Failures

Unexpected Errors
```

Do not log:

```text
Passwords

JWT Secrets

Camera Passwords

Unnecessary Biometric Information
```

---

# 79. Error Handling Architecture

Use centralized error handling.

Conceptually:

```text
Error
  ↓
Exception Handling
  ↓
Logging
  ↓
Safe API Response
```

Users should receive understandable messages.

Internal details should remain internal.

---

# 80. Security Architecture

Security is applied in multiple layers.

```text
Frontend
   ↓
HTTPS
   ↓
Authentication
   ↓
Authorization
   ↓
Tenant Context
   ↓
Resource Authorization
   ↓
Database Access
```

Security must not depend on one layer.

---

# 81. Authentication Security

The backend must:

```text
Validate Identity

Validate Credentials

Issue Controlled Token

Validate Token

Reject Invalid Token
```

Do not trust:

```text
Frontend Role

Frontend Tenant ID

Frontend Permission Flag
```

---

# 82. Authorization Security

Authorization must be performed server-side.

Example:

```text
Teacher A

Role:

SUBJECT_TEACHER
```

The backend must verify:

```text
Is Teacher A assigned to this class?

Is Teacher A assigned to this subject?

Is Teacher A allowed to modify this attendance session?
```

---

# 83. Tenant Security

Tenant security is mandatory.

The backend must:

```text
Resolve Tenant

Validate Tenant

Create Trusted Context

Restrict Data Access
```

The client must not control the database schema.

---

# 84. Secret Management

Never commit:

```text
Passwords

API Keys

JWT Secrets

Camera Credentials

Production Database URLs
```

Use environment configuration.

---

# 85. Privacy Architecture

The system should minimize unnecessary data collection.

Important principles:

```text
Minimum Data

Restricted Access

Controlled Processing

Deletion Support

Auditability
```

Facial data should not be transmitted unnecessarily.

---

# 86. Biometric Architecture Boundary

The system must distinguish:

```text
Central Business Platform
```

from:

```text
Local Biometric Processing
```

Conceptually:

```text
CENTRAL PLATFORM

Attendance Sessions

Student Records

Teacher Decisions

Reports


LOCAL SCHOOL EDGE

Camera Processing

Face Detection

Face Recognition

Biometric Storage
```

The exact data boundaries will be refined during the biometric implementation phase.

---

# 87. AI Architecture Boundary

AI components should be replaceable.

The business system should communicate with an abstraction.

```text
Attendance Service
       ↓
Recognition Evidence
       ↓
AI Provider Interface
       ↓
AI Implementation
```

Do not directly embed AI model-specific logic throughout the application.

---

# 88. Future Extensibility

The system may later support:

```text
Classroom Interaction

Student Questions

Answer Analysis

Partial Correctness

Participation Tracking

Student Insights

Behaviour Support

Parent Communication
```

These features are not part of the current attendance MVP.

The architecture should support future modules without implementing them now.

---

# 89. No Premature Microservices

Do not create:

```text
Authentication Microservice

Student Microservice

Attendance Microservice

Teacher Microservice
```

during the MVP.

Use:

```text
One Express.js Application

+
Well-Defined Modules
```

The Edge Agent remains a separate application because of its local infrastructure requirement.

---

# 90. No Premature Infrastructure

Do not introduce:

```text
Kubernetes

Kafka

RabbitMQ

Redis

Elasticsearch

Multiple Load Balancers
```

without a demonstrated requirement.

The MVP should prioritize:

```text
Correctness

Security

Reliability

Simplicity
```

---

# 91. Development Workflow

Each phase should follow:

```text
Read Master Instruction
        ↓
Read Architecture Baseline
        ↓
Read Current Phase Prompt
        ↓
Inspect Existing Code
        ↓
Create Implementation Plan
        ↓
Implement Current Scope
        ↓
Run Tests
        ↓
Fix Errors
        ↓
Verify Definition of Done
        ↓
Phase Complete
```

---

# 92. Git Workflow

The project should use Git.

Recommended approach:

```text
main
```

for stable code.

Feature work may eventually use:

```text
feature/phase-01-foundation

feature/phase-02-multitenancy
```

The exact branching strategy can remain simple during early MVP development.

---

# 93. Documentation Structure

The `docs` directory should contain:

```text
docs/
│
├── 01_MASTER_DEVELOPMENT_INSTRUCTION.md
│
├── 02_ARCHITECTURE_BASELINE.md
│
├── 03_PHASE_IMPLEMENTATION_PLAN.md
│
├── decisions/
│
└── phases/
```

Future documents may include:

```text
docs/decisions/

docs/phases/

docs/api/

docs/database/
```

---

# 94. Architecture Decision Records

Significant decisions should eventually be documented.

Recommended format:

```text
ADR-001

Title

Context

Decision

Reason

Alternatives

Consequences
```

Examples:

```text
Why Express.js?

Why PostgreSQL?

Why Schema-Per-School?

Why Python for Edge AI?
```

---

# 95. Phase Development Rule

Every phase implementation prompt must clearly define:

```text
Phase Objective

Current Scope

Requirements

Dependencies

Database Changes

Backend Changes

Frontend Changes

Tests

Out of Scope

Definition of Done
```

Copilot must implement only the current phase.

---

# 96. Architecture Change Rule

Do not change:

```text
Backend Framework

Database

Tenant Strategy

Core Security Model

Edge Architecture
```

without explicit approval.

If an architecture issue is discovered:

```text
Identify Issue
      ↓
Explain Impact
      ↓
Propose Options
      ↓
Select Solution
      ↓
Update Architecture Documentation
```

Do not silently make major architecture changes.

---

# 97. MVP Implementation Priority

The implementation order should generally follow:

```text
PROJECT FOUNDATION
        ↓
MULTI-TENANT FOUNDATION
        ↓
AUTHENTICATION & AUTHORIZATION
        ↓
SCHOOL ACADEMIC SETUP
        ↓
CLASSROOM & TIMETABLE
        ↓
MANUAL ATTENDANCE
        ↓
ATTENDANCE AUTOMATION ENGINE
        ↓
EDGE DEVICE FOUNDATION
        ↓
FACE DETECTION
        ↓
FACE ENROLLMENT
        ↓
FACE RECOGNITION
        ↓
THREE-CHECKPOINT ATTENDANCE
        ↓
TEACHER REVIEW & CONFIRMATION
        ↓
REPORTING & PILOT IMPROVEMENTS
```

The exact phase breakdown will be documented in:

```text
docs/03_PHASE_IMPLEMENTATION_PLAN.md
```

---

# 98. First Functional Milestone

The first major functional milestone should not wait for facial recognition.

The platform should first achieve:

```text
School Setup
        +
Users
        +
Students
        +
Teachers
        +
Classes
        +
Timetable
        +
Manual Attendance
        +
Teacher Confirmation
```

This allows validation of the attendance workflow before AI automation is introduced.

---

# 99. AI Implementation Priority

AI development should happen after the core attendance workflow exists.

The recommended order is:

```text
Manual Attendance Workflow
        ↓
Attendance Sessions
        ↓
Checkpoint Architecture
        ↓
Edge Agent
        ↓
Camera Integration
        ↓
Face Detection
        ↓
Face Enrollment
        ↓
Face Recognition
        ↓
Recognition Evidence
        ↓
Automated Attendance
```

This prevents AI complexity from blocking development of the core product.

---

# 100. Architecture Principles Summary

The project architecture follows these principles:

```text
1. Modular Monolith Backend

2. Node.js + TypeScript + Express.js

3. React + TypeScript Frontend

4. PostgreSQL Database

5. Schema-Per-School Multi-Tenancy

6. Backend-Controlled Tenant Resolution

7. Backend-Enforced Authorization

8. Resource-Level Access Control

9. Python-Based Edge AI

10. Local Biometric Processing

11. AI Evidence Separate From Final Attendance

12. Teacher as Human Verification Layer

13. Three-Checkpoint Attendance Architecture

14. Manual Attendance Fallback

15. Offline-Tolerant Edge Agent

16. Event Idempotency

17. Modular and Replaceable AI Providers

18. Controlled Database Migrations

19. Automated Testing

20. Tenant Isolation Testing

21. Privacy-Oriented Data Handling

22. No Premature Microservices

23. No Premature Infrastructure

24. Phase-Based Development
```

---

# 101. Final Architecture Rule

Every future implementation must answer:

```text
Does this follow the Master Instruction?

Does this follow the Architecture Baseline?

Does this belong to the current phase?

Does this preserve tenant isolation?

Does this preserve security?

Does this avoid unnecessary complexity?

Is this testable?

Does this preserve existing functionality?
```

If the answer to any critical question is no, the implementation must be reconsidered before proceeding.

---

# END OF ARCHITECTURE BASELINE
