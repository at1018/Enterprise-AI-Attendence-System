import { Request, Response, NextFunction } from 'express';
import { CameraService } from './camera.service';
import { AppError } from '../../common/middleware/error.middleware';

export class CameraController {
  private cameraService: CameraService;

  constructor(cameraService: CameraService) {
    this.cameraService = cameraService;
  }

  /**
   * Create a new camera
   * POST /api/v1/cameras
   */
  async createCamera(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const camera = await this.cameraService.createCamera(req.body);

      res.status(201).json({
        success: true,
        message: 'Camera created successfully',
        data: camera
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get camera by ID
   * GET /api/v1/cameras/:id
   */
  async getCameraById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const camera = await this.cameraService.getCameraById(id, tenantId);

      res.status(200).json({
        success: true,
        data: camera
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get camera by camera ID
   * GET /api/v1/cameras/camera/:cameraId
   */
  async getCameraByCameraId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cameraId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const camera = await this.cameraService.getCameraByCameraId(cameraId, tenantId);

      res.status(200).json({
        success: true,
        data: camera
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all cameras for tenant
   * GET /api/v1/cameras
   */
  async getCameras(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { classroomId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const cameras = await this.cameraService.getCamerasByTenant(
        tenantId,
        classroomId as string
      );

      res.status(200).json({
        success: true,
        data: cameras,
        count: cameras.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update camera
   * PUT /api/v1/cameras/:id
   */
  async updateCamera(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const camera = await this.cameraService.updateCamera(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Camera updated successfully',
        data: camera
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete camera (soft delete)
   * DELETE /api/v1/cameras/:id
   */
  async deleteCamera(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.cameraService.deleteCamera(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign camera to classroom
   * POST /api/v1/cameras/assign-classroom
   */
  async assignToClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cameraId, classroomId, tenantId } = req.body;

      const camera = await this.cameraService.assignToClassroom(
        cameraId,
        classroomId,
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Camera assigned to classroom successfully',
        data: camera
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove camera from classroom
   * POST /api/v1/cameras/remove-classroom
   */
  async removeFromClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cameraId, tenantId } = req.body;

      const camera = await this.cameraService.removeFromClassroom(cameraId, tenantId);

      res.status(200).json({
        success: true,
        message: 'Camera removed from classroom successfully',
        data: camera
      });
    } catch (error) {
      next(error);
    }
  }
}