import { Router } from 'express';
import { AttendanceReportController } from './attendanceReport.controller';
import { validate } from '../../common/utils/validation.util';
import { createAttendanceReportSchema } from './dto/attendanceReport.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createAttendanceReportRoutes = (attendanceReportController: AttendanceReportController): Router => {
  const router = Router();

  /**
   * POST /api/v1/reports
   * Create a new attendance report (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createAttendanceReportSchema),
    (req, res, next) => attendanceReportController.createAttendanceReport(req, res, next)
  );

  /**
   * GET /api/v1/reports
   * Get reports by date range (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => 
    attendanceReportController.getReportsByDateRange(req, res, next)
  );

  /**
   * GET /api/v1/reports/:id
   * Get report by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    attendanceReportController.getAttendanceReportById(req, res, next)
  );

  /**
   * DELETE /api/v1/reports/:id
   * Delete report (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => attendanceReportController.deleteAttendanceReport(req, res, next)
  );

  return router;
};