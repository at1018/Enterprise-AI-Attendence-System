import { z } from 'zod';

/**
 * DTO for creating a class
 */
export const createClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(100),
  grade: z.number().int().min(1).max(12, 'Grade must be between 1 and 12'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateClassDto = z.infer<typeof createClassSchema>;

/**
 * DTO for updating a class
 */
export const updateClassSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  grade: z.number().int().min(1).max(12).optional()
});

export type UpdateClassDto = z.infer<typeof updateClassSchema>;

/**
 * DTO for creating a section
 */
export const createSectionSchema = z.object({
  name: z.string().min(1, 'Section name is required').max(50),
  classId: z.string().min(1, 'Class ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateSectionDto = z.infer<typeof createSectionSchema>;

/**
 * DTO for updating a section
 */
export const updateSectionSchema = z.object({
  name: z.string().min(1).max(50).optional()
});

export type UpdateSectionDto = z.infer<typeof updateSectionSchema>;