# Master Development Instruction

**Document:** `01_MASTER_DEVELOPMENT_INSTRUCTION.md`
**Status:** Authoritative
**Purpose:** Master engineering instruction for the AI School Classroom Attendance Platform

---

# 1. Purpose

This document defines the master engineering rules, technology stack, architectural principles, security requirements, development standards, and product boundaries for the AI School Classroom Attendance Platform.

All implementation work must follow this document together with:

1. `00_COPILOT_EXECUTION_PROTOCOL.md`
2. `02_ARCHITECTURE_BASELINE.md`
3. `03_PHASE_IMPLEMENTATION_PLAN.md`
4. Relevant phase-specific documentation
5. Approved Architecture Decision Records (ADRs)

This document is a permanent project source-of-truth document.

If implementation requirements conflict with this document, stop and resolve the conflict before implementation.

---

# 2. Product Vision

The platform is an enterprise-grade school classroom attendance system designed to automate classroom attendance using existing CCTV/IP cameras and AI-based face recognition while keeping teachers in control of the final attendance decision.

The long-term product may expand into broader school/classroom intelligence capabilities.

However, the current MVP is intentionally limited to attendance.

## MVP North Star

> Reliably automate classroom attendance in a real Indian school while keeping the teacher in control.

---

# 3. Current MVP Scope

The MVP focuses on:

* School management foundation
* Academic structure
* Students
* Teachers
* Classes and sections
* Classrooms
* Cameras
* Timetable
* Classroom-level attendance
* Three attendance checkpoints
* Face recognition
* Attendance evidence
* Preliminary attendance calculation
* Teacher review
* Teacher override
* Teacher confirmation
* Attendance audit trail
* Attendance reports
* Offline/manual fallback
* Privacy and tenant isolation

The MVP must remain simple enough to validate the core product before expanding into additional intelligence features.

---

# 4. Explicitly Out of Scope for Current MVP

The following must NOT be implemented unless explicitly approved in a future phase:

* Classroom interaction analysis
* Student answer analysis
* Student activeness scoring
* Teacher question/answer analysis
* General classroom behavior intelligence
* AI tutoring
* Automated grading
* Student performance prediction
* Facial emotion analysis
* School-entry attendance as the primary attendance mechanism
* QR-code attendance
* Unapproved biometric cloud processing
* Unapproved global facial database

Future capabilities must not leak into the current MVP architecture or implementation scope.

---

# 5. Approved Technology Stack

The technology stack is intentionally divided by system responsibility.

## 5.1 Backend

```text
Node.js
Express.js
TypeScript
```

Backend architecture:

```text
Modular Monolith
```

The backend is responsible for:

* Authentication
* Authorization
* Tenant resolution
* School management
* Academic management
* Attendance management
* Camera management
* Timetable management
* Teacher workflows
* Audit logging
* APIs
* Reporting
* Edge-agent communication

---

# 6. Database

Primary database:

```text
PostgreSQL
```

Target production tenancy model:

```text
PostgreSQL
│
├── platform
├── school_<tenant_a>
├── school_<tenant_b>
├── school_<tenant_c>
└── ...
```

Each school must have its own PostgreSQL schema for tenant-owned business data.

The platform metadata required to resolve and manage tenants may reside in a controlled platform schema.

---

# 7. ORM

Approved ORM:

```text
Prisma
```

Prisma must be used for normal application database access wherever technically appropriate.

The project must not introduce another ORM without an explicit architecture decision.

The team must validate that Prisma can safely support the required schema-per-school architecture before finalizing the Phase 1 implementation strategy.

This feasibility validation is mandatory because tenant isolation is a security-critical architectural boundary.

---

# 8. Frontend

Approved frontend stack:

```text
React
TypeScript
Vite
```

The frontend is responsible for:

* Authentication UI
* School administration UI
* Academic management UI
* Teacher workflows
* Attendance review
* Attendance confirmation
* Reports
* Dashboard views
* Configuration interfaces

The frontend must never be treated as a trusted security boundary.

---

# 9. Edge AI

