import { PrismaClient } from '@prisma/client';
import { TenantContext, TenantDatabaseContext } from '../../common/utils/tenant.util';
import { AppError } from '../../common/middleware/error.middleware';

export class TenantService {
  private prisma: PrismaClient;
  private tenantDbContext: TenantDatabaseContext;

  constructor(prisma: PrismaClient, tenantDbContext: TenantDatabaseContext) {
    this.prisma = prisma;
    this.tenantDbContext = tenantDbContext;
  }

  /**
   * Get tenant by ID
   * This is a trusted operation that validates tenant existence and status
   */
  async getTenantById(tenantId: string): Promise<TenantContext | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { configuration: true }
    });

    if (!tenant) {
      return null;
    }

    if (tenant.status !== 'ACTIVE') {
      throw new AppError(403, 'Tenant is not active');
    }

    return {
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
      tenantName: tenant.name,
      status: tenant.status
    };
  }

  /**
   * Get tenant by slug
   * Used for tenant resolution from authenticated context
   */
  async getTenantBySlug(slug: string): Promise<TenantContext | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug },
      include: { configuration: true }
    });

    if (!tenant) {
      return null;
    }

    if (tenant.status !== 'ACTIVE') {
      throw new AppError(403, 'Tenant is not active');
    }

    return {
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
      tenantName: tenant.name,
      status: tenant.status
    };
  }

  /**
   * List all tenants
   * This should be admin-only in production
   */
  async listTenants(): Promise<any[]> {
    const tenants = await this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return tenants.map(tenant => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      schemaName: tenant.schemaName,
      status: tenant.status,
      createdAt: tenant.createdAt
    }));
  }

  /**
   * Validate tenant schema name
   * Ensures the schema name is safe and follows naming conventions
   */
  validateSchemaName(schemaName: string): boolean {
    // Schema names must be lowercase alphanumeric with underscores
    const schemaNameRegex = /^[a-z][a-z0-9_]*$/;
    return schemaNameRegex.test(schemaName);
  }

  /**
   * Create a new tenant (placeholder for Phase 1 provisioning)
   * This will be expanded in later phases with full provisioning logic
   */
  async createTenant(data: {
    name: string;
    slug: string;
    schemaName: string;
  }): Promise<TenantContext> {
    // Validate schema name
    if (!this.validateSchemaName(data.schemaName)) {
      throw new AppError(400, 'Invalid schema name format');
    }

    // Check if slug already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: data.slug }
    });

    if (existingTenant) {
      throw new AppError(409, 'Tenant with this slug already exists');
    }

    // Check if schema name already exists
    const existingSchema = await this.prisma.tenant.findUnique({
      where: { schemaName: data.schemaName }
    });

    if (existingSchema) {
      throw new AppError(409, 'Schema name already in use');
    }

    // Create tenant record
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        schemaName: data.schemaName,
        status: 'ACTIVE',
        configuration: {
          create: {
            maxUsers: 100,
            maxStudents: 1000,
            maxTeachers: 100,
            features: []
          }
        }
      },
      include: { configuration: true }
    });

    // TODO: Implement actual schema creation after feasibility validation
    // This will involve:
    // 1. Creating the PostgreSQL schema
    // 2. Initializing required tables
    // 3. Recording schema version metadata

    return {
      tenantId: tenant.id,
      schemaName: tenant.schemaName,
      tenantName: tenant.name,
      status: tenant.status
    };
  }

  /**
   * Resolve tenant context from authenticated user
   * This is a trusted operation that establishes tenant context
   */
  async resolveTenantContext(tenantId: string): Promise<TenantContext> {
    const tenantContext = await this.getTenantById(tenantId);
    
    if (!tenantContext) {
      throw new AppError(404, 'Tenant not found');
    }

    return tenantContext;
  }
}