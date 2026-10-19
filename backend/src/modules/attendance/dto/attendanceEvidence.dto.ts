import { z } from 'zod';

/**
 * DTO for creating attendance evidence
 */
export const createAttendanceEvidenceSchema = z.object({
  recordId: z.string().min(1, 'Record ID is required'),
  checkpoint: z.number().int().min(1).max(3, 'Checkpoint must be 1, 2, or 3'),
  imageUrl: z.string().url().optional(),
  faceData: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  cameraId: z.string().optional(),
  isMatched: z.boolean().optional(),
  matchedStudentId: z.string().optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateAttendanceEvidenceDto = z.infer<typeof createAttendanceEvidenceSchema>;