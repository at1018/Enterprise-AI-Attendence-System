import { PrismaClient, EdgeDeviceStatus } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export class EdgeDeviceService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Register or update an edge device
   */
  async registerDevice(data: {
    deviceId: string;
    deviceName: string;
    tenantId: string;
    status?: string;
    authCredential?: string;
    metadata?: any;
  }) {
    // Check if device already exists
    const existingDevice = await this.prisma.edgeDevice.findUnique({
      where: { deviceId: data.deviceId }
    });

    if (existingDevice) {
      // Update existing device
      const updatedDevice = await this.prisma.edgeDevice.update({
        where: { deviceId: data.deviceId },
        data: {
          deviceName: data.deviceName,
          status: (data.status || 'ONLINE') as EdgeDeviceStatus,
          lastSeen: new Date(),
          authCredential: data.authCredential,
          metadata: data.metadata,
          updatedAt: new Date()
        }
      });

      return updatedDevice;
    }

    // Create new device
    const device = await this.prisma.edgeDevice.create({
      data: {
        deviceId: data.deviceId,
        deviceName: data.deviceName,
        tenantId: data.tenantId,
        status: (data.status || 'ONLINE') as EdgeDeviceStatus,
        lastSeen: new Date(),
        authCredential: data.authCredential,
        metadata: data.metadata
      }
    });

    return device;
  }

  /**
   * Get device by device ID
   */
  async getDeviceByDeviceId(deviceId: string, tenantId: string) {
    const device = await this.prisma.edgeDevice.findUnique({
      where: { deviceId }
    });

    if (!device) {
      throw new AppError(404, 'Edge device not found');
    }

    if (device.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Device belongs to different tenant');
    }

    return device;
  }

  /**
   * Get device by ID
   */
  async getDeviceById(id: string, tenantId: string) {
    const device = await this.prisma.edgeDevice.findUnique({
      where: { id }
    });

    if (!device) {
      throw new AppError(404, 'Edge device not found');
    }

    if (device.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Device belongs to different tenant');
    }

    return device;
  }

  /**
   * Get all devices for a tenant
   */
  async getDevicesByTenant(tenantId: string, status?: string) {
    const where: any = { tenantId };

    if (status) {
      where.status = status;
    }

    const devices = await this.prisma.edgeDevice.findMany({
      where,
      orderBy: { lastSeen: 'desc' }
    });

    return devices;
  }

  /**
   * Update device status
   */
  async updateDeviceStatus(deviceId: string, status: string, tenantId: string) {
    const device = await this.getDeviceByDeviceId(deviceId, tenantId);

    const updatedDevice = await this.prisma.edgeDevice.update({
      where: { deviceId },
      data: {
        status: status as EdgeDeviceStatus,
        lastSeen: new Date(),
        updatedAt: new Date()
      }
    });

    return updatedDevice;
  }

  /**
   * Delete device
   */
  async deleteDevice(deviceId: string, tenantId: string) {
    const device = await this.getDeviceByDeviceId(deviceId, tenantId);

    await this.prisma.edgeDevice.delete({
      where: { deviceId }
    });

    return { message: 'Device deleted successfully' };
  }
}
