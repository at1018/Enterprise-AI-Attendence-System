import { Router } from 'express';
import { AttendanceRecordController } from './attendanceRecord.controller';
import { validate } from '../../common/utils/validation.util';
import { createAttendanceRecordSchema, updateAttendanceRecordSchema } from './dto/attendanceRecord.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createAttendanceRecordRoutes = (attendanceRecordController: AttendanceRecordController): Router => {
  const router = Router();

  /**
   * POST /api/v1/attendance/records
   * Create a new attendance record (requires teacher role)
   */
  router.post('/', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    validate(createAttendanceRecordSchema),
    (req, res, next) => attendanceRecordController.createAttendanceRecord(req, res, next)
  );

  /**
   * POST /api/v1/attendance/records/bulk
   * Bulk create attendance records (requires teacher role)
   */
  router.post('/bulk', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    (req, res, next) => attendanceRecordController.bulkCreateAttendanceRecords(req, res, next)
  );

  /**
   * GET /api/v1/attendance/records/session/:sessionId
   * Get attendance records by session (authenticated)
   */
  router.get('/session/:sessionId', authenticate, (req, res, next) => 
    attendanceRecordController.getAttendanceRecordsBySession(req, res, next)
  );

  /**
   * GET /api/v1/attendance/records/student/:studentId
   * Get attendance records by student (authenticated)
   */
  router.get('/student/:studentId', authenticate, (req, res, next) => 
    attendanceRecordController.getAttendanceRecordsByStudent(req, res, next)
  );

  /**
   * GET /api/v1/attendance/records/:id
   * Get attendance record by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    attendanceRecordController.getAttendanceRecordById(req, res, next)
  );

  /**
   * PUT /api/v1/attendance/records/:id
   * Update attendance record (requires teacher role)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    validate(updateAttendanceRecordSchema),
    (req, res, next) => attendanceRecordController.updateAttendanceRecord(req, res, next)
  );

  /**
   * DELETE /api/v1/attendance/records/:id
   * Delete attendance record (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => attendanceRecordController.deleteAttendanceRecord(req, res, next)
  );

  return router;
};