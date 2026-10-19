import { z } from 'zod';

/**
 * DTO for creating edge event
 */
export const createEdgeEventSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  eventType: z.string().min(1, 'Event type is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  timestamp: z.string().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
  data: z.any().optional().default({})
});

export type CreateEdgeEventDto = z.infer<typeof createEdgeEventSchema>;