Approved Edge AI language:

```text
Python
```

Python is reserved primarily for the future local/edge AI processing layer.

The Edge AI system may eventually handle:

* CCTV/IP camera integration
* Face detection
* Face quality assessment
* Face recognition
* Basic liveness/anti-spoofing
* Local biometric template processing
* Local attendance evidence generation
* Local durable event queue
* Offline processing
* Secure synchronization with the backend

Python must NOT be used as a replacement for the core NestJS backend.

---

# 10. Architecture

The system uses a modular-monolith backend architecture initially.

High-level architecture:

```text
React Frontend
       │
       │ HTTPS/API
       ▼
NestJS Backend
       │
       ├── Authentication
       ├── Authorization
       ├── Tenant Context
       ├── School Management
       ├── Academic Management
       ├── Classroom Management
       ├── Camera Management
       ├── Timetable
       ├── Attendance
       ├── Audit
       └── Reporting
       │
       ▼
PostgreSQL
       │
       ├── platform schema
       ├── school schema A
       ├── school schema B
       └── school schema N

Future:

School Classroom
       │
       ▼
Existing CCTV/IP Cameras
       │
       ▼
Python Edge AI Agent
       │
       ▼
Secure Backend API
```

The system should remain modular internally even though it is deployed initially as a monolith.

---

# 11. Core Domain Hierarchy

The core domain hierarchy is:

```text
School
  ↓
Academic Year
  ↓
Class
  ↓
Section
  ↓
Student
```

Teaching and classroom relationships:

```text
School
  ↓
Teacher
  ↓
Subject
  ↓
Class / Section
  ↓
Classroom
  ↓
Camera
  ↓
Timetable
```

Attendance relationship:

```text
Classroom
   ↓
Timetable / Scheduled Class
   ↓
Attendance Session
   ↓
Attendance Evidence
   ↓
Preliminary Attendance
   ↓
Teacher Review
   ↓
Teacher Decision
   ↓
Final Attendance
```

---

# 12. Attendance Architecture

Attendance is classroom-level and period-based.

The system must NOT rely on school-entry attendance as the primary attendance mechanism.

The system uses existing CCTV/IP cameras installed in classrooms.

Each scheduled class has three attendance checkpoints:

```text
START
  ↓
MIDDLE
  ↓
END
```

Conceptual flow:

```text
Camera detects face
        ↓
Face recognized
        ↓
Start checkpoint
        ↓
Middle checkpoint
        ↓
End checkpoint
        ↓
Attendance calculated
        ↓
Teacher reviews exceptions
        ↓
Teacher confirms
```

---

# 13. Attendance Decision Rules

A student may receive preliminary AI-present status when evidence shows presence at all three checkpoints.

Conceptually:

```text
START = Present
AND
MIDDLE = Present
AND
END = Present
```

Then:

```text
Preliminary Attendance = Present
```

If one or more checkpoints are missing, the system must not blindly assume that the student was absent.

Possible causes include:

* Camera failure
* Network failure
* Recognition failure
* Poor image quality
* Student temporarily outside camera view
* Authorized absence
* Edge-agent failure
* Other system exceptions

Therefore:

```text
Incomplete evidence
        ↓
Exception / Review Required
```

System failure must never automatically become student absence.

---

# 14. Teacher Authority

The AI system provides attendance evidence and a preliminary attendance result.

The teacher remains the final authority.

Architecture:

```text
Recognition Evidence
        ↓
Preliminary Attendance
        ↓
Teacher Decision
        ↓
Final Attendance
```

The teacher must be able to:

* Review attendance
* Accept system attendance
* Change present to absent
* Change absent/exception to present
* Mark authorized/excused status where supported
* Add notes
* Override system decisions

If a teacher changes an AI-generated result, a reason must be recorded.

The original AI evidence must never be silently overwritten.

---

# 15. Attendance Auditability

Attendance decisions must be auditable.

For significant attendance changes, retain:

```text
Who
What
When
Previous value
New value
Reason
Notes where applicable
```

The system should preserve:

