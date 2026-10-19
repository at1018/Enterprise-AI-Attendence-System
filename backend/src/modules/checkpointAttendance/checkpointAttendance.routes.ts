import { Router } from 'express';
import { CheckpointAttendanceController } from './checkpointAttendance.controller';
import { authenticate } from '../../common/middleware/auth.middleware';
import { requireRole } from '../../common/middleware/authorization.middleware';

const router = Router();
const checkpointAttendanceController = new CheckpointAttendanceController();

// All routes require authentication
router.use(authenticate);

// Create checkpoints for a session
router.post('/checkpoints/session/:sessionId/create', 
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER'),
  checkpointAttendanceController.createCheckpoints.bind(checkpointAttendanceController)
);

// Complete a checkpoint with recognition results
router.post('/checkpoints/complete',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER'),
  checkpointAttendanceController.completeCheckpoint.bind(checkpointAttendanceController)
);

// Calculate preliminary attendance for a session
router.post('/preliminary-attendance/session/:sessionId/calculate',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER'),
  checkpointAttendanceController.calculatePreliminaryAttendance.bind(checkpointAttendanceController)
);

// Get checkpoint records for a session
router.get('/checkpoints/session/:sessionId/records',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  checkpointAttendanceController.getCheckpointRecords.bind(checkpointAttendanceController)
);

// Get preliminary attendance for a session
router.get('/preliminary-attendance/session/:sessionId',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  checkpointAttendanceController.getPreliminaryAttendance.bind(checkpointAttendanceController)
);

// Get preliminary attendance for a specific student
router.get('/preliminary-attendance/student/:studentId',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'),
  checkpointAttendanceController.getPreliminaryAttendanceByStudent.bind(checkpointAttendanceController)
);

// Mark preliminary attendance as reviewed
router.put('/preliminary-attendance/review',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER'),
  checkpointAttendanceController.markAsReviewed.bind(checkpointAttendanceController)
);

// Get sessions needing review
router.get('/preliminary-attendance/review/sessions',
  requireRole('SCHOOL_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER'),
  checkpointAttendanceController.getSessionsNeedingReview.bind(checkpointAttendanceController)
);

export default router;
