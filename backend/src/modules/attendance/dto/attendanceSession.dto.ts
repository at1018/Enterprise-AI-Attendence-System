import { z } from 'zod';

/**
 * DTO for creating an attendance session
 */
export const createAttendanceSessionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  date: z.coerce.date(),
  dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  period: z.number().int().positive('Period must be greater than 0'),
  classId: z.string().min(1, 'Class ID is required'),
  sectionId: z.string().optional(),
  subjectId: z.string().min(1, 'Subject ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  classroomId: z.string().min(1, 'Classroom ID is required'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  timetableEntryId: z.string().optional(),
  cameraId: z.string().optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateAttendanceSessionDto = z.infer<typeof createAttendanceSessionSchema>;

/**
 * DTO for updating an attendance session
 */
export const updateAttendanceSessionSchema = z.object({
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  isCompleted: z.boolean().optional(),
  completedBy: z.string().optional(),
  completedAt: z.coerce.date().optional()
});

export type UpdateAttendanceSessionDto = z.infer<typeof updateAttendanceSessionSchema>;