* AI-generated evidence
* Preliminary result
* Teacher decision
* Final result
* Override reason
* Confirmation information

Audit records must not be editable through ordinary application workflows.

---

# 16. Manual Fallback

The system must support manual attendance when AI/camera functionality is unavailable.

Expected behavior:

```text
Camera Offline
      ↓
AI unavailable
      ↓
Teacher marks attendance manually
      ↓
Teacher confirms
```

The platform must continue to support school operations during temporary technical failures.

The following rule is mandatory:

> Infrastructure or AI failure must never automatically result in a student being marked absent.

---

# 17. Multi-Tenancy

Multi-tenancy is a critical security boundary.

The target model is:

```text
One School = One Tenant
One Tenant = One PostgreSQL Schema
```

Example:

```text
platform
school_001
school_002
school_003
```

Tenant-owned data must remain isolated.

A school must never be able to access another school's data.

---

# 18. Tenant Resolution

Tenant context must be established by trusted backend-controlled mechanisms.

The frontend must NOT be trusted to determine the tenant.

The following patterns are prohibited:

```text
?tenantId=school_002
```

```text
?schema=school_002
```

```text
request.schema
```

```text
request.tenantId
```

when those values are used directly to determine database access without trusted backend validation.

The backend must:

```text
Authenticate
    ↓
Resolve trusted tenant context
    ↓
Validate tenant status
    ↓
Authorize operation
    ↓
Resolve approved schema mapping
    ↓
Access tenant data
```

---

# 19. Tenant Isolation Requirements

The system must enforce:

```text
School A → School A data = ALLOWED
School B → School B data = ALLOWED

School A → School B data = DENIED
School B → School A data = DENIED
```

Isolation must be enforced server-side.

Security must not depend on:

* Frontend behavior
* Hidden form fields
* UI restrictions
* Client-side tenant IDs
* Client-side role checks

The backend must enforce tenant isolation for every tenant-owned operation.

---

# 20. Tenant Security Testing

Tenant isolation tests are mandatory.

At minimum, test:

```text
A → A
B → B
A → B
B → A
```

Also test:

* Missing tenant context
* Invalid tenant
* Disabled tenant
* Invalid schema mapping
* Client-provided tenant override
* Client-provided schema override
* Foreign resource ID
* Concurrent tenant requests
* Transaction rollback
* Database connection reuse
* Connection-pool behavior
* Tenant provisioning
* Tenant migration/version tracking

Concurrency and connection reuse are especially important because PostgreSQL connection state must never leak between tenants.

---

# 21. Prisma Schema-Per-School Requirement

Before production implementation of Phase 1, the project must perform a technical feasibility validation of the selected Prisma/PostgreSQL tenancy strategy.

The validation must prove that the selected implementation can safely provide:

```text
Tenant A → Tenant A schema
Tenant B → Tenant B schema
```

without cross-tenant leakage.

The validation must include, where applicable:

* Generated Prisma queries
* Transaction behavior
* Connection pooling
* Concurrent tenant requests
* Rollback
* Connection reuse
* Schema resolution
* Runtime school provisioning
* Migration strategy
* Security against arbitrary schema selection

No unvalidated tenant architecture should be promoted to production implementation.

---

# 22. Security Principles

Security is a first-class requirement.

The system must follow:

* Least privilege
* Defense in depth
* Secure authentication
* Backend authorization
* Tenant isolation
* Input validation
* Output validation where appropriate
* Secure configuration
* Secret management
* Auditability
* Data minimization
* Secure error handling
* Secure logging
* Dependency hygiene
* Encryption where appropriate

Security must be designed into the system rather than added after implementation.

---

# 23. Authentication and Authorization

Authentication and authorization are backend responsibilities.

The platform will eventually support:

```text
SCHOOL_ADMIN
SUBJECT_TEACHER
CLASS_TEACHER
PRINCIPAL
```

Authorization must include:

1. Authentication
2. Tenant authorization
3. Role authorization
4. Resource-level authorization

A valid authenticated user must not automatically have access to every resource in the school.

