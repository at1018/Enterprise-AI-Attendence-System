import { z } from 'zod';

/**
 * DTO for creating a subject
 */
export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(100),
  code: z.string().min(1, 'Subject code is required').max(20),
  description: z.string().max(500).optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateSubjectDto = z.infer<typeof createSubjectSchema>;

/**
 * DTO for updating a subject
 */
export const updateSubjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  code: z.string().min(1).max(20).optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional()
});

export type UpdateSubjectDto = z.infer<typeof updateSubjectSchema>;