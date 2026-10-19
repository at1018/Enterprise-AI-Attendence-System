# GitHub Copilot — Project Execution Protocol

**Document:** `docs/00_COPILOT_EXECUTION_PROTOCOL.md`
**Status:** Mandatory
**Purpose:** Permanent engineering execution rules for GitHub Copilot
**Applies to:** Entire AI School Classroom Attendance Platform
**Authority:** Highest project-level execution instruction

---

# 1. Purpose

This document defines how GitHub Copilot must work on this project.

Copilot must not treat the repository as an unrestricted coding task.

The project is an enterprise-grade, multi-tenant AI classroom attendance platform. Development must follow the approved product requirements, architecture, security model, privacy requirements, database strategy, and phase plan.

Copilot must:

1. Read the required project documents before implementation.
2. Understand the architecture before changing code.
3. Inspect the existing repository before modifying it.
4. Implement only the requested development phase.
5. Never silently change architectural decisions.
6. Never invent security-sensitive behavior.
7. Never trust client-controlled tenant, role, permission, or schema information.
8. Protect school-to-school tenant isolation.
9. Add appropriate tests with implementation.
10. Validate the implementation against the project's Definition of Done.
11. Clearly report what was implemented and what remains unresolved.

The objective is not merely to produce compiling code.

The objective is to produce **correct, secure, maintainable, testable, production-oriented software that remains consistent with the approved project architecture.**

---

# 2. Mandatory Project Documents

Before implementing any feature, Copilot MUST read the following documents:

```text
docs/00_COPILOT_EXECUTION_PROTOCOL.md
docs/01_MASTER_DEVELOPMENT_INSTRUCTION.md
docs/02_ARCHITECTURE_BASELINE.md
docs/03_PHASE_IMPLEMENTATION_PLAN.md
```

These documents form the project's engineering source of truth.

If phase-specific documentation exists under:

```text
docs/phases/
```

Copilot must also read the relevant phase documentation before implementing that phase.

If architecture decision records exist under:

```text
docs/decisions/
```

Copilot must inspect relevant decisions before making changes that affect those decisions.

---

# 3. Document Authority and Priority

When multiple sources provide instructions, use the following priority:

```text
1. 00_COPILOT_EXECUTION_PROTOCOL.md
        ↓
2. 01_MASTER_DEVELOPMENT_INSTRUCTION.md
        ↓
3. 02_ARCHITECTURE_BASELINE.md
        ↓
4. 03_PHASE_IMPLEMENTATION_PLAN.md
        ↓
5. Relevant phase-specific documentation
        ↓
6. Current user/phase implementation instruction
        ↓
7. Existing source code
```

However, the current implementation request determines **which approved functionality should be implemented now**.

If existing code conflicts with the approved architecture:

* Do not silently preserve the incorrect architecture.
* Do not silently redesign the system.
* Identify the conflict.
* Determine whether the conflict is within the current phase.
* Fix it if it belongs to the current phase.
* Otherwise report it as an unresolved issue or required architectural decision.

---

# 4. Documents Are Constraints, Not Suggestions

Copilot must not merely read the documentation and then implement code based on its own assumptions.

The documentation defines constraints for:

* architecture
* technology stack
* database
* multi-tenancy
* authentication
* authorization
* privacy
* biometric data
* attendance
* edge processing
* APIs
* testing
* security
* deployment
* phase boundaries

If a requirement is explicitly documented, Copilot must follow it.

Do not replace an approved architecture with a personally preferred architecture.

---

# 5. Mandatory Pre-Implementation Procedure

Before changing any code, perform the following sequence.

```text
Step 1
Read mandatory project documents.

Step 2
Identify the requested phase.

Step 3
Identify the exact functionality allowed in that phase.

Step 4
Identify functionality explicitly excluded from that phase.

Step 5
Inspect the existing repository.

Step 6
Inspect relevant source files.

Step 7
Inspect existing configuration.

Step 8
Inspect database/Prisma configuration when relevant.

Step 9
Inspect existing tests.

Step 10
Determine the minimum safe implementation.

Step 11
Implement only the approved scope.

Step 12
Run appropriate tests.

Step 13
Validate architecture/security/tenant isolation.

Step 14
Validate the phase Definition of Done.

Step 15
Produce the required completion report.
```

