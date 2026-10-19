import { Request, Response, NextFunction } from 'express';
import { EdgeEventService } from './edgeEvent.service';
import { createEdgeEventSchema } from './dto/edgeEvent.dto';

export class EdgeEventController {
  constructor(private edgeEventService: EdgeEventService) {}

  /**
   * Create an edge event
   */
  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = createEdgeEventSchema.parse(req.body);
      const event = await this.edgeEventService.createEvent({
        eventId: dto.eventId,
        eventType: dto.eventType,
        deviceId: dto.deviceId,
        tenantId: dto.tenantId,
        timestamp: dto.timestamp,
        data: dto.data || {}
      });
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get event by event ID
   */
  getEventByEventId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const event = await this.edgeEventService.getEventByEventId(eventId, tenantId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get event by ID
   */
  getEventById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const event = await this.edgeEventService.getEventById(id, tenantId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get events by device
   */
  getEventsByDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { limit } = req.query;
      const events = await this.edgeEventService.getEventsByDevice(deviceId, tenantId, limit ? parseInt(limit as string) : 50);
      res.json({ events });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get events by tenant
   */
  getEventsByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { eventType, limit } = req.query;
      const events = await this.edgeEventService.getEventsByTenant(tenantId, eventType as string, limit ? parseInt(limit as string) : 100);
      res.json({ events });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get unsynced events
   */
  getUnsyncedEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { limit } = req.query;
      const events = await this.edgeEventService.getUnsyncedEvents(tenantId, limit ? parseInt(limit as string) : 50);
      res.json({ events });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark event as synced
   */
  markEventSynced = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const event = await this.edgeEventService.markEventSynced(eventId, tenantId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Increment event retry count
   */
  incrementRetryCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const event = await this.edgeEventService.incrementRetryCount(eventId, tenantId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete event
   */
  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const result = await this.edgeEventService.deleteEvent(eventId, tenantId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
