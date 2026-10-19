import { Router } from 'express';
import { AcademicYearController } from './academicYear.controller';
import { validate } from '../../common/utils/validation.util';
import { createAcademicYearSchema, updateAcademicYearSchema } from './dto/academicYear.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createAcademicYearRoutes = (academicYearController: AcademicYearController): Router => {
  const router = Router();

  /**
   * POST /api/v1/academic-years
   * Create a new academic year (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createAcademicYearSchema),
    (req, res, next) => academicYearController.createAcademicYear(req, res, next)
  );

  /**
   * GET /api/v1/academic-years
   * Get all academic years for tenant (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    academicYearController.getAcademicYears(req, res, next)
  );

  /**
   * GET /api/v1/academic-years/active
   * Get active academic year for tenant (authenticated)
   */
  router.get('/active', authenticate, (req, res, next) => 
    academicYearController.getActiveAcademicYear(req, res, next)
  );

  /**
   * GET /api/v1/academic-years/:id
   * Get academic year by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    academicYearController.getAcademicYearById(req, res, next)
  );

  /**
   * PUT /api/v1/academic-years/:id
   * Update academic year (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateAcademicYearSchema),
    (req, res, next) => academicYearController.updateAcademicYear(req, res, next)
  );

  /**
   * DELETE /api/v1/academic-years/:id
   * Delete academic year (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => academicYearController.deleteAcademicYear(req, res, next)
  );

  return router;
};