import { z } from 'zod';

// Create Checkpoint DTO
export const createCheckpointSchema = z.object({
  sessionId: z.string().cuid(),
  checkpointType: z.enum(['START', 'MIDDLE', 'END']),
  scheduledTime: z.coerce.date(),
  deviceId: z.string().optional()
});

export type CreateCheckpointDto = z.infer<typeof createCheckpointSchema>;

// Complete Checkpoint DTO
export const completeCheckpointSchema = z.object({
  checkpointId: z.string().cuid(),
  deviceId: z.string(),
  recognitionResults: z.array(
    z.object({
      studentId: z.string().cuid(),
      recognized: z.boolean(),
      confidence: z.number().min(0).max(1).optional(),
      faceQuality: z.number().min(0).max(1).optional(),
      recognitionResultId: z.string().cuid().optional()
    })
  )
});

export type CompleteCheckpointDto = z.infer<typeof completeCheckpointSchema>;

// Preliminary Attendance DTO
export const preliminaryAttendanceSchema = z.object({
  sessionId: z.string().cuid(),
  studentId: z.string().cuid(),
  status: z.enum(['AI_VERIFIED_PRESENT', 'ATTENDANCE_EXCEPTION', 'NEEDS_REVIEW', 'INSUFFICIENT_EVIDENCE']),
  startRecognized: z.boolean().default(false),
  middleRecognized: z.boolean().default(false),
  endRecognized: z.boolean().default(false),
  overallConfidence: z.number().min(0).max(1).optional(),
  exceptionReason: z.string().optional(),
  needsReview: z.boolean().default(false)
});

export type PreliminaryAttendanceDto = z.infer<typeof preliminaryAttendanceSchema>;

// Mark as Reviewed DTO
export const markAsReviewedSchema = z.object({
  preliminaryAttendanceId: z.string().cuid(),
  finalStatus: z.string()
});

export type MarkAsReviewedDto = z.infer<typeof markAsReviewedSchema>;

// Query params
export const checkpointQuerySchema = z.object({
  sessionId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'COMPLETED', 'SKIPPED', 'FAILED']).optional(),
  checkpointType: z.enum(['START', 'MIDDLE', 'END']).optional()
});

export type CheckpointQueryDto = z.infer<typeof checkpointQuerySchema>;

export const preliminaryAttendanceQuerySchema = z.object({
  sessionId: z.string().cuid().optional(),
  studentId: z.string().cuid().optional(),
  status: z.enum(['AI_VERIFIED_PRESENT', 'ATTENDANCE_EXCEPTION', 'NEEDS_REVIEW', 'INSUFFICIENT_EVIDENCE']).optional(),
  needsReview: z.coerce.boolean().optional()
});

export type PreliminaryAttendanceQueryDto = z.infer<typeof preliminaryAttendanceQuerySchema>;