---

# 24. Frontend Security Rule

The frontend may hide UI elements based on roles or permissions for usability.

However:

> Frontend checks are never security controls.

Every protected API operation must independently validate:

```text
Authenticated user
+
Tenant
+
Role
+
Resource access
```

---

# 25. Biometric and Privacy Principles

Facial recognition introduces sensitive privacy and security considerations.

The system should follow data-minimization principles.

Preferred architecture:

```text
Camera
   ↓
Local/School-controlled processing
   ↓
Face recognition
   ↓
Attendance evidence
   ↓
Secure backend synchronization
```

The platform should avoid sending continuous classroom video to a central backend when local processing can accomplish the task.

Biometric data must be:

* Access controlled
* Protected at rest
* Protected in transit
* Retained only as required
* Deletable according to approved retention rules
* Isolated by school
* Auditable

The system should prefer biometric templates/embeddings over unnecessary storage of raw facial images where technically and legally appropriate.

---

# 26. Biometric Deletion

Student biometric information must support controlled deletion.

Example:

```text
Student leaves school
        ↓
Authorized deletion request
        ↓
Biometric data removed
        ↓
Deletion recorded in audit trail
```

Deletion workflows must not accidentally delete unrelated tenant data.

---

# 27. AI Reliability Principles

AI output must be treated as evidence rather than unquestionable truth.

The platform must preserve:

* Recognition confidence
* Recognition result
* Checkpoint
* Timestamp
* Camera/source
* Processing status
* Relevant quality information
* Exceptions

Low-confidence or incomplete results should be surfaced for review rather than silently converted into definitive attendance.

---

# 28. Edge Processing and Offline Reliability

The future Edge AI system must be designed for unreliable school networks.

The expected architecture includes:

```text
Camera
 ↓
Edge AI Agent
 ↓
Local Durable Queue
 ↓
Secure Synchronization
 ↓
Backend
```

The edge agent should support:

* Local buffering
* Retry
* Idempotent synchronization
* Device identity
* Secure authentication
* Duplicate protection
* Offline operation
* Recovery after restart

These capabilities belong to the appropriate future phases and must not be prematurely implemented in earlier phases.

---

# 29. Configuration Management

Configuration must be environment-based.

Examples:

```text
DATABASE_URL
PORT
NODE_ENV
JWT_SECRET
```

Production secrets must never be committed to Git.

Use:

```text
.env.example
```

for documenting required configuration variables.

Actual secrets must remain outside source control.

---

# 30. API Standards

Backend APIs must follow consistent conventions.

Requirements include:

* Clear resource naming
* Request validation
* Consistent HTTP status codes
* Consistent error responses
* Authentication enforcement
* Authorization enforcement
* Tenant enforcement
* Appropriate logging
* API documentation where applicable

Internal implementation details must not unnecessarily leak through API error responses.

---

# 31. Validation and Error Handling

Backend inputs must be validated.

Invalid input must fail safely and predictably.

Errors must:

* Return appropriate status codes
* Avoid exposing secrets
* Avoid exposing internal stack traces in production
* Provide useful client-safe messages
* Be logged appropriately for diagnosis

---

# 32. Database Principles

Database design must prioritize:

* Data integrity
* Tenant isolation
* Referential integrity
* Appropriate constraints
* Appropriate indexes
* Transactional consistency
* Auditability
* Migration safety

Schema changes must be performed through controlled migrations.

Destructive database operations require explicit approval.

---

# 33. Migration Principles

Database migrations must be:

* Version controlled
* Reproducible
* Reviewable
* Environment-aware
* Safe to execute
* Tested before production deployment

Tenant schema migration strategy must support future school provisioning without requiring unsafe manual database modifications.

The exact implementation strategy must be established through Phase 1 feasibility validation.

---

# 34. Testing Standards

Testing is mandatory.

The project should include appropriate levels of:

```text
Unit Tests
Integration Tests
API Tests
Security Tests
Tenant Isolation Tests
Database Tests
End-to-End Tests
```

