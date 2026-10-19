import { z } from 'zod';

/**
 * DTO for creating an attendance record
 */
export const createAttendanceRecordSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  markedBy: z.string().optional(),
  isManual: z.boolean().optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateAttendanceRecordDto = z.infer<typeof createAttendanceRecordSchema>;

/**
 * DTO for updating an attendance record
 */
export const updateAttendanceRecordSchema = z.object({
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']).optional(),
  checkInTime: z.coerce.date().optional(),
  checkOutTime: z.coerce.date().optional(),
  overriddenBy: z.string().optional(),
  overrideReason: z.string().max(500).optional(),
  isManual: z.boolean().optional()
});

export type UpdateAttendanceRecordDto = z.infer<typeof updateAttendanceRecordSchema>;