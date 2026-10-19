import { Request, Response, NextFunction } from 'express';
import { EdgeDeviceService } from './edgeDevice.service';
import { registerEdgeDeviceSchema, updateDeviceStatusSchema } from './dto/edgeDevice.dto';

export class EdgeDeviceController {
  constructor(private edgeDeviceService: EdgeDeviceService) {}

  /**
   * Register or update an edge device
   */
  registerDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = registerEdgeDeviceSchema.parse(req.body);
      const device = await this.edgeDeviceService.registerDevice(dto);
      res.status(201).json(device);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get device by device ID
   */
  getDeviceByDeviceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const device = await this.edgeDeviceService.getDeviceByDeviceId(deviceId, tenantId);
      res.json(device);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get device by ID
   */
  getDeviceById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const device = await this.edgeDeviceService.getDeviceById(id, tenantId);
      res.json(device);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all devices for a tenant
   */
  getDevicesByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { status } = req.query;
      const devices = await this.edgeDeviceService.getDevicesByTenant(tenantId, status as string);
      res.json({ devices });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update device status
   */
  updateDeviceStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;
      const dto = updateDeviceStatusSchema.parse(req.body);
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const device = await this.edgeDeviceService.updateDeviceStatus(deviceId, dto.status, tenantId);
      res.json(device);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete device
   */
  deleteDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const result = await this.edgeDeviceService.deleteDevice(deviceId, tenantId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