Not every phase requires every category, but every phase must implement tests appropriate to its scope.

Security-critical behavior requires negative tests.

Example:

```text
Valid access → PASS

Unauthorized access → DENY
Foreign tenant access → DENY
Invalid input → DENY
```

---

# 35. Test Quality

Tests must verify behavior, not merely code coverage.

Avoid:

* Empty tests
* Placeholder assertions
* Tests that only check the application starts
* Mocking away the behavior being validated
* Tests that pass while the real security boundary is broken

Tests should fail when the intended behavior is broken.

---

# 36. Observability

The production architecture should support:

* Structured logging
* Health checks
* Error monitoring
* Request tracing where appropriate
* Audit logging
* Operational metrics
* Camera/edge-agent status
* Attendance processing status

Sensitive biometric data must not be unnecessarily written to logs.

---

# 37. Performance and Scalability

The initial system is a modular monolith, but design decisions must not unnecessarily prevent future scaling.

Consider:

* Database indexes
* Efficient queries
* Connection pooling
* Background processing where required
* Async operations
* Caching where justified
* Edge processing
* Pagination
* Batch processing
* Tenant isolation

Premature microservices are not required for the MVP.

---

# 38. Maintainability

Code must be:

* Modular
* Readable
* Typed
* Testable
* Documented where necessary
* Consistent
* Easy to extend

Avoid unnecessary abstraction.

Do not create frameworks inside the framework without a clear requirement.

---

# 39. Architecture Decision Records

Important architectural decisions must be recorded under:

```text
docs/decisions/
```

Examples:

```text
ADR-001-schema-per-school.md
ADR-002-prisma-tenant-strategy.md
ADR-003-edge-processing.md
```

An ADR should be created or updated when a decision materially changes architecture, security, tenancy, data ownership, or deployment behavior.

---

# 40. Phase Discipline

The project is implemented incrementally.

The current phase must not implement future-phase business functionality.

Example:

During Phase 0:

```text
DO:
- Project setup
- Database connectivity
- Configuration
- Health checks
- Basic testing

DO NOT:
- Authentication
- Students
- Teachers
- Attendance
- Face recognition
- Cameras
- Timetable
- Tenant business logic
```

Future functionality must be implemented only in its designated phase unless explicitly approved.

---

# 41. No Scope Creep

Developers and Copilot must not add features simply because they may be useful later.

If a requirement belongs to a future phase:

```text
Do not implement it now.
```

If implementation of the current phase genuinely requires a future architectural dependency:

```text
Stop
↓
Document the dependency
↓
Explain the impact
↓
Request approval
```

Do not silently expand scope.

---

# 42. No Fake Implementations

The project must not contain fake production implementations such as:

```text
TODO: implement later
```

presented as completed functionality.

Avoid:

* Fake authentication
* Fake tenant isolation
* Fake database behavior
* Hardcoded tenant selection
* Fake AI results
* Hardcoded attendance
* Placeholder security mechanisms
* Dummy production APIs presented as complete

A mock or stub is acceptable only when explicitly required for testing and clearly identified as such.

---

# 43. Development Environment

Local development should support reproducible setup using Docker where practical.

Expected local infrastructure:

```text
PostgreSQL
Backend
Frontend
```

The project should maintain:

* Docker configuration
* Environment examples
* Setup documentation
* Database migration instructions
* Test instructions

If a required development tool is unavailable in the current environment, do not pretend validation succeeded.

Report the limitation explicitly.

---

# 44. Git and Source Control

Source code and engineering documents must be version controlled.

Do not commit:

```text
.env
Secrets
Passwords
Private keys
Production credentials
Biometric data
Student personal data
Temporary runtime files
```

Maintain an appropriate `.gitignore`.

---

# 45. Data Privacy

Student and teacher data must be handled according to data-minimization and security principles.

The platform should collect only data required for its approved functionality.

Sensitive information must have:

* Access controls
* Appropriate retention
* Secure storage
* Secure transmission
* Auditability
* Deletion capability where applicable

---

# 46. School Data Ownership Principle

School data must remain logically isolated from other schools.

