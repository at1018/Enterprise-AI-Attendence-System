import { Router } from 'express';
import { StudentAttendanceSummaryController } from './studentAttendanceSummary.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createStudentAttendanceSummaryRoutes = (studentAttendanceSummaryController: StudentAttendanceSummaryController): Router => {
  const router = Router();

  /**
   * POST /api/v1/analytics/student-summary/:studentId/:academicYearId/calculate
   * Calculate student attendance summary (requires teacher role)
   */
  router.post('/student-summary/:studentId/:academicYearId/calculate', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    (req, res, next) => studentAttendanceSummaryController.calculateStudentSummary(req, res, next)
  );

  /**
   * GET /api/v1/analytics/student-summary/:studentId/:academicYearId
   * Get student attendance summary (authenticated)
   */
  router.get('/student-summary/:studentId/:academicYearId', authenticate, (req, res, next) => 
    studentAttendanceSummaryController.getStudentSummary(req, res, next)
  );

  /**
   * GET /api/v1/analytics/student-summary/class/:classId/:academicYearId
   * Get student summaries by class (authenticated)
   */
  router.get('/student-summary/class/:classId/:academicYearId', authenticate, (req, res, next) => 
    studentAttendanceSummaryController.getSummariesByClass(req, res, next)
  );

  /**
   * GET /api/v1/analytics/student-summary/low-attendance/:academicYearId
   * Get students with low attendance (authenticated)
   */
  router.get('/student-summary/low-attendance/:academicYearId', authenticate, (req, res, next) => 
    studentAttendanceSummaryController.getLowAttendanceStudents(req, res, next)
  );

  return router;
};