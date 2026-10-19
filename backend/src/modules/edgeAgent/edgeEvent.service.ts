import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export class EdgeEventService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create an edge event (with idempotency)
   */
  async createEvent(data: {
    eventId: string;
    eventType: string;
    deviceId: string;
    tenantId: string;
    timestamp: Date;
    data: any;
  }) {
    // Check if event already exists (idempotency)
    const existingEvent = await this.prisma.edgeEvent.findUnique({
      where: { eventId: data.eventId }
    });

    if (existingEvent) {
      // Return existing event to indicate idempotent operation
      return existingEvent;
    }

    // Create new event
    const event = await this.prisma.edgeEvent.create({
      data: {
        eventId: data.eventId,
        eventType: data.eventType,
        deviceId: data.deviceId,
        tenantId: data.tenantId,
        timestamp: data.timestamp,
        data: data.data,
        synced: true, // Mark as synced since it's received from backend
        retryCount: 0
      }
    });

    return event;
  }

  /**
   * Get event by event ID
   */
  async getEventByEventId(eventId: string, tenantId: string) {
    const event = await this.prisma.edgeEvent.findUnique({
      where: { eventId }
    });

    if (!event) {
      throw new AppError(404, 'Edge event not found');
    }

    if (event.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Event belongs to different tenant');
    }

    return event;
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string, tenantId: string) {
    const event = await this.prisma.edgeEvent.findUnique({
      where: { id }
    });

    if (!event) {
      throw new AppError(404, 'Edge event not found');
    }

    if (event.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Event belongs to different tenant');
    }

    return event;
  }

  /**
   * Get events by device
   */
  async getEventsByDevice(deviceId: string, tenantId: string, limit: number = 50) {
    // Verify device belongs to tenant
    const device = await this.prisma.edgeDevice.findUnique({
      where: { deviceId }
    });

    if (!device) {
      throw new AppError(404, 'Edge device not found');
    }

    if (device.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Device belongs to different tenant');
    }

    const events = await this.prisma.edgeEvent.findMany({
      where: { deviceId },
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return events;
  }

  /**
   * Get events by tenant
   */
  async getEventsByTenant(tenantId: string, eventType?: string, limit: number = 100) {
    const where: any = { tenantId };

    if (eventType) {
      where.eventType = eventType;
    }

    const events = await this.prisma.edgeEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    });

    return events;
  }

  /**
   * Get unsynced events
   */
  async getUnsyncedEvents(tenantId: string, limit: number = 50) {
    const events = await this.prisma.edgeEvent.findMany({
      where: {
        tenantId,
        synced: false
      },
      orderBy: { timestamp: 'asc' },
      take: limit
    });

    return events;
  }

  /**
   * Mark event as synced
   */
  async markEventSynced(eventId: string, tenantId: string) {
    const event = await this.getEventByEventId(eventId, tenantId);

    const updatedEvent = await this.prisma.edgeEvent.update({
      where: { eventId },
      data: {
        synced: true,
        updatedAt: new Date()
      }
    });

    return updatedEvent;
  }

  /**
   * Increment event retry count
   */
  async incrementRetryCount(eventId: string, tenantId: string) {
    const event = await this.getEventByEventId(eventId, tenantId);

    const updatedEvent = await this.prisma.edgeEvent.update({
      where: { eventId },
      data: {
        retryCount: event.retryCount + 1,
        updatedAt: new Date()
      }
    });

    return updatedEvent;
  }

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, tenantId: string) {
    const event = await this.getEventByEventId(eventId, tenantId);

    await this.prisma.edgeEvent.delete({
      where: { eventId }
    });

    return { message: 'Event deleted successfully' };
  }
}