The architecture must prevent:

```text
School A
   ↓
School B data
```

even if a malicious or incorrectly configured client attempts to access it.

Tenant isolation is a backend/database security requirement, not a UI feature.

---

# 47. API and Tenant Trust Boundary

Never trust client-supplied values for security-critical decisions.

Untrusted:

```text
tenantId
schoolId
schema
role
permissions
attendance final status
```

must not be accepted as authoritative merely because they are included in a request.

Trusted values must come from:

* Authenticated identity
* Backend-controlled tenant mapping
* Server-side authorization
* Database state
* Controlled configuration

---

# 48. Attendance Finalization Trust Boundary

The AI system must not bypass teacher authorization for final attendance.

The system must maintain the distinction:

```text
AI Evidence
      ≠
Final Attendance
```

and:

```text
AI Recommendation
      ≠
Teacher Decision
```

The teacher confirmation workflow is a deliberate product requirement.

---

# 49. Required Engineering Behavior for Copilot

GitHub Copilot must:

1. Read the required project documents before implementation.
2. Inspect the existing repository.
3. Understand current architecture.
4. Identify conflicts before coding.
5. Plan before modifying code.
6. Implement only the requested phase.
7. Follow security requirements.
8. Preserve tenant isolation.
9. Add appropriate tests.
10. Validate the implementation.
11. Report what changed.
12. Report what was not implemented.
13. Report unresolved issues.
14. Never claim validation that was not actually performed.

---

# 50. Conflict Resolution

If any of the project documents conflict:

```text
STOP
↓
Identify the conflict
↓
Determine the authoritative requirement
↓
Resolve the documentation
↓
Only then implement
```

Do not silently choose one conflicting architecture.

The project must maintain a single consistent architecture.

---

# 51. Current Approved Architecture Summary

The current approved baseline is:

```text
Frontend
React + TypeScript + Vite

Backend
Node.js + NestJS + TypeScript

Architecture
Modular Monolith

Database
PostgreSQL

ORM
Prisma

Multi-Tenancy
PostgreSQL schema-per-school

Edge AI
Python

Primary AI Processing Location
School/local edge environment where practical

Attendance
Classroom-level, period-based

Checkpoints
START + MIDDLE + END

AI Role
Evidence + preliminary attendance

Teacher Role
Review + override + final confirmation

Tenant Security
Backend-controlled tenant isolation

Current MVP
Attendance only
```

---

# 52. Phase Roadmap

The implementation follows the approved phase plan.

```text
Phase 0
Project Foundation

Phase 1
Multi-Tenant Database Foundation

Phase 2
Authentication & RBAC

Phase 3
School / Academic Setup

Phase 4
Classroom / Camera / Timetable

Phase 5
Manual Attendance

Phase 6
Edge Agent Foundation

Phase 7
Face Recognition

Phase 8
Automated Attendance

Phase 9
Teacher Review / Override / Audit

Phase 10
Reports / Dashboards

Phase 11
Pilot Hardening
```

Each phase must respect its defined scope.

---

# 53. Definition of Engineering Success

The system is considered successfully engineered only when it is:

* Functionally correct
* Secure
* Tenant-isolated
* Testable
* Maintainable
* Auditable
* Privacy-conscious
* Reliable
* Observable
* Deployable
* Consistent with the approved architecture

Feature completion alone is not sufficient.

---

# 54. Final Engineering Principle

The project must follow this principle:

> Build the smallest production-quality system that solves the current problem, while preserving the security, privacy, reliability, and architectural foundations required for future expansion.

The current priority is:

```text
Correctness
↓
Security
↓
Tenant Isolation
↓
Privacy
↓
Reliability
↓
Testability
↓
Maintainability
↓
Scalability
↓
Feature Expansion
```

Never sacrifice a security or tenant-isolation boundary merely to implement a feature faster.

---

# 55. Document Status

This document is authoritative for the project's master engineering direction.

Any material architectural change must be explicitly reviewed and reflected in the appropriate documentation and ADR before implementation proceeds.
