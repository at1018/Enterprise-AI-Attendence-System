import { PrismaClient } from '@prisma/client';
import { TenantService } from '../src/modules/tenants/tenant.service';
import { createTenantDatabaseContext } from '../src/common/utils/tenant.util';

describe('TenantService', () => {
  let prisma: PrismaClient;
  let tenantService: TenantService;
  let tenantDbContext: any;

  beforeAll(async () => {
    prisma = new PrismaClient();
    tenantDbContext = createTenantDatabaseContext(prisma);
    tenantService = new TenantService(prisma, tenantDbContext);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('validateSchemaName', () => {
    it('should accept valid schema names', () => {
      expect(tenantService.validateSchemaName('school_001')).toBe(true);
      expect(tenantService.validateSchemaName('school_a')).toBe(true);
      expect(tenantService.validateSchemaName('tenant_123')).toBe(true);
    });

    it('should reject invalid schema names', () => {
      expect(tenantService.validateSchemaName('School_001')).toBe(false); // uppercase
      expect(tenantService.validateSchemaName('school-001')).toBe(false); // hyphen
      expect(tenantService.validateSchemaName('school.001')).toBe(false); // dot
      expect(tenantService.validateSchemaName('1school')).toBe(false); // starts with number
      expect(tenantService.validateSchemaName('_school')).toBe(false); // starts with underscore
    });
  });

  describe('createTenant', () => {
    it('should create a new tenant with valid data', async () => {
      const tenantData = {
        name: 'Test School',
        slug: 'test-school',
        schemaName: 'school_test'
      };

      const tenant = await tenantService.createTenant(tenantData);

      expect(tenant).toBeDefined();
      expect(tenant.tenantId).toBeDefined();
      expect(tenant.tenantName).toBe('Test School');
      expect(tenant.schemaName).toBe('school_test');
      expect(tenant.status).toBe('ACTIVE');

      // Cleanup
      await prisma.tenant.delete({
        where: { id: tenant.tenantId }
      });
    });

    it('should reject duplicate slugs', async () => {
      const tenantData = {
        name: 'Test School',
        slug: 'duplicate-slug',
        schemaName: 'school_duplicate1'
      };

      await tenantService.createTenant(tenantData);

      const duplicateData = {
        name: 'Another School',
        slug: 'duplicate-slug',
        schemaName: 'school_duplicate2'
      };

      await expect(tenantService.createTenant(duplicateData)).rejects.toThrow('Tenant with this slug already exists');

      // Cleanup
      await prisma.tenant.deleteMany({
        where: { slug: 'duplicate-slug' }
      });
    });

    it('should reject duplicate schema names', async () => {
      const tenantData = {
        name: 'Test School',
        slug: 'test-slug1',
        schemaName: 'duplicate_schema'
      };

      await tenantService.createTenant(tenantData);

      const duplicateData = {
        name: 'Another School',
        slug: 'test-slug2',
        schemaName: 'duplicate_schema'
      };

      await expect(tenantService.createTenant(duplicateData)).rejects.toThrow('Schema name already in use');

      // Cleanup
      await prisma.tenant.deleteMany({
        where: { schemaName: 'duplicate_schema' }
      });
    });

    it('should reject invalid schema names', async () => {
      const invalidData = {
        name: 'Test School',
        slug: 'test-school',
        schemaName: 'Invalid-Schema' // Contains hyphen
      };

      await expect(tenantService.createTenant(invalidData)).rejects.toThrow('Invalid schema name format');
    });
  });

  describe('getTenantById', () => {
    let createdTenantId: string;

    beforeAll(async () => {
      const tenant = await tenantService.createTenant({
        name: 'Get By ID Test',
        slug: 'get-by-id-test',
        schemaName: 'school_get_by_id'
      });
      createdTenantId = tenant.tenantId;
    });

    afterAll(async () => {
      await prisma.tenant.delete({
        where: { id: createdTenantId }
      });
    });

    it('should return tenant context for valid ID', async () => {
      const tenantContext = await tenantService.getTenantById(createdTenantId);

      expect(tenantContext).toBeDefined();
      expect(tenantContext?.tenantId).toBe(createdTenantId);
      expect(tenantContext?.tenantName).toBe('Get By ID Test');
      expect(tenantContext?.schemaName).toBe('school_get_by_id');
    });

    it('should return null for non-existent tenant', async () => {
      const tenantContext = await tenantService.getTenantById('non-existent-id');
      expect(tenantContext).toBeNull();
    });
  });

  describe('getTenantBySlug', () => {
    let testSlug: string;

    beforeAll(async () => {
      const tenant = await tenantService.createTenant({
        name: 'Get By Slug Test',
        slug: 'get-by-slug-test',
        schemaName: 'school_get_by_slug'
      });
      testSlug = 'get-by-slug-test';
    });

    afterAll(async () => {
      await prisma.tenant.delete({
        where: { slug: testSlug }
      });
    });

    it('should return tenant context for valid slug', async () => {
      const tenantContext = await tenantService.getTenantBySlug(testSlug);

      expect(tenantContext).toBeDefined();
      expect(tenantContext?.tenantName).toBe('Get By Slug Test');
      expect(tenantContext?.schemaName).toBe('school_get_by_slug');
    });

    it('should return null for non-existent slug', async () => {
      const tenantContext = await tenantService.getTenantBySlug('non-existent-slug');
      expect(tenantContext).toBeNull();
    });
  });
});