import { z } from 'zod';

/**
 * DTO for creating an academic year
 */
export const createAcademicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required').max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  tenantId: z.string().min(1, 'Tenant ID is required')
}).refine((data) => data.startDate < data.endDate, {
  message: 'Start date must be before end date'
});

export type CreateAcademicYearDto = z.infer<typeof createAcademicYearSchema>;

/**
 * DTO for updating an academic year
 */
export const updateAcademicYearSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate < data.endDate;
  }
  return true;
}, {
  message: 'Start date must be before end date'
});

export type UpdateAcademicYearDto = z.infer<typeof updateAcademicYearSchema>;