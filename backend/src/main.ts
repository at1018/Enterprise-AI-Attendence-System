import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { errorHandler, notFoundHandler } from './common/middleware/error.middleware';
import { TenantService } from './modules/tenants/tenant.service';
import { TenantController } from './modules/tenants/tenant.controller';
import { createTenantRoutes } from './modules/tenants/tenant.routes';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { createAuthRoutes } from './modules/auth/auth.routes';
import { StudentService } from './modules/students/student.service';
import { StudentController } from './modules/students/student.controller';
import { createStudentRoutes } from './modules/students/student.routes';
import { TeacherService } from './modules/teachers/teacher.service';
import { TeacherController } from './modules/teachers/teacher.controller';
import { createTeacherRoutes } from './modules/teachers/teacher.routes';
import { ClassService } from './modules/classes/class.service';
import { ClassController } from './modules/classes/class.controller';
import { createClassRoutes, createSectionRoutes } from './modules/classes/class.routes';
import { SubjectService } from './modules/subjects/subject.service';
import { SubjectController } from './modules/subjects/subject.controller';
import { createSubjectRoutes } from './modules/subjects/subject.routes';
import { AcademicYearService } from './modules/academic/academicYear.service';
import { AcademicYearController } from './modules/academic/academicYear.controller';
import { createAcademicYearRoutes } from './modules/academic/academicYear.routes';
import { ClassroomService } from './modules/classrooms/classroom.service';
import { ClassroomController } from './modules/classrooms/classroom.controller';
import { createClassroomRoutes } from './modules/classrooms/classroom.routes';
import { CameraService } from './modules/cameras/camera.service';
import { CameraController } from './modules/cameras/camera.controller';
import { createCameraRoutes } from './modules/cameras/camera.routes';
import { TimetableService } from './modules/timetable/timetable.service';
import { TimetableController } from './modules/timetable/timetable.controller';
import { createTimetableRoutes } from './modules/timetable/timetable.routes';
import { AttendanceSessionService } from './modules/attendance/attendanceSession.service';
import { AttendanceSessionController } from './modules/attendance/attendanceSession.controller';
import { createAttendanceSessionRoutes } from './modules/attendance/attendanceSession.routes';
import { AttendanceRecordService } from './modules/attendance/attendanceRecord.service';
import { AttendanceRecordController } from './modules/attendance/attendanceRecord.controller';
import { createAttendanceRecordRoutes } from './modules/attendance/attendanceRecord.routes';
import { AttendanceEvidenceService } from './modules/attendance/attendanceEvidence.service';
import { AttendanceEvidenceController } from './modules/attendance/attendanceEvidence.controller';
import { createAttendanceEvidenceRoutes } from './modules/attendance/attendanceEvidence.routes';
import { AttendanceReportService } from './modules/reports/attendanceReport.service';
import { AttendanceReportController } from './modules/reports/attendanceReport.controller';
import { createAttendanceReportRoutes } from './modules/reports/attendanceReport.routes';
import { StudentAttendanceSummaryService } from './modules/reports/studentAttendanceSummary.service';
import { StudentAttendanceSummaryController } from './modules/reports/studentAttendanceSummary.controller';
import { createStudentAttendanceSummaryRoutes } from './modules/reports/studentAttendanceSummary.routes';
import { ClassAttendanceAnalyticsService } from './modules/reports/classAttendanceAnalytics.service';
import { ClassAttendanceAnalyticsController } from './modules/reports/classAttendanceAnalytics.controller';
import { createClassAttendanceAnalyticsRoutes } from './modules/reports/classAttendanceAnalytics.routes';
import { EdgeDeviceService } from './modules/edgeAgent/edgeDevice.service';
import { EdgeDeviceController } from './modules/edgeAgent/edgeDevice.controller';
import { createEdgeDeviceRoutes } from './modules/edgeAgent/edgeDevice.routes';
import { EdgeEventService } from './modules/edgeAgent/edgeEvent.service';
import { EdgeEventController } from './modules/edgeAgent/edgeEvent.controller';
import { createEdgeEventRoutes } from './modules/edgeAgent/edgeEvent.routes';
import { FaceEnrollmentService } from './modules/faceRecognition/faceEnrollment.service';
import { FaceEnrollmentController } from './modules/faceRecognition/faceEnrollment.controller';
import { createFaceEnrollmentRoutes } from './modules/faceRecognition/faceEnrollment.routes';
import { BiometricConsentService } from './modules/faceRecognition/biometricConsent.service';
import { BiometricConsentController } from './modules/faceRecognition/biometricConsent.controller';
import { createBiometricConsentRoutes } from './modules/faceRecognition/biometricConsent.routes';
import { FaceRecognitionResultService } from './modules/faceRecognition/faceRecognitionResult.service';
import { FaceRecognitionResultController } from './modules/faceRecognition/faceRecognitionResult.controller';
import { createFaceRecognitionResultRoutes } from './modules/faceRecognition/faceRecognitionResult.routes';
import { CheckpointAttendanceService } from './modules/checkpointAttendance/checkpointAttendance.service';
import { CheckpointAttendanceController } from './modules/checkpointAttendance/checkpointAttendance.controller';
import checkpointAttendanceRoutes from './modules/checkpointAttendance/checkpointAttendance.routes';
import { TeacherReviewService } from './modules/teacherReview/teacherReview.service';
import { TeacherReviewController } from './modules/teacherReview/teacherReview.controller';
import teacherReviewRoutes from './modules/teacherReview/teacherReview.routes';
import { DashboardService } from './modules/dashboard/dashboard.service';
import { DashboardController } from './modules/dashboard/dashboard.controller';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { createTenantDatabaseContext } from './common/utils/tenant.util';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const tenantDbContext = createTenantDatabaseContext(prisma);
const tenantService = new TenantService(prisma, tenantDbContext);
const tenantController = new TenantController(tenantService);
const authService = new AuthService(prisma);
const authController = new AuthController(authService);
const studentService = new StudentService(prisma);
const studentController = new StudentController(studentService);
const teacherService = new TeacherService(prisma);
const teacherController = new TeacherController(teacherService);
const classService = new ClassService(prisma);
const classController = new ClassController(classService);
const subjectService = new SubjectService(prisma);
const subjectController = new SubjectController(subjectService);
const academicYearService = new AcademicYearService(prisma);
const academicYearController = new AcademicYearController(academicYearService);
const classroomService = new ClassroomService(prisma);
const classroomController = new ClassroomController(classroomService);
const cameraService = new CameraService(prisma);
const cameraController = new CameraController(cameraService);
const timetableService = new TimetableService(prisma);
const timetableController = new TimetableController(timetableService);
const attendanceSessionService = new AttendanceSessionService(prisma);
const attendanceSessionController = new AttendanceSessionController(attendanceSessionService);
const attendanceRecordService = new AttendanceRecordService(prisma);
const attendanceRecordController = new AttendanceRecordController(attendanceRecordService);
const attendanceEvidenceService = new AttendanceEvidenceService(prisma);
const attendanceEvidenceController = new AttendanceEvidenceController(attendanceEvidenceService);
const attendanceReportService = new AttendanceReportService(prisma);
const attendanceReportController = new AttendanceReportController(attendanceReportService);
const studentAttendanceSummaryService = new StudentAttendanceSummaryService(prisma);
const studentAttendanceSummaryController = new StudentAttendanceSummaryController(studentAttendanceSummaryService);
const classAttendanceAnalyticsService = new ClassAttendanceAnalyticsService(prisma);
const classAttendanceAnalyticsController = new ClassAttendanceAnalyticsController(classAttendanceAnalyticsService);
const edgeDeviceService = new EdgeDeviceService(prisma);
const edgeDeviceController = new EdgeDeviceController(edgeDeviceService);
const edgeEventService = new EdgeEventService(prisma);
const edgeEventController = new EdgeEventController(edgeEventService);
const faceEnrollmentService = new FaceEnrollmentService(prisma);
const faceEnrollmentController = new FaceEnrollmentController(faceEnrollmentService);
const biometricConsentService = new BiometricConsentService(prisma);
const biometricConsentController = new BiometricConsentController(biometricConsentService);
const faceRecognitionResultService = new FaceRecognitionResultService(prisma);
const faceRecognitionResultController = new FaceRecognitionResultController(faceRecognitionResultService);
const checkpointAttendanceService = new CheckpointAttendanceService();
const checkpointAttendanceController = new CheckpointAttendanceController();
const teacherReviewService = new TeacherReviewService();
const teacherReviewController = new TeacherReviewController();
const dashboardService = new DashboardService();
const dashboardController = new DashboardController();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection connection failed'
    });
  }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'AI School Classroom Attendance Platform API',
    version: '1.0.0',
    status: 'running'
  });
});

