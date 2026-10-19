import { Router } from 'express';
import { TeacherReviewController } from './teacherReview.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

const router = Router();
const teacherReviewController = new TeacherReviewController();

// All routes require authentication
router.use(authenticate);

// Accept AI-generated attendance
router.post('/accept',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.acceptAttendance.bind(teacherReviewController)
);

// Override AI-generated attendance
router.post('/override',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.overrideAttendance.bind(teacherReviewController)
);

// Confirm session attendance
router.post('/confirm-session',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.confirmSessionAttendance.bind(teacherReviewController)
);

// Bulk accept attendance
router.post('/bulk-accept',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.bulkAcceptAttendance.bind(teacherReviewController)
);

// Get audit trail for student
router.get('/audit/student/:studentId',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.getAuditTrailForStudent.bind(teacherReviewController)
);

// Get audit trail for session
router.get('/audit/session/:sessionId',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.getAuditTrailForSession.bind(teacherReviewController)
);

// Get review dashboard
router.get('/dashboard/session/:sessionId',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  teacherReviewController.getReviewDashboard.bind(teacherReviewController)
);

export default router;
