import { Router } from 'express';
import { SubjectController } from './subject.controller';
import { validate } from '../../common/utils/validation.util';
import { createSubjectSchema, updateSubjectSchema } from './dto/subject.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createSubjectRoutes = (subjectController: SubjectController): Router => {
  const router = Router();

  /**
   * POST /api/v1/subjects
   * Create a new subject (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createSubjectSchema),
    (req, res, next) => subjectController.createSubject(req, res, next)
  );

  /**
   * GET /api/v1/subjects
   * Get all subjects for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    subjectController.getSubjects(req, res, next)
  );

  /**
   * GET /api/v1/subjects/:id
   * Get subject by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    subjectController.getSubjectById(req, res, next)
  );

  /**
   * GET /api/v1/subjects/code/:code
   * Get subject by code (authenticated)
   */
  router.get('/code/:code', authenticate, (req, res, next) => 
    subjectController.getSubjectByCode(req, res, next)
  );

  /**
   * PUT /api/v1/subjects/:id
   * Update subject (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateSubjectSchema),
    (req, res, next) => subjectController.updateSubject(req, res, next)
  );

  /**
   * DELETE /api/v1/subjects/:id
   * Delete subject (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => subjectController.deleteSubject(req, res, next)
  );

  return router;
};