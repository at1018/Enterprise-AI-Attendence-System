# Architecture Decision Record: Prisma Schema-Per-School Feasibility

**Status**: Phase 1 Foundation Implementation  
**Date**: 2026-09-20  
**Context**: Multi-Tenant Database Foundation (Phase 1)

## Context

The AI School Classroom Attendance Platform requires a PostgreSQL schema-per-school multi-tenant architecture. The approved architecture specifies:

```text
PostgreSQL
│
├── platform (global tenant registry)
├── school_a (tenant-specific schema)
├── school_b (tenant-specific schema)
└── school_c (tenant-specific schema)
```

The architecture baseline states that before Phase 1 production implementation, a technical feasibility validation must prove that Prisma can safely support the required schema-per-school architecture under real concurrent pooled database usage.

## Decision

### Phase 1 Foundation Approach

For Phase 1, we have implemented a **foundation architecture** that establishes the tenant management infrastructure while deferring the exact runtime schema routing mechanism:

1. **Platform Schema**: Implemented with Tenant and TenantConfiguration models
2. **Tenant Context Abstraction**: Created `TenantDatabaseContext` and `TenantContext` interfaces
3. **Tenant Registry**: Implemented tenant provisioning and resolution services
4. **Security Boundaries**: Established tenant validation and cross-tenant prevention middleware
5. **Placeholder Schema Routing**: The exact Prisma runtime schema routing is documented as TODO

### What is Implemented in Phase 1

✅ **Tenant Registry Foundation**
- Platform schema with Tenant and TenantConfiguration models
- Tenant creation with schema name validation
- Tenant resolution by ID and slug
- Tenant status validation (ACTIVE, SUSPENDED, PENDING, DELETED)

✅ **Tenant Context Management**
- `TenantContext` interface for trusted tenant information
- `TenantDatabaseContext` for controlled database access
- Schema name validation (lowercase alphanumeric with underscores)
- Tenant-to-schema mapping foundation

✅ **Security Infrastructure**
- Tenant resolution middleware (placeholder for Phase 2 authentication integration)
- Cross-tenant access prevention middleware
- Tenant status validation
- Schema name safety validation

✅ **Testing Foundation**
- Tenant service unit tests
- Tenant isolation API tests
- Schema name validation tests
- Duplicate prevention tests

### What is Deferred to Post-Phase 1 Feasibility Validation

🔄 **Runtime Schema Routing Mechanism**
- Exact Prisma client lifecycle for tenant-aware operations
- PostgreSQL session management for schema switching
- Connection pooling behavior with multiple schemas
- Transaction-local tenant context
- Schema initialization and migration strategy

🔄 **Multi-Schema Migration Strategy**
- Platform vs tenant schema migration separation
- New tenant provisioning workflow
- Existing tenant migration updates
- Rollback and recovery strategies

## Rationale

### Why This Approach

1. **Risk Mitigation**: The schema-per-school architecture is security-critical. Implementing an unvalidated runtime mechanism could introduce cross-tenant data leakage.

2. **Architecture Compliance**: The project documentation explicitly requires feasibility validation before production implementation of Phase 1.

3. **Incremental Validation**: The foundation allows us to validate tenant registry, context management, and security boundaries independently of the runtime schema routing.

4. **Flexibility**: This approach keeps us uncommitted to a specific runtime mechanism until we can validate it properly.

### Current Limitations

1. **Single Schema Operations**: Current implementation operates only on the platform schema
2. **No Schema Switching**: The `getTenantPrisma()` method returns the base Prisma client
3. **No Schema Creation**: PostgreSQL schema creation is not yet implemented
4. **Testing Scope**: Current tests validate tenant registry but not actual multi-schema operations

## Alternatives Considered

### Alternative 1: Immediate Prisma Schema Proxy
**Pros**: Faster initial implementation  
**Cons**: Unvalidated security risk, may not work correctly with connection pooling

### Alternative 2: Multiple Prisma Clients
**Pros**: Clear separation of tenant databases  
**Cons**: Connection overhead, not scalable for many tenants

### Alternative 3: SQL Schema Switching
**Pros**: Direct control over PostgreSQL schema  
**Cons**: Complex implementation, connection pool state management challenges

### Alternative 4: Selected Approach (Foundation + Validation)
**Pros**: Safe, validates architecture requirements, allows proper security testing  
**Cons**: Requires additional validation phase before full implementation

## Consequences

### Positive Consequences

1. **Security**: Tenant registry and validation are implemented and tested
2. **Architecture Compliance**: Follows the documented requirement for feasibility validation
3. **Testability**: Foundation can be tested independently of runtime schema routing
4. **Maintainability**: Clear separation between tenant management and database access

### Negative Consequences

1. **Additional Phase**: Requires a dedicated feasibility validation phase
2. **Limited Functionality**: Cannot yet perform actual tenant-specific database operations
3. **Deferred Complexity**: Schema routing complexity is postponed, not eliminated

### Required Next Steps

1. **Feasibility Validation Phase**: 
   - Test Prisma with PostgreSQL schema switching
   - Validate connection pooling behavior
   - Test concurrent tenant requests
   - Validate transaction rollback behavior

2. **Architecture Decision Record**: 
   - Document the chosen runtime mechanism after validation
   - Update architecture baseline with final decision

3. **Phase 1 Completion**: 
   - Implement the validated runtime mechanism
   - Add schema creation and initialization
   - Implement multi-schema migration strategy
   - Complete tenant isolation tests with actual schema operations

## Implementation Status

### Completed ✅
- Platform schema models (Tenant, TenantConfiguration)
- Tenant service with CRUD operations
- Tenant controller and routes
- Tenant context abstraction
- Security middleware foundation
- Unit tests for tenant service
- Integration tests for tenant isolation
- Schema name validation
- Duplicate prevention

### Pending ⏳
- Runtime Prisma schema routing mechanism
- PostgreSQL schema creation
- Multi-schema migration strategy
- Connection pooling validation
- Transaction isolation validation
- Actual cross-tenant data access tests
- Performance testing with multiple tenants

## Validation Requirements

Before marking Phase 1 as complete, the following must be validated:

1. **Schema Switching**: Can Prisma safely switch between PostgreSQL schemas?
2. **Connection Pooling**: Does connection pooling maintain proper tenant isolation?
3. **Concurrent Requests**: Can multiple tenant requests run concurrently without cross-tenant leakage?
4. **Transaction Behavior**: Do transactions properly isolate tenant operations?
5. **Rollback Safety**: Does transaction rollback properly clean up tenant state?
6. **Performance**: Is the performance acceptable with schema switching overhead?

## References

- Architecture Baseline: `02_ARCHITECTURE_BASELINE.md`
- Phase Implementation Plan: `03_PHASE_IMPLEMENTATION_PLAN.md`
- Master Development Instruction: `01_MASTER_DEVELOPMENT_INSTRUCTION.md`