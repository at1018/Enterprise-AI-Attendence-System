import { Router } from 'express';
import { ClassController } from './class.controller';
import { validate } from '../../common/utils/validation.util';
import { createClassSchema, updateClassSchema, createSectionSchema, updateSectionSchema } from './dto/class.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createClassRoutes = (classController: ClassController): Router => {
  const router = Router();

  /**
   * POST /api/v1/classes
   * Create a new class (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createClassSchema),
    (req, res, next) => classController.createClass(req, res, next)
  );

  /**
   * GET /api/v1/classes
   * Get all classes for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    classController.getClasses(req, res, next)
  );

  /**
   * GET /api/v1/classes/:id
   * Get class by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    classController.getClassById(req, res, next)
  );

  /**
   * PUT /api/v1/classes/:id
   * Update class (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateClassSchema),
    (req, res, next) => classController.updateClass(req, res, next)
  );

  /**
   * DELETE /api/v1/classes/:id
   * Delete class (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => classController.deleteClass(req, res, next)
  );

  /**
   * GET /api/v1/classes/:classId/sections
   * Get all sections for a class (authenticated)
   */
  router.get('/:classId/sections', authenticate, (req, res, next) => 
    classController.getSectionsByClass(req, res, next)
  );

  return router;
};

export const createSectionRoutes = (classController: ClassController): Router => {
  const router = Router();

  /**
   * POST /api/v1/sections
   * Create a new section (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createSectionSchema),
    (req, res, next) => classController.createSection(req, res, next)
  );

  /**
   * GET /api/v1/sections/:id
   * Get section by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    classController.getSectionById(req, res, next)
  );

  /**
   * PUT /api/v1/sections/:id
   * Update section (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateSectionSchema),
    (req, res, next) => classController.updateSection(req, res, next)
  );

  /**
   * DELETE /api/v1/sections/:id
   * Delete section (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => classController.deleteSection(req, res, next)
  );

  return router;
};