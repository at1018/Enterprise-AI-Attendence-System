import { z } from 'zod';

/**
 * DTO for face enrollment
 */
export const faceEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  faceEmbedding: z.array(z.number()).min(128).max(128),
  faceThumbnail: z.string().optional(),
  qualityScore: z.number().min(0).max(1),
  deviceId: z.string().optional(),
  tenantSecret: z.string().min(1, 'Tenant secret is required for encryption')
});

export type FaceEnrollmentDto = z.infer<typeof faceEnrollmentSchema>;

/**
 * DTO for face enrollment deletion
 */
export const deleteFaceEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  deletedBy: z.string().min(1, 'Deleted by user ID is required'),
  deletionReason: z.string().min(1, 'Deletion reason is required'),
  authorizationLevel: z.string().min(1, 'Authorization level is required')
});

export type DeleteFaceEnrollmentDto = z.infer<typeof deleteFaceEnrollmentSchema>;
