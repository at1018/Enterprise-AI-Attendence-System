import { z } from 'zod';

/**
 * DTO for creating/updating student attendance summary
 */
export const createStudentAttendanceSummarySchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  totalSessions: z.number().int().nonnegative(),
  presentCount: z.number().int().nonnegative(),
  absentCount: z.number().int().nonnegative(),
  lateCount: z.number().int().nonnegative(),
  excusedCount: z.number().int().nonnegative(),
  attendancePercentage: z.number().min(0).max(100).optional(),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateStudentAttendanceSummaryDto = z.infer<typeof createStudentAttendanceSummarySchema>;