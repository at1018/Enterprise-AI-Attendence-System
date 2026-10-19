import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

const router = Router();
const dashboardController = new DashboardController();

// All routes require authentication
router.use(authenticate);

// Teacher Dashboard
router.get('/teacher/session/:sessionId',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  dashboardController.getTeacherDashboard.bind(dashboardController)
);

// School Admin Dashboard
router.get('/school-admin',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL'),
  dashboardController.getSchoolAdminDashboard.bind(dashboardController)
);

// Principal Dashboard
router.get('/principal',
  requireRole('PRINCIPAL'),
  dashboardController.getPrincipalDashboard.bind(dashboardController)
);

// Student Attendance History
router.get('/student/:studentId/history',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  dashboardController.getStudentAttendanceHistory.bind(dashboardController)
);

// Export Attendance as CSV
router.get('/export/:sessionId/csv',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  dashboardController.exportAttendanceAsCSV.bind(dashboardController)
);

// Filtered Attendance
router.get('/filtered',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  dashboardController.getFilteredAttendance.bind(dashboardController)
);

export default router;
