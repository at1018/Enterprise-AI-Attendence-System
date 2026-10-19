import { z } from 'zod';

/**
 * DTO for creating a student
 */
export const createStudentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  parentName: z.string().max(100).optional(),
  parentPhone: z.string().max(20).optional(),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required')
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;

/**
 * DTO for updating a student
 */
export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.string().optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  parentName: z.string().max(100).optional(),
  parentPhone: z.string().max(20).optional(),
  isActive: z.boolean().optional()
});

export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;

/**
 * DTO for student enrollment
 */
export const studentEnrollmentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classId: z.string().min(1, 'Class ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  sectionId: z.string().optional()
});

export type StudentEnrollmentDto = z.infer<typeof studentEnrollmentSchema>;