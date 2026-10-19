import { Router } from 'express';
import { AttendanceEvidenceController } from './attendanceEvidence.controller';
import { validate } from '../../common/utils/validation.util';
import { createAttendanceEvidenceSchema } from './dto/attendanceEvidence.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createAttendanceEvidenceRoutes = (attendanceEvidenceController: AttendanceEvidenceController): Router => {
  const router = Router();

  /**
   * POST /api/v1/attendance/evidence
   * Create a new attendance evidence (requires teacher role)
   */
  router.post('/', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    validate(createAttendanceEvidenceSchema),
    (req, res, next) => attendanceEvidenceController.createAttendanceEvidence(req, res, next)
  );

  /**
   * GET /api/v1/attendance/evidence/session/:sessionId
   * Get evidence by session (authenticated)
   */
  router.get('/session/:sessionId', authenticate, (req, res, next) => 
    attendanceEvidenceController.getEvidencesBySession(req, res, next)
  );

  /**
   * GET /api/v1/attendance/evidence/record/:recordId
   * Get evidence by record (authenticated)
   */
  router.get('/record/:recordId', authenticate, (req, res, next) => 
    attendanceEvidenceController.getEvidenceByRecord(req, res, next)
  );

  /**
   * GET /api/v1/attendance/evidence/record/:recordId/checkpoint/:checkpoint
   * Get evidence by checkpoint (authenticated)
   */
  router.get('/record/:recordId/checkpoint/:checkpoint', authenticate, (req, res, next) => 
    attendanceEvidenceController.getEvidenceByCheckpoint(req, res, next)
  );

  /**
   * GET /api/v1/attendance/evidence/:id
   * Get attendance evidence by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    attendanceEvidenceController.getAttendanceEvidenceById(req, res, next)
  );

  /**
   * PUT /api/v1/attendance/evidence/:id
   * Update attendance evidence (requires teacher role)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    (req, res, next) => attendanceEvidenceController.updateAttendanceEvidence(req, res, next)
  );

  /**
   * DELETE /api/v1/attendance/evidence/:id
   * Delete attendance evidence (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => attendanceEvidenceController.deleteAttendanceEvidence(req, res, next)
  );

  return router;
};