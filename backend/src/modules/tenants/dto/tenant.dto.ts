import { z } from 'zod';

/**
 * DTO for creating a new tenant
 */
export const createTenantSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  schemaName: z.string().min(1).max(63).regex(/^[a-z][a-z0-9_]*$/, 'Schema name must start with letter and contain only lowercase letters, numbers, and underscores')
});

export type CreateTenantDto = z.infer<typeof createTenantSchema>;

/**
 * DTO for tenant response
 */
export const tenantResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  schemaName: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type TenantResponse = z.infer<typeof tenantResponseSchema>;

/**
 * DTO for tenant configuration
 */
export const tenantConfigurationSchema = z.object({
  maxUsers: z.number().int().positive().default(100),
  maxStudents: z.number().int().positive().default(1000),
  maxTeachers: z.number().int().positive().default(100),
  features: z.array(z.string()).default([])
});

export type TenantConfigurationDto = z.infer<typeof tenantConfigurationSchema>;