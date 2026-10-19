import { PrismaClient } from '@prisma/client';

/**
 * Tenant context interface
 * This represents the trusted tenant context established by the backend
 */
export interface TenantContext {
  tenantId: string;
  schemaName: string;
  tenantName: string;
  status: string;
}

/**
 * Database context for tenant-specific operations
 * This provides a controlled abstraction for tenant database access
 */
export class TenantDatabaseContext {
  private prisma: PrismaClient;
  private tenantContext: TenantContext | null = null;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Set the tenant context for the current operation
   * This should only be called by trusted backend code after authentication
   */
  setTenantContext(context: TenantContext): void {
    this.tenantContext = context;
  }

  /**
   * Get the current tenant context
   */
  getTenantContext(): TenantContext | null {
    return this.tenantContext;
  }

  /**
   * Clear the tenant context (important for connection pooling)
   */
  clearTenantContext(): void {
    this.tenantContext = null;
  }

  /**
   * Get tenant-aware Prisma client
   * This is a placeholder for the actual schema-per-school implementation
   * The exact implementation will be determined after feasibility validation
   */
  getTenantPrisma(): PrismaClient {
    // TODO: Implement tenant-aware Prisma client after feasibility validation
    // This will handle schema routing based on tenant context
    return this.prisma;
  }

  /**
   * Execute a tenant-specific database operation
   * This provides a controlled boundary for tenant data access
   */
  async executeTenantOperation<T>(
    operation: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    if (!this.tenantContext) {
      throw new Error('Tenant context not set. Cannot execute tenant-specific operation.');
    }

    // TODO: Implement schema switching here after feasibility validation
    // For now, this is a placeholder that validates tenant context exists
    
    return operation(this.prisma);
  }
}

/**
 * Create a tenant database context instance
 */
export const createTenantDatabaseContext = (prisma: PrismaClient): TenantDatabaseContext => {
  return new TenantDatabaseContext(prisma);
};