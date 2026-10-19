import { Router } from 'express';
import { TimetableController } from './timetable.controller';
import { validate } from '../../common/utils/validation.util';
import { createTimetableEntrySchema, updateTimetableEntrySchema } from './dto/timetable.dto';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createTimetableRoutes = (timetableController: TimetableController): Router => {
  const router = Router();

  /**
   * POST /api/v1/timetable
   * Create a new timetable entry (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.post('/', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(createTimetableEntrySchema),
    (req, res, next) => timetableController.createTimetableEntry(req, res, next)
  );

  /**
   * GET /api/v1/timetable/class/:classId
   * Get timetable by class (authenticated)
   */
  router.get('/class/:classId', authenticate, (req, res, next) => 
    timetableController.getTimetableByClass(req, res, next)
  );

  /**
   * GET /api/v1/timetable/teacher/:teacherId
   * Get timetable by teacher (authenticated)
   */
  router.get('/teacher/:teacherId', authenticate, (req, res, next) => 
    timetableController.getTimetableByTeacher(req, res, next)
  );

  /**
   * GET /api/v1/timetable/classroom/:classroomId
   * Get timetable by classroom (authenticated)
   */
  router.get('/classroom/:classroomId', authenticate, (req, res, next) => 
    timetableController.getTimetableByClassroom(req, res, next)
  );

  /**
   * GET /api/v1/timetable/:id
   * Get timetable entry by ID (authenticated)
   */
  router.get('/:id', authenticate, (req, res, next) => 
    timetableController.getTimetableEntryById(req, res, next)
  );

  /**
   * PUT /api/v1/timetable/:id
   * Update timetable entry (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.put('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    validate(updateTimetableEntrySchema),
    (req, res, next) => timetableController.updateTimetableEntry(req, res, next)
  );

  /**
   * DELETE /api/v1/timetable/:id
   * Delete timetable entry (requires SCHOOL_ADMIN or PRINCIPAL)
   */
  router.delete('/:id', 
    authenticate, 
    requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
    (req, res, next) => timetableController.deleteTimetableEntry(req, res, next)
  );

  return router;
};