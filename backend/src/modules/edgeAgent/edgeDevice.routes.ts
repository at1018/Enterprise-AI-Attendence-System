import { Router } from 'express';
import { EdgeDeviceController } from './edgeDevice.controller';

export function createEdgeDeviceRoutes(edgeDeviceController: EdgeDeviceController): Router {
  const router = Router();

  // Register/update device
  router.post('/devices/register', edgeDeviceController.registerDevice);

  // Get device by device ID
  router.get('/devices/device/:deviceId', edgeDeviceController.getDeviceByDeviceId);

  // Get device by ID
  router.get('/devices/:id', edgeDeviceController.getDeviceById);

  // Get all devices for tenant
  router.get('/devices', edgeDeviceController.getDevicesByTenant);

  // Update device status
  router.put('/devices/:deviceId/status', edgeDeviceController.updateDeviceStatus);

  // Delete device
  router.delete('/devices/:deviceId', edgeDeviceController.deleteDevice);

  return router;
}
