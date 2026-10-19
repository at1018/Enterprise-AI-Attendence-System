import { z } from 'zod';

/**
 * DTO for creating a camera
 */
export const createCameraSchema = z.object({
  name: z.string().min(1, 'Camera name is required').max(100),
  cameraId: z.string().min(1, 'Camera ID is required').max(50),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address').optional(),
  port: z.number().int().positive().max(65535).optional(),
  username: z.string().max(50).optional(),
  password: z.string().max(100).optional(),
  rtspUrl: z.string().url().optional(),
  resolution: z.string().max(20).optional(),
  fps: z.number().int().positive().max(60).optional(),
  classroomId: z.string().optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateCameraDto = z.infer<typeof createCameraSchema>;

/**
 * DTO for updating a camera
 */
export const updateCameraSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  ipAddress: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IP address').optional(),
  port: z.number().int().positive().max(65535).optional(),
  username: z.string().max(50).optional(),
  password: z.string().max(100).optional(),
  rtspUrl: z.string().url().optional(),
  resolution: z.string().max(20).optional(),
  fps: z.number().int().positive().max(60).optional(),
  classroomId: z.string().optional(),
  isActive: z.boolean().optional()
});

export type UpdateCameraDto = z.infer<typeof updateCameraSchema>;