import { z } from 'zod';

// Accept Attendance DTO
export const acceptAttendanceSchema = z.object({
  preliminaryAttendanceId: z.string().cuid(),
  notes: z.string().optional()
});

export type AcceptAttendanceDto = z.infer<typeof acceptAttendanceSchema>;

// Override Attendance DTO
export const overrideAttendanceSchema = z.object({
  preliminaryAttendanceId: z.string().cuid(),
  newStatus: z.string(),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional()
});

export type OverrideAttendanceDto = z.infer<typeof overrideAttendanceSchema>;

// Confirm Session DTO
export const confirmSessionSchema = z.object({
  sessionId: z.string().cuid()
});

export type ConfirmSessionDto = z.infer<typeof confirmSessionSchema>;

// Bulk Accept DTO
export const bulkAcceptSchema = z.object({
  sessionId: z.string().cuid(),
  notes: z.string().optional()
});

export type BulkAcceptDto = z.infer<typeof bulkAcceptSchema>;
