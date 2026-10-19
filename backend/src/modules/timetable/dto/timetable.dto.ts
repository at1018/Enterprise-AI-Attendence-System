import { z } from 'zod';

/**
 * DTO for creating a timetable entry
 */
export const createTimetableEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6, 'Day of week must be between 0 (Sunday) and 6 (Saturday)'),
  period: z.number().int().positive('Period must be greater than 0'),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'),
  classId: z.string().min(1, 'Class ID is required'),
  sectionId: z.string().optional(),
  subjectId: z.string().min(1, 'Subject ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
  classroomId: z.string().min(1, 'Classroom ID is required'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required')
}).refine((data) => data.startTime < data.endTime, {
  message: 'Start time must be before end time'
});

export type CreateTimetableEntryDto = z.infer<typeof createTimetableEntrySchema>;

/**
 * DTO for updating a timetable entry
 */
export const updateTimetableEntrySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6).optional(),
  period: z.number().int().positive().optional(),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  subjectId: z.string().optional(),
  teacherId: z.string().optional(),
  classroomId: z.string().optional(),
  isActive: z.boolean().optional()
}).refine((data) => {
  if (data.startTime && data.endTime) {
    return data.startTime < data.endTime;
  }
  return true;
}, {
  message: 'Start time must be before end time'
});

export type UpdateTimetableEntryDto = z.infer<typeof updateTimetableEntrySchema>;