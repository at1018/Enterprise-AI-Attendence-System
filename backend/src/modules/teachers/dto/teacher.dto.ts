import { z } from 'zod';

/**
 * DTO for creating a teacher
 */
export const createTeacherSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().max(20).optional(),
  qualification: z.string().max(200).optional(),
  specialization: z.string().max(200).optional(),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateTeacherDto = z.infer<typeof createTeacherSchema>;

/**
 * DTO for updating a teacher
 */
export const updateTeacherSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  qualification: z.string().max(200).optional(),
  specialization: z.string().max(200).optional(),
  isActive: z.boolean().optional()
});

export type UpdateTeacherDto = z.infer<typeof updateTeacherSchema>;

/**
 * DTO for class assignment
 */
export const classAssignmentSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  sectionId: z.string().optional()
});

export type ClassAssignmentDto = z.infer<typeof classAssignmentSchema>;

/**
 * DTO for subject assignment
 */
export const subjectAssignmentSchema = z.object({
  teacherId: z.string().min(1, 'Teacher ID is required'),
  subjectId: z.string().min(1, 'Subject ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  classId: z.string().optional(),
  sectionId: z.string().optional()
});

export type SubjectAssignmentDto = z.infer<typeof subjectAssignmentSchema>;