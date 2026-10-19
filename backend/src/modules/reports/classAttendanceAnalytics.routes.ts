import { Router } from 'express';
import { ClassAttendanceAnalyticsController } from './classAttendanceAnalytics.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

export const createClassAttendanceAnalyticsRoutes = (classAttendanceAnalyticsController: ClassAttendanceAnalyticsController): Router => {
  const router = Router();

  /**
   * POST /api/v1/analytics/class-analytics/:classId/calculate
   * Calculate class attendance analytics (requires teacher role)
   */
  router.post('/class-analytics/:classId/calculate', 
    authenticate, 
    requireRole('SUBJECT_TEACHER', 'CLASS_TEACHER', 'PRINCIPAL'),
    (req, res, next) => classAttendanceAnalyticsController.calculateClassAnalytics(req, res, next)
  );

  /**
   * GET /api/v1/analytics/class-analytics/:classId
   * Get class analytics by date (authenticated)
   */
  router.get('/class-analytics/:classId', authenticate, (req, res, next) => 
    classAttendanceAnalyticsController.getClassAnalyticsByDate(req, res, next)
  );

  /**
   * GET /api/v1/analytics/class-analytics/:classId/range
   * Get class analytics by date range (authenticated)
   */
  router.get('/class-analytics/:classId/range', authenticate, (req, res, next) => 
    classAttendanceAnalyticsController.getClassAnalyticsByDateRange(req, res, next)
  );

  /**
   * GET /api/v1/analytics/class-analytics/:classId/trends
   * Get class attendance trends (authenticated)
   */
  router.get('/class-analytics/:classId/trends', authenticate, (req, res, next) => 
    classAttendanceAnalyticsController.getClassAttendanceTrends(req, res, next)
  );

  /**
   * GET /api/v1/analytics/overall-statistics
   * Get overall attendance statistics (authenticated)
   */
  router.get('/overall-statistics', authenticate, (req, res, next) => 
    classAttendanceAnalyticsController.getOverallStatistics(req, res, next)
  );

  return router;
};