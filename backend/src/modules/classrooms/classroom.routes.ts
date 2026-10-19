import { Router } from 'express';
import { ClassroomController } from './classroom.controller';
import { validate } from '../../common/utils/validation.util';
import { createClassroomSchema, updateClassroomSchema } from './dto/classroom.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createClassroomRoutes = (classroomController: ClassroomController): Router => {
  const router = Router();

  /**
   * POST /api/v1/classrooms
   * Create a new classroom (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createClassroomSchema),
    (req, res, next) => classroomController.createClassroom(req, res, next)
  );

  /**
   * GET /api/v1/classrooms
   * Get all classrooms for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    classroomController.getClassrooms(req, res, next)
  );

  /**
   * GET /api/v1/classrooms/available
   * Get available classrooms (authenticated)
   */
  router.get('/available', authenticate, (req, res, next) => 
    classroomController.getAvailableClassrooms(req, res, next)
  );

  /**
   * GET /api/v1/classrooms/:id
   * Get classroom by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    classroomController.getClassroomById(req, res, next)
  );

  /**
   * PUT /api/v1/classrooms/:id
   * Update classroom (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateClassroomSchema),
    (req, res, next) => classroomController.updateClassroom(req, res, next)
  );

  /**
   * DELETE /api/v1/classrooms/:id
   * Delete classroom (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => classroomController.deleteClassroom(req, res, next)
  );

  return router;
};