---

# 6. Repository Inspection Is Mandatory

Never assume that the repository is empty.

Before modifying files, inspect:

```text
backend/
frontend/
edge-ai/
database/
infrastructure/
docs/
scripts/
package files
Docker files
environment files
Prisma configuration
test configuration
CI/CD configuration
```

Also inspect:

* existing modules
* existing services
* existing controllers
* existing database configuration
* existing schemas
* existing tests
* existing configuration
* existing API conventions
* existing error handling
* existing logging

Do not overwrite working code without understanding it.

---

# 7. Phase Boundary Rule

This is a strict rule.

When instructed to implement:

```text
Phase X
```

Copilot must implement **Phase X only**.

Do not implement future phases.

Do not partially implement future features.

Do not create unnecessary infrastructure for future features unless the current phase explicitly requires it.

Do not add:

* authentication during a foundation phase unless required
* attendance during database foundation
* face recognition before the face-recognition phase
* AI attendance before the automated-attendance phase
* parent functionality during the MVP foundation
* classroom intelligence during attendance implementation

Future architecture may be considered when designing current interfaces, but future functionality must not be implemented prematurely.

---

# 8. No Scope Creep

Do not expand the requested task because a future feature appears useful.

For example:

If Phase 0 requests:

```text
NestJS
React
PostgreSQL
Prisma
Docker
configuration
health check
basic tests
```

Do NOT additionally implement:

```text
authentication
RBAC
students
teachers
attendance
face recognition
AI
camera processing
tenant onboarding
parent applications
reports
```

If future functionality requires a placeholder interface, keep it minimal and document it.

---

# 9. Technology Stack Is Locked

The approved technology stack is:

### Backend

```text
NestJS
TypeScript
```

### Database

```text
PostgreSQL
Prisma
```

### Frontend

```text
React
TypeScript
Vite
```

### Edge AI

```text
Python
```

### Backend Architecture

```text
Modular Monolith
```

### Multi-Tenancy

```text
PostgreSQL Schema-per-School
```

Do not replace these technologies with alternatives.

Do not introduce:

* another ORM
* another backend framework
* another database
* microservices
* unnecessary message brokers
* unnecessary Kubernetes infrastructure
* unnecessary cloud services

unless explicitly approved through an architecture change.

---

# 10. Architecture Change Rule

Copilot must not make major architectural decisions silently.

Examples include:

* changing PostgreSQL strategy
* changing Prisma strategy
* changing multi-tenancy strategy
* introducing microservices
* introducing Redis
* introducing Kafka
* introducing a new authentication provider
* changing biometric storage architecture
* changing edge/backend boundaries
* changing API architecture
* introducing a new frontend framework

If such a change becomes necessary:

```text
STOP
↓
Explain the problem
↓
Explain why the current architecture cannot satisfy it
↓
Propose the smallest reasonable change
↓
Request human approval
```

Do not silently implement the change.

---

# 11. Enterprise Application Standard

Treat this project as an enterprise application.

Every implementation should consider:

```text
Security
Tenant Isolation
Authorization
Data Integrity
Privacy
Auditability
Reliability
Maintainability
Testability
Observability
Performance
Scalability
Failure Handling
```

"Works on my machine" is not an acceptable completion criterion.

---

# 12. Multi-Tenant Architecture

The application uses:

```text
PostgreSQL
│
├── platform
├── school_a
├── school_b
└── school_c
```

Each school is an independent tenant.

School-specific data must remain isolated.

The application must never allow a user from School A to access School B data.

---

# 13. Tenant Identification Rule

Tenant identity must be established by the backend from trusted authentication/session/device context.

The frontend must never be trusted to determine the tenant.

Never implement unsafe patterns such as:

```text
GET /students?schema=school_b
```

or:

```text
request.schema = "school_b"
```

or:

```text
request.tenantId = arbitraryTenantId
```

