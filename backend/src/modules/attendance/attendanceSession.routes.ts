import { Router } from 'express';
import { AttendanceSessionController } from './attendanceSession.controller';
import { validate } from '../../common/utils/validation.util';
import { createAttendanceSessionSchema, updateAttendanceSessionSchema } from './dto/attendanceSession.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createAttendanceSessionRoutes = (attendanceSessionController: AttendanceSessionController): Router => {
  const router = Router();

  /**
   * POST /api/v1/attendance/sessions
   * Create a new attendance session (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createAttendanceSessionSchema),
    (req, res, next) => attendanceSessionController.createAttendanceSession(req, res, next)
  );

  /**
   * GET /api/v1/attendance/sessions
   * Get all attendance sessions (authenticated)
   */
  router.get('/', authenticate, (req, res, next) => {
    // If date range is provided, use date range filter
    if (req.query.startDate && req.query.endDate) {
      return attendanceSessionController.getAttendanceSessionsByDateRange(req, res, next);
    }
    // Otherwise, get all sessions
    return attendanceSessionController.getAllAttendanceSessions(req, res, next);
  });

  /**
   * GET /api/v1/attendance/sessions/:id
   * Get attendance session by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    attendanceSessionController.getAttendanceSessionById(req, res, next)
  );

  /**
   * POST /api/v1/attendance/sessions/:id/start
   * Start attendance session (requires teacher role)
   */
  router.post('/:id/start', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    (req, res, next) => attendanceSessionController.startAttendanceSession(req, res, next)
  );

  /**
   * POST /api/v1/attendance/sessions/:id/complete
   * Complete attendance session (requires teacher role)
   */
  router.post('/:id/complete', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    (req, res, next) => attendanceSessionController.completeAttendanceSession(req, res, next)
  );

  /**
   * POST /api/v1/attendance/sessions/:id/cancel
   * Cancel attendance session (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/:id/cancel', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => attendanceSessionController.cancelAttendanceSession(req, res, next)
  );

  return router;
};