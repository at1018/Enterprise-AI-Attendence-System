import { z } from 'zod';
import { EdgeDeviceStatus } from '@prisma/client';

/**
 * DTO for registering/updating edge device
 */
export const registerEdgeDeviceSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  deviceName: z.string().min(1, 'Device name is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  status: z.nativeEnum(EdgeDeviceStatus).optional(),
  authCredential: z.string().optional(),
  metadata: z.any().optional()
});

export type RegisterEdgeDeviceDto = z.infer<typeof registerEdgeDeviceSchema>;

/**
 * DTO for updating device status
 */
export const updateDeviceStatusSchema = z.object({
  status: z.nativeEnum(EdgeDeviceStatus)
});

export type UpdateDeviceStatusDto = z.infer<typeof updateDeviceStatusSchema>;