without backend validation.

Correct conceptual flow:

```text
Request
↓
Authentication
↓
Authenticated Identity
↓
Trusted Tenant Context
↓
Tenant Validation
↓
Authorization
↓
Tenant Database Access
```

---

# 14. Tenant Isolation Requirements

For every tenant-aware feature, Copilot must answer:

1. How is the tenant established?
2. How is the tenant validated?
3. How is tenant context propagated?
4. Which database schema is used?
5. How is cross-tenant access prevented?
6. What happens if a user supplies another tenant's resource ID?
7. What test proves tenant isolation?

Tenant isolation must exist at both:

```text
Application logic
+
Database access boundary
```

Do not rely solely on frontend restrictions.

---

# 15. Cross-Tenant Security Tests

Where applicable, tests must verify scenarios such as:

```text
School A user → School A data
        PASS

School A user → School B student
        DENY

School A user → School B attendance
        DENY

School A user → School B resource ID
        DENY

School A user → School B modification
        DENY
```

A feature involving tenant data is not complete until appropriate isolation tests exist.

---

# 16. Backend Is the Authority

Never trust the frontend for:

```text
Tenant
Role
Permission
Schema
Authorization
Final Attendance
Security decisions
```

The frontend may display information based on permissions, but the backend must independently enforce authorization.

---

# 17. Authentication and Authorization

When authentication and authorization are implemented, use:

