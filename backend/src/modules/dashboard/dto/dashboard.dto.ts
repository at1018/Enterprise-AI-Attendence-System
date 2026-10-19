import { z } from 'zod';

// Teacher Dashboard DTO
export const teacherDashboardSchema = z.object({
  sessionId: z.string().cuid()
});

export type TeacherDashboardDto = z.infer<typeof teacherDashboardSchema>;

// School Admin Dashboard DTO
export const schoolAdminDashboardSchema = z.object({
  academicYearId: z.string().cuid().optional()
});

export type SchoolAdminDashboardDto = z.infer<typeof schoolAdminDashboardSchema>;

// Principal Dashboard DTO
export const principalDashboardSchema = z.object({
  academicYearId: z.string().cuid().optional()
});

export type PrincipalDashboardDto = z.infer<typeof principalDashboardSchema>;

// Student Attendance History DTO
export const studentAttendanceHistorySchema = z.object({
  studentId: z.string().cuid(),
  academicYearId: z.string().cuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional()
});

export type StudentAttendanceHistoryDto = z.infer<typeof studentAttendanceHistorySchema>;

// Filtered Attendance DTO
export const filteredAttendanceSchema = z.object({
  classId: z.string().cuid().optional(),
  subjectId: z.string().cuid().optional(),
  teacherId: z.string().cuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: z.string().optional()
});

export type FilteredAttendanceDto = z.infer<typeof filteredAttendanceSchema>;