// API routes
app.use('/api/v1/auth', createAuthRoutes(authController));
app.use('/api/v1/tenants', createTenantRoutes(tenantController));
app.use('/api/v1/students', createStudentRoutes(studentController));
app.use('/api/v1/teachers', createTeacherRoutes(teacherController));
app.use('/api/v1/classes', createClassRoutes(classController));
app.use('/api/v1/sections', createSectionRoutes(classController));
app.use('/api/v1/subjects', createSubjectRoutes(subjectController));
app.use('/api/v1/academic-years', createAcademicYearRoutes(academicYearController));
app.use('/api/v1/classrooms', createClassroomRoutes(classroomController));
app.use('/api/v1/cameras', createCameraRoutes(cameraController));
app.use('/api/v1/timetable', createTimetableRoutes(timetableController));
app.use('/api/v1/attendance/sessions', createAttendanceSessionRoutes(attendanceSessionController));
app.use('/api/v1/attendance/records', createAttendanceRecordRoutes(attendanceRecordController));
app.use('/api/v1/attendance/evidence', createAttendanceEvidenceRoutes(attendanceEvidenceController));
app.use('/api/v1/reports', createAttendanceReportRoutes(attendanceReportController));
app.use('/api/v1/analytics', createStudentAttendanceSummaryRoutes(studentAttendanceSummaryController));
app.use('/api/v1/analytics', createClassAttendanceAnalyticsRoutes(classAttendanceAnalyticsController));
app.use('/api/v1/edge', createEdgeDeviceRoutes(edgeDeviceController));
app.use('/api/v1/edge', createEdgeEventRoutes(edgeEventController));
app.use('/api/v1/face-recognition', createFaceEnrollmentRoutes(faceEnrollmentController));
app.use('/api/v1/face-recognition', createBiometricConsentRoutes(biometricConsentController));
app.use('/api/v1/face-recognition', createFaceRecognitionResultRoutes(faceRecognitionResultController));
app.use('/api/v1/checkpoint-attendance', checkpointAttendanceRoutes);
app.use('/api/v1/teacher-review', teacherReviewRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Only start server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await prisma.$disconnect();
    process.exit(0);
  });
}

export default app;