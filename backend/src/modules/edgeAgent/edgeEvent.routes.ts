import { Router } from 'express';
import { EdgeEventController } from './edgeEvent.controller';

export function createEdgeEventRoutes(edgeEventController: EdgeEventController): Router {
  const router = Router();

  // Create event
  router.post('/events', edgeEventController.createEvent);

  // Get event by event ID
  router.get('/events/event/:eventId', edgeEventController.getEventByEventId);

  // Get event by ID
  router.get('/events/:id', edgeEventController.getEventById);

  // Get events by device
  router.get('/events/device/:deviceId', edgeEventController.getEventsByDevice);

  // Get events by tenant
  router.get('/events/tenant', edgeEventController.getEventsByTenant);

  // Get unsynced events
  router.get('/events/unsynced', edgeEventController.getUnsyncedEvents);

  // Mark event as synced
  router.put('/events/:eventId/synced', edgeEventController.markEventSynced);

  // Increment retry count
  router.put('/events/:eventId/retry', edgeEventController.incrementRetryCount);

  // Delete event
  router.delete('/events/:eventId', edgeEventController.deleteEvent);

  return router;
}
