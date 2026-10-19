import { Router } from 'express';
import { CameraController } from './camera.controller';
import { validate } from '../../common/utils/validation.util';
import { createCameraSchema, updateCameraSchema } from './dto/camera.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createCameraRoutes = (cameraController: CameraController): Router => {
  const router = Router();

  /**
   * POST /api/v1/cameras
   * Create a new camera (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createCameraSchema),
    (req, res, next) => cameraController.createCamera(req, res, next)
  );

  /**
   * GET /api/v1/cameras
   * Get all cameras for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    cameraController.getCameras(req, res, next)
  );

  /**
   * GET /api/v1/cameras/:id
   * Get camera by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    cameraController.getCameraById(req, res, next)
  );

  /**
   * GET /api/v1/cameras/camera/:cameraId
   * Get camera by camera ID (authenticated)
   */
  router.get('/camera/:cameraId', authenticate, (req, res, next) => 
    cameraController.getCameraByCameraId(req, res, next)
  );

  /**
   * PUT /api/v1/cameras/:id
   * Update camera (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateCameraSchema),
    (req, res, next) => cameraController.updateCamera(req, res, next)
  );

  /**
   * DELETE /api/v1/cameras/:id
   * Delete camera (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => cameraController.deleteCamera(req, res, next)
  );

  /**
   * POST /api/v1/cameras/assign-classroom
   * Assign camera to classroom (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/assign-classroom', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => cameraController.assignToClassroom(req, res, next)
  );

  /**
   * POST /api/v1/cameras/remove-classroom
   * Remove camera from classroom (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/remove-classroom', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => cameraController.removeFromClassroom(req, res, next)
  );

  return router;
};