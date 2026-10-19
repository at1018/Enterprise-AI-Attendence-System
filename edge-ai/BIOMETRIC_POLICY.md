# Biometric Data Policy
# Phase 7: Face Enrollment & Recognition

## 1. Biometric Data Ownership and Control

**Policy:**
- Biometric data is owned by the educational institution (tenant)
- Students/parents maintain rights to their biometric data
- Biometric data cannot be shared across tenants/schools
- Platform provides tools for data management but does not claim ownership

**Implementation:**
- All biometric data is tenant-isolated in database
- Tenant-level configuration controls biometric features
- Clear consent workflow for biometric enrollment
- Data export capabilities for student/parent requests

## 2. Retention Policy

**Policy:**
- Biometric data retained only while student is enrolled
- Automatic deletion upon student graduation/withdrawal
- Configurable retention period per tenant (default: 30 days post-departure)
- Manual deletion available at any time with proper authorization

**Implementation:**
- `retentionUntil` field in biometric records
- Automated cleanup job for expired records
- Tenant-configurable retention settings
- Audit trail for all deletions

## 3. Deletion Workflow

**Policy:**
- Multi-step deletion process with authorization
- School admin or authorized staff can initiate deletion
- Parent/guardian consent required for minor students
- Immediate deletion from active systems
- Secure deletion from storage (cannot be recovered)

**Implementation:**
- Deletion request → Authorization → Verification → Execution
- Role-based deletion permissions (SCHOOL_ADMIN, PRINCIPAL)
- Parent consent tracking for minors
- Cryptographic deletion (overwrite sensitive data)

## 4. Deletion Authorization

**Policy:**
- School admin can delete biometric data for their tenant
- Principal can delete biometric data for their tenant
- Class teachers cannot delete biometric data
- Parents can request deletion through proper channels
- System administrators can delete only with audit trail

**Implementation:**
- Role-based access control on deletion endpoints
- Authorization middleware on deletion operations
- Deletion request tracking and approval workflow
- Emergency deletion procedures with escalated authorization

## 5. Deletion Verification

**Policy:**
- Verification step before final deletion
- Confirmation of student identity and authorization
- Warning of irreversible action
- Optional grace period for accidental deletions

**Implementation:**
- Two-step deletion process (request → confirm)
- Student identity verification before deletion
- Irreversible deletion warning in UI
- Configurable grace period (default: 7 days)

## 6. Deletion Auditability

**Policy:**
- All deletions must be logged with full audit trail
- Audit logs include: who, when, what, why, authorization
- Audit logs are immutable and tenant-isolated
- Audit logs retained longer than biometric data

**Implementation:**
- BiometricDeletionAudit model in database
- Automatic audit logging on all deletions
- Audit log retention: 1 year minimum
- Audit log export and reporting capabilities

## 7. School/Tenant Isolation

**Policy:**
- Biometric data is strictly tenant-isolated
- No cross-tenant biometric data access
- No cross-tenant biometric comparisons
- Tenant-specific encryption keys

**Implementation:**
- All biometric models include `tenantId` field
- Database queries always filter by tenant
- Tenant-level encryption for biometric templates
- Cross-tenant access prevention in all services

## 8. Protection Against Cross-School Biometric Access

**Policy:**
- Biometric templates cannot be used across schools
- Face recognition models are tenant-specific
- No global face recognition database
- Each tenant maintains separate biometric database

**Implementation:**
- Tenant-specific face recognition models
- Separate biometric databases per tenant
- No cross-tenant API endpoints for biometric data
- Regular audits for cross-tenant access attempts

## 9. Local/Edge Processing Boundaries

**Policy:**
- Face detection occurs on edge devices
- Face recognition occurs on edge devices
- Only recognition results (not biometric data) sent to backend
- Biometric templates stored locally on edge devices

**Implementation:**
- Edge Agent handles all face processing
- Backend only receives recognition results (student IDs, confidence)
- Biometric templates stored in encrypted local storage on edge
- No raw biometric data transmitted to backend

## 10. Minimum Necessary Biometric Data Storage

**Policy:**
- Store only face embeddings (mathematical representations)
- Do not store raw face images unless required
- Encrypt all stored biometric data
- Use latest face recognition standards (128D embeddings)

**Implementation:**
- Store only face embeddings (128-dimensional vectors)
- Optional thumbnail for verification (encrypted)
- AES-256 encryption for all biometric data
- Compliance with GDPR, FERPA, and biometric privacy laws

## 11. Data Classification

**Policy:**
- Biometric data classified as HIGHLY SENSITIVE
- Encryption at rest and in transit
- Access logging for all biometric operations
- Regular security audits

**Implementation:**
- Data classification metadata in database
- TLS 1.3 for all biometric data transmission
- Comprehensive access logging
- Quarterly security reviews

## 12. Consent Management

**Policy:**
- Explicit consent required for biometric enrollment
- Consent must be informed and voluntary
- Consent can be withdrawn at any time
- Withdrawal triggers immediate deletion

**Implementation:**
- BiometricConsent model tracking consent status
- Consent workflow in enrollment process
- Withdrawal triggers automatic deletion
- Consent history tracking

## 13. Compliance Requirements

**Policy:**
- GDPR compliance for EU tenants
- FERPA compliance for US educational institutions
- Local biometric privacy law compliance
- Regular compliance audits

**Implementation:**
- Tenant-specific compliance settings
- Data processing agreements
- Compliance reporting
- Automated compliance checks
