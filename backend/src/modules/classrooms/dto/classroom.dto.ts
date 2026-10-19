import { z } from 'zod';

/**
 * DTO for creating a classroom
 */
export const createClassroomSchema = z.object({
  name: z.string().min(1, 'Classroom name is required').max(100),
  building: z.string().max(50).optional(),
  floor: z.string().max(20).optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateClassroomDto = z.infer<typeof createClassroomSchema>;

/**
 * DTO for updating a classroom
 */
export const updateClassroomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  building: z.string().max(50).optional(),
  floor: z.string().max(20).optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  isActive: z.boolean().optional()
});

export type UpdateClassroomDto = z.infer<typeof updateClassroomSchema>;