```text
Authentication
↓
Identity
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

Roles include:

```text
SCHOOL_ADMIN
SUBJECT_TEACHER
CLASS_TEACHER
PRINCIPAL
```

Role checks alone are insufficient.

Resource-level authorization must be used where required.

Example:

A subject teacher must not automatically be able to modify attendance for every class in the school.

---

# 18. Database Rules

Database changes must:

* preserve referential integrity
* use appropriate primary keys
* use appropriate foreign keys
* use appropriate unique constraints
* use appropriate indexes
* avoid unnecessary duplication
* use transactions where atomicity is required
* follow the approved Prisma strategy
* follow the approved tenant schema strategy

Do not create database shortcuts that weaken tenant isolation.

---

# 19. Prisma Rule

Prisma is the approved ORM.

Copilot must not invent unsafe dynamic schema switching.

For schema-per-school implementation:

```text
DO NOT ASSUME
```

that arbitrary runtime schema manipulation is automatically safe.

Before implementing tenant-aware Prisma behavior:

1. inspect the approved architecture
2. inspect the current Prisma version/configuration
3. verify the supported strategy
4. implement a controlled data-access approach
5. test tenant isolation

If the chosen approach is technically uncertain, report the uncertainty instead of pretending it is solved.

---

# 20. Attendance Architecture

Attendance follows this conceptual model:

```text
Scheduled Class
↓
Attendance Session
↓
START Checkpoint
↓
MIDDLE Checkpoint
↓
END Checkpoint
↓
Recognition Evidence
↓
Preliminary Attendance
↓
Teacher Review
↓
Teacher Decision
↓
Final Attendance
```

AI recognition is evidence.

AI must not automatically become the final attendance authority.

---

# 21. Attendance Failure Rule

System failure must never automatically mean:

```text
ABSENT
```

Examples:

```text
Camera offline
Recognition failure
Poor lighting
Network failure
Low confidence
Camera obstruction
Temporary student absence from camera view
```

must be handled using the approved exception/review flow.

---

# 22. Teacher Authority

The teacher remains the final authority for attendance.

The system must support:

```text
AI result
↓
Teacher review
↓
Accept
OR
Change
↓
Reason required when changing
↓
Teacher confirmation
↓
Final attendance
```

Original AI evidence must remain preserved.

---

# 23. Auditability

Important actions must be auditable.

Where applicable, preserve:

```text
Who
What
When
Previous value
New value
Reason
Source
```

Teacher changes to AI-generated attendance must not overwrite the original evidence.

---

# 24. Biometric and Privacy Rules

Facial/biometric information is sensitive.

The architecture must follow:

```text
Data Minimization
Tenant Isolation
Access Control
Encryption
Retention Policy
Deletion
Auditability
```

Do not create a global company-wide biometric database of students.

Prefer local/school-controlled biometric processing and storage according to the approved architecture.

Do not retain raw face images unnecessarily.

Do not send continuous classroom video to the central platform unless explicitly required and approved.

---

# 25. Biometric Deletion

When a student leaves or moves schools, the approved lifecycle must support controlled biometric deletion.

Deletion must be:

```text
Authorized
Controlled
Auditable
Tenant-scoped
```

Do not implement uncontrolled permanent deletion without considering audit requirements and retention policy.

---

# 26. Edge AI Architecture

The edge agent is responsible for local classroom processing.

Conceptually:

```text
Camera
↓
Edge Agent
↓
Face Detection
↓
Quality Validation
↓
Face Recognition
↓
Recognition Evidence
↓
Local Durable Queue
↓
Backend Synchronization
```

The edge agent should minimize unnecessary transmission of raw video/images.

---

# 27. Offline-First Edge Rule

When the network is unavailable:

```text
Recognition Event
↓
Local Durable Storage
↓
Retry
↓
Backend
```

Events must not simply disappear because the network is unavailable.

Synchronization should use:

* unique event IDs
* retry handling
* idempotency
* safe acknowledgement

Duplicate events must not create duplicate business records.

---

# 28. API Design

APIs must:

* validate input
* authenticate requests
* authorize requests
* validate tenant context
* return consistent errors
* avoid leaking sensitive information
* avoid exposing internal implementation details
* follow established project conventions

Do not accept security-sensitive values from the client without backend validation.

---

# 29. Error Handling

Errors must be intentional.

Do not expose:

* stack traces
* database credentials
* SQL details
* internal paths
* secrets
* tenant information belonging to another school

Use appropriate HTTP status codes and project-standard error responses.

---

# 30. Configuration Management

Configuration must not be hardcoded.

Use environment/configuration management for:

```text
Database URL
Authentication secrets
Encryption keys
External service credentials
Environment-specific settings
```

Secrets must never be committed to Git.

Provide safe configuration validation.

---

# 31. Environment Separation

Support appropriate environments such as:

```text
development
test
production
```

Do not use production secrets or production data in development/testing.

Do not commit real credentials.

---

# 32. Testing Is Mandatory

Code completion is not feature completion.

Every implementation must include appropriate tests.

Depending on the feature, use:

```text
Unit Tests
Integration Tests
API Tests
Authorization Tests
Tenant Isolation Tests
Database Tests
Frontend Tests
Edge Tests
End-to-End Tests
```

Not every feature requires every test category, but the relevant categories must be considered.

---

# 33. Test Quality

Tests must verify behavior, not merely code execution.

Bad example:

```text
Service exists
```

Better:

```text
Service returns correct result
Service rejects unauthorized user
Service rejects wrong tenant
Service preserves data integrity
```

Security-sensitive behavior must have negative tests.

---

# 34. Security Testing

For security-sensitive functionality, test both:

```text
Allowed behavior
+
Denied behavior
```

Examples:

```text
Authorized user → allowed
Unauthorized user → denied

Correct tenant → allowed
Wrong tenant → denied

Valid resource → allowed
Foreign resource → denied
```

---

# 35. No Fake Implementations

Do not mark a feature as implemented when it is only:

* a placeholder
* a TODO
* mocked without disclosure
* returning hardcoded values
* bypassing security
* returning fake success
* using fake database behavior

If a temporary stub is required by the current phase, clearly label it and report it.

---

# 36. Dependency Discipline

Do not add dependencies simply because they are convenient.

Before adding a dependency:

1. Check whether existing project dependencies can solve the problem.
2. Check whether the dependency is necessary.
3. Consider security and maintenance implications.
4. Use a stable, appropriate version.
5. Update lockfiles correctly.
6. Run tests after installation.

Avoid unnecessary framework/library proliferation.

---

# 37. Code Quality

Code should be:

```text
Readable
Typed
Modular
Testable
Maintainable
Consistent
```

Avoid:

* giant files
* duplicated logic
* unexplained magic values
* unnecessary abstractions
* premature optimization
* unnecessary design patterns
* dead code
* unused dependencies

Use the simplest design that satisfies the approved architecture.

---

# 38. Logging and Observability

Important operational events should be logged appropriately.

Logs must not expose:

```text
Passwords
Tokens
Secrets
Sensitive biometric data
Unnecessary student personal information
```

Logs should help diagnose:

```text
Authentication problems
Authorization failures
Tenant problems
Database failures
Edge synchronization failures
Attendance processing failures
System errors
```

---

# 39. Health Checks

Health checks should distinguish between:

```text
Application availability
Database connectivity
Critical dependency availability
```

Do not expose sensitive internal information through health endpoints.

---

# 40. Frontend Security

The frontend may hide unavailable functionality for usability.

However:

> Frontend hiding is not authorization.

The backend must enforce every security-sensitive operation.

Do not trust:

```text
localStorage role
frontend tenant ID
frontend permissions
URL parameters
hidden fields
```

for authorization.

---

# 41. Code Generation Rules

When generating code:

1. Follow existing project conventions.
2. Use TypeScript types correctly.
3. Avoid `any` unless explicitly justified.
4. Validate external input.
5. Handle errors.
6. Add tests.
7. Keep code within the correct module/domain.
8. Avoid cross-module coupling unless justified.
9. Do not bypass architecture for speed.

---

# 42. Before Modifying Existing Code

Ask internally:

```text
Why does this code exist?
What depends on it?
Will this change break existing functionality?
Does it affect database behavior?
Does it affect tenant isolation?
Does it affect authorization?
Does it affect tests?
Does it affect API compatibility?
```

Then make the smallest safe change.

---

# 43. Migration Safety

Database migrations must be treated carefully.

Before migration:

```text
Inspect existing schema
↓
Determine impact
↓
Create migration
↓
Validate migration
↓
Run tests
```

Do not casually delete existing data or columns.

Destructive migrations require explicit approval unless the current phase explicitly authorizes them.

---

# 44. Backward Compatibility

When modifying existing APIs or data structures, consider existing consumers.

Do not break:

```text
Frontend
Backend modules
Edge agent
Tests
Database
External integrations
```

without explicit approval.

---

# 45. Documentation Updates

If implementation changes:

* architecture
* API behavior
* database structure
* configuration
* security behavior
* important decisions

update the relevant documentation.

Do not allow code and architecture documentation to permanently diverge.

---

# 46. Architecture Decision Records

When an important architectural decision is approved, record it under:

```text
docs/decisions/
```

The record should explain:

```text
Decision
Context
Options considered
Chosen approach
Reason
Consequences
```

Do not create ADRs for trivial implementation details.

---

# 47. Definition of Done

A phase is complete only when:

```text
Required functionality implemented
        AND
Architecture followed
        AND
Security requirements followed
        AND
Tenant isolation validated where applicable
        AND
Relevant tests added
        AND
Tests executed successfully
        AND
No unintended future-phase functionality added
        AND
Documentation updated where necessary
        AND
No known critical issue is hidden
```

---

# 48. Build and Test Verification

After implementation, run the relevant:

```text
Build
Lint
Unit tests
Integration tests
API tests
Database tests
Frontend tests
Edge tests
```

as applicable.

Do not claim tests passed unless they were actually executed.

If a test could not be executed, clearly state why.

---

# 49. Failure Handling During Implementation

If implementation fails:

Do not hide the failure.

Report:

```text
What failed
Why it failed
What was attempted
What remains blocked
Whether architecture is affected
Whether human decision is required
```

Do not silently work around a security or architectural failure.

---

# 50. Ambiguous Requirements

If a requirement is ambiguous:

1. Check the project documents.
2. Check existing architecture.
3. Check relevant phase requirements.
4. Choose the smallest behavior consistent with the documents if the ambiguity is minor.
5. For security, privacy, tenant isolation, database architecture, biometric handling, or major architecture, stop and request clarification/approval.

Never make a risky assumption in a security-sensitive area.

---

# 51. Do Not Over-Engineer

The project is intended to become an enterprise platform, but development must remain phase-driven.

Do not prematurely implement:

```text
Microservices
Kubernetes
Kafka
Complex event buses
Large distributed systems
Advanced AI orchestration
Complex analytics infrastructure
```

unless the approved architecture or current phase requires them.

Start with the approved modular monolith.

---

# 52. MVP Scope Protection

The MVP is classroom attendance.

Current MVP includes:

```text
School Setup
Class/Section
Student
Teacher
Subject
Timetable
Classroom
Camera
Student Enrollment

Face Recognition
Recognition Evidence
Start/Middle/End Checkpoints
Preliminary Attendance
Exception Detection

Teacher Review
Teacher Override
Reason/Note
Final Confirmation

Attendance History
Audit Trail
Reports
Privacy/Data Deletion
```

The MVP does NOT include:

```text
Classroom Interaction Intelligence
Answer Analysis
Behavior Scoring
Facial Emotion/Attention Analysis
Voice Analysis
Learning Analytics
AI Tutor
Generative Chatbot
Complex Parent Features
School ERP
Fees
Transport
Examinations
```

Do not implement these unless the project plan is explicitly changed.

---

# 53. Attendance Principle

The fundamental product principle is:

> Face recognition identifies the student. Presence intelligence determines whether the student was actually present during the scheduled class.

Therefore:

```text
Recognition ≠ Attendance
```

Attendance must be based on the approved checkpoint/evidence model and teacher verification.

---

# 54. Teacher-in-Control Principle

The platform assists teachers.

It does not replace teacher authority.

The final flow is:

```text
AI Detection
↓
AI Evidence
↓
Preliminary Result
↓
Teacher Review
↓
Teacher Decision
↓
Final Attendance
```

---

# 55. Privacy-by-Design Principle

Privacy must be considered during implementation, not added later.

For any feature involving student data ask:

```text
What data is collected?
Why is it needed?
Where is it processed?
Where is it stored?
Who can access it?
How long is it retained?
How is it deleted?
Is raw data necessary?
```

---

# 56. Security-by-Design Principle

Security must be implemented at the architecture boundary.

Do not build:

```text
Feature first
Security later
```

Instead:

```text
Feature
+
Authentication
+
Authorization
+
Tenant Isolation
+
Validation
+
Auditability
```

where applicable.

---

# 57. Phase Implementation Prompt Contract

Every phase implementation request should conceptually contain:

```text
Implement Phase X only.

Before implementation:
- Read all mandatory documents.
- Inspect the repository.
- Understand the existing implementation.

During implementation:
- Follow the architecture.
- Follow security requirements.
- Follow tenant isolation requirements.
- Do not implement future phases.
- Do not make unauthorized architecture changes.

After implementation:
- Run tests.
- Validate the Definition of Done.
- Validate security.
- Validate tenant isolation where applicable.
- Report results.
```

---

# 58. Mandatory Completion Report

After completing a phase, Copilot MUST provide the following report.

```text
# PHASE COMPLETION REPORT

## PHASE
<phase number and name>

## DOCUMENTS FOLLOWED
- docs/00_COPILOT_EXECUTION_PROTOCOL.md
- docs/01_MASTER_DEVELOPMENT_INSTRUCTION.md
- docs/02_ARCHITECTURE_BASELINE.md
- docs/03_PHASE_IMPLEMENTATION_PLAN.md
- <relevant phase documents>

## IMPLEMENTED
- <item>
- <item>

## FILES CREATED
- <file>

## FILES MODIFIED
- <file>

## FILES DELETED
- <file or None>

## DATABASE CHANGES
- <changes or None>

## API CHANGES
- <changes or None>

## CONFIGURATION CHANGES
- <changes or None>

## TESTS ADDED
- <tests>

## TESTS EXECUTED
- <commands>

## TEST RESULTS
- <results>

## SECURITY VALIDATION
- <results>

## TENANT ISOLATION VALIDATION
- <results or Not applicable>

## DOCUMENTATION UPDATED
- <files>

## ARCHITECTURE CHANGES
- None
OR
- <approved change>

## FUTURE PHASES IMPLEMENTED
- NO

## DEFINITION OF DONE
- PASS
OR
- FAIL: <reason>

## UNRESOLVED ISSUES
- <issue>
OR
- None

## HUMAN APPROVAL REQUIRED
- No
OR
- Yes: <decision required>
```

---

# 59. No False Completion

Never report:

```text
PASS
```

if:

* tests are failing
* security is bypassed
* tenant isolation is unverified where required
* required functionality is missing
* architecture was changed without approval
* implementation is only mocked
* critical issues remain hidden

Use:

```text
FAIL
```

or:

```text
PARTIAL
```

when appropriate.

---

# 60. Git Discipline

Before making changes:

```text
Inspect git status
```

Do not overwrite unrelated user changes.

Do not reset or delete unrelated work.

Do not use destructive Git commands unless explicitly authorized.

Changes should remain attributable to the current implementation task.

---

# 61. Secrets and Sensitive Data

Never commit:

```text
Passwords
API keys
Private keys
Database credentials
JWT secrets
Encryption keys
Production tokens
Real student biometric data
Real student personal data
```

Use safe example values in configuration templates.

---

# 62. Production Data Rule

Never use real production/student data for local development or testing unless explicitly authorized and appropriately protected.

Prefer:

```text
Synthetic data
Test fixtures
Mock data
Anonymized data
```

---

# 63. Performance Rule

Do not optimize prematurely.

However, avoid obviously unsafe designs such as:

* unbounded queries
* loading entire tables unnecessarily
* missing required indexes
* repeated database queries in loops
* unnecessary video transmission
* unbounded event queues

Performance concerns should be addressed according to the relevant phase.

---

# 64. Reliability Rule

Every external dependency can fail.

Consider failure for:

```text
Database
Network
Camera
Edge Agent
Authentication
External AI provider
File storage
Synchronization
```

Do not assume a dependency is always available.

---

# 65. Edge Device Reliability

Edge systems must account for:

```text
Network loss
Power loss
Camera disconnect
Process restart
Duplicate events
Clock differences
Temporary backend unavailability
```

Use durable local state where required by the architecture.

---

# 66. AI Reliability

AI outputs must be treated as probabilistic.

Do not blindly trust:

```text
Recognition confidence
Classification
Detection
AI-generated result
```

Where AI confidence is low or evidence is insufficient, use the approved review/exception flow.

---

# 67. Human Oversight

For consequential attendance decisions:

```text
AI
↓
Evidence
↓
Human Review
↓
Final Decision
```

The system must preserve the ability for authorized teachers to correct AI results.

---

# 68. Do Not Bypass the Architecture for Demonstration

A prototype shortcut is not acceptable if it creates a security or architectural defect that would need to be removed later.

For example, do not:

```text
hardcode tenant
bypass authorization
store passwords in code
store biometric data globally
accept schema from frontend
skip database constraints
```

just to make a demo work.

---

# 69. Minimum Safe Implementation Principle

When multiple valid implementations exist:

Choose the implementation that is:

```text
Simple
Secure
Maintainable
Testable
Consistent with architecture
Easy to extend
```

Avoid unnecessary complexity.

---

# 70. Final Execution Protocol

Before every implementation:

```text
READ
↓
UNDERSTAND
↓
INSPECT
↓
PLAN
↓
IMPLEMENT
↓
TEST
↓
SECURITY VALIDATION
↓
TENANT VALIDATION
↓
DOCUMENTATION VALIDATION
↓
DEFINITION OF DONE
↓
REPORT
```

Never skip the validation stages merely because the code compiles.

---

# 71. Final Rule

The following rule is mandatory:

> **Read the documents → understand the architecture → inspect the existing code → identify the current phase → implement only the current phase → test the implementation → validate security and tenant isolation → validate document compliance → validate the Definition of Done → report the result honestly.**

GitHub Copilot must behave as an engineering implementation assistant operating under these project constraints, not as an independent architect with authority to redefine the system.
