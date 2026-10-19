import { PrismaClient } from '@prisma/client';
import { DashboardService } from '../src/modules/dashboard/dashboard.service';

const prisma = new PrismaClient();
const dashboardService = new DashboardService();

// Helper to generate unique session IDs
let sessionCounter = 1;
const generateSessionId = () => `SESSION-${sessionCounter++}-${Date.now()}`;

describe('Phase 10: Reports & Dashboards', () => {
  let testTenantId: string;
  let testAcademicYearId: string;
  let testClassId: string;
  let testSubjectId: string;
  let testTeacherId: string;
  let testClassroomId: string;
  let testStudentId: string;
  let testSessionId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.attendanceAuditTrail.deleteMany({});
    await prisma.preliminaryAttendance.deleteMany({});
    await prisma.checkpointRecord.deleteMany({});
    await prisma.attendanceCheckpoint.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.attendanceSession.deleteMany({});
    await prisma.studentEnrollment.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.classroom.deleteMany({});
    await prisma.academicYear.deleteMany({});
    await prisma.tenant.deleteMany({});

    // Create test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Test School',
        slug: 'test-school-phase10',
        schemaName: 'test_school_phase10',
        status: 'ACTIVE'
      }
    });
    testTenantId = tenant.id;

    // Create test academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        tenantId: testTenantId
      }
    });
    testAcademicYearId = academicYear.id;

    // Create test class
    const testClass = await prisma.class.create({
      data: {
        name: 'Class 10A',
        grade: 10,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      }
    });
    testClassId = testClass.id;

    // Create test subject
    const subject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        tenantId: testTenantId
      }
    });
    testSubjectId = subject.id;

    // Create test teacher
    const teacher = await prisma.teacher.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        teacherId: 'T001',
        email: 'john.doe@test.com',
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      }
    });
    testTeacherId = teacher.id;

    // Create test classroom
    const classroom = await prisma.classroom.create({
      data: {
        name: 'Room 101',
        capacity: 40,
        tenantId: testTenantId
      }
    });
    testClassroomId = classroom.id;

    // Create test student
    const student = await prisma.student.create({
      data: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        studentId: 'S001',
        dateOfBirth: new Date('2008-05-15'),
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      }
    });
    testStudentId = student.id;

    // Enroll student in class
    await prisma.studentEnrollment.create({
      data: {
        studentId: testStudentId,
        classId: testClassId,
        tenantId: testTenantId
      }
    });

    // Create test attendance session
    const session = await prisma.attendanceSession.create({
      data: {
        sessionId: generateSessionId(),
        date: new Date(),
        dayOfWeek: 1,
        period: 1,
        classId: testClassId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        classroomId: testClassroomId,
        academicYearId: testAcademicYearId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 45 * 60 * 1000),
        totalStudents: 1,
        tenantId: testTenantId
      }
    });
    testSessionId = session.id;

    // Create preliminary attendance
    await prisma.preliminaryAttendance.create({
      data: {
        sessionId: testSessionId,
        studentId: testStudentId,
        tenantId: testTenantId,
        status: 'AI_VERIFIED_PRESENT',
        startRecognized: true,
        middleRecognized: true,
        endRecognized: true,
        overallConfidence: 0.90,
        needsReview: false
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.attendanceAuditTrail.deleteMany({});
    await prisma.preliminaryAttendance.deleteMany({});
    await prisma.checkpointRecord.deleteMany({});
    await prisma.attendanceCheckpoint.deleteMany({});
    await prisma.attendanceRecord.deleteMany({});
    await prisma.attendanceSession.deleteMany({});
    await prisma.studentEnrollment.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.teacher.deleteMany({});
    await prisma.class.deleteMany({});
    await prisma.subject.deleteMany({});
    await prisma.classroom.deleteMany({});
    await prisma.academicYear.deleteMany({});
    await prisma.tenant.deleteMany({});

    await prisma.$disconnect();
  });

  describe('DashboardService', () => {
    describe('getTeacherDashboard', () => {
      it('should retrieve teacher dashboard data', async () => {
        const dashboard = await dashboardService.getTeacherDashboard(
          testSessionId,
          testTeacherId,
          testTenantId
        );

        expect(dashboard).toBeDefined();
        expect(dashboard.session).toBeDefined();
        expect(dashboard.stats).toBeDefined();
        expect(dashboard.students).toBeDefined();
        expect(dashboard.stats.totalStudents).toBe(1);
        expect(dashboard.stats.aiVerifiedPresent).toBe(1);
      });

      it('should reject dashboard for non-existent session', async () => {
        await expect(
          dashboardService.getTeacherDashboard('non-existent-id', testTeacherId, testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject dashboard for different tenant', async () => {
        await expect(
          dashboardService.getTeacherDashboard(testSessionId, testTeacherId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });

      it('should reject dashboard for unauthorized teacher', async () => {
        await expect(
          dashboardService.getTeacherDashboard(testSessionId, 'unauthorized-teacher', testTenantId)
        ).rejects.toThrow('Teacher not authorized for this session');
      });
    });

    describe('getSchoolAdminDashboard', () => {
      it('should retrieve school admin dashboard metrics', async () => {
        const dashboard = await dashboardService.getSchoolAdminDashboard(testTenantId);

        expect(dashboard).toBeDefined();
        expect(dashboard.stats).toBeDefined();
        expect(dashboard.stats.totalStudents).toBe(1);
        expect(dashboard.stats.totalClasses).toBe(1);
        expect(dashboard.stats.totalTeachers).toBe(1);
      });

      it('should reject dashboard for non-existent tenant', async () => {
        await expect(
          dashboardService.getSchoolAdminDashboard('non-existent-id')
        ).rejects.toThrow('Tenant not found');
      });

      it('should filter by academic year when provided', async () => {
        const dashboard = await dashboardService.getSchoolAdminDashboard(testTenantId, testAcademicYearId);

        expect(dashboard).toBeDefined();
        expect(dashboard.stats).toBeDefined();
      });
    });

    describe('getPrincipalDashboard', () => {
      it('should retrieve principal dashboard with high-level views', async () => {
        const dashboard = await dashboardService.getPrincipalDashboard(testTenantId);

        expect(dashboard).toBeDefined();
        expect(dashboard.classAttendance).toBeDefined();
        expect(dashboard.sectionAttendance).toBeDefined();
        expect(dashboard.subjectAttendance).toBeDefined();
        expect(dashboard.teacherReviewStats).toBeDefined();
        expect(dashboard.exceptions).toBeDefined();
      });

      it('should reject dashboard for non-existent tenant', async () => {
        await expect(
          dashboardService.getPrincipalDashboard('non-existent-id')
        ).rejects.toThrow('Tenant not found');
      });

      it('should filter by academic year when provided', async () => {
        const dashboard = await dashboardService.getPrincipalDashboard(testTenantId, testAcademicYearId);

        expect(dashboard).toBeDefined();
      });
    });

    describe('getStudentAttendanceHistory', () => {
      it('should retrieve student attendance history', async () => {
        const history = await dashboardService.getStudentAttendanceHistory(
          testStudentId,
          testTenantId
        );

        expect(history).toBeDefined();
        expect(Array.isArray(history)).toBe(true);
        expect(history.length).toBeGreaterThanOrEqual(1);
      });

      it('should reject history for non-existent student', async () => {
        await expect(
          dashboardService.getStudentAttendanceHistory('non-existent-id', testTenantId)
        ).rejects.toThrow('Student not found');
      });

      it('should reject history for different tenant', async () => {
        await expect(
          dashboardService.getStudentAttendanceHistory(testStudentId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Student belongs to different tenant');
      });

      it('should filter by date range when provided', async () => {
        const history = await dashboardService.getStudentAttendanceHistory(
          testStudentId,
          testTenantId,
          undefined,
          new Date('2024-01-01'),
          new Date('2024-12-31')
        );

        expect(history).toBeDefined();
        expect(Array.isArray(history)).toBe(true);
      });

      it('should filter by academic year when provided', async () => {
        const history = await dashboardService.getStudentAttendanceHistory(
          testStudentId,
          testTenantId,
          testAcademicYearId
        );

        expect(history).toBeDefined();
        expect(Array.isArray(history)).toBe(true);
      });
    });

    describe('exportAttendanceAsCSV', () => {
      it('should export attendance as CSV', async () => {
        const csvContent = await dashboardService.exportAttendanceAsCSV(testSessionId, testTenantId, testTeacherId);

        expect(csvContent).toBeDefined();
        expect(typeof csvContent).toBe('string');
        expect(csvContent).toContain('Student ID');
        expect(csvContent).toContain('Student Name');
        expect(csvContent).toContain('AI Status');
      });

      it('should reject export for non-existent session', async () => {
        await expect(
          dashboardService.exportAttendanceAsCSV('non-existent-id', testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject export for different tenant', async () => {
        await expect(
          dashboardService.exportAttendanceAsCSV(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('getFilteredAttendance', () => {
      it('should retrieve filtered attendance records', async () => {
        const attendances = await dashboardService.getFilteredAttendance(testTenantId, {
          classId: testClassId
        });

        expect(attendances).toBeDefined();
        expect(Array.isArray(attendances)).toBe(true);
      });

      it('should filter by subject', async () => {
        const attendances = await dashboardService.getFilteredAttendance(testTenantId, {
          subjectId: testSubjectId
        });

        expect(attendances).toBeDefined();
        expect(Array.isArray(attendances)).toBe(true);
      });

      it('should filter by teacher', async () => {
        const attendances = await dashboardService.getFilteredAttendance(testTenantId, {
          teacherId: testTeacherId
        });

        expect(attendances).toBeDefined();
        expect(Array.isArray(attendances)).toBe(true);
      });

      it('should filter by date range', async () => {
        const attendances = await dashboardService.getFilteredAttendance(testTenantId, {
          dateFrom: new Date('2024-01-01'),
          dateTo: new Date('2024-12-31')
        });

        expect(attendances).toBeDefined();
        expect(Array.isArray(attendances)).toBe(true);
      });

      it('should filter by status', async () => {
        const attendances = await dashboardService.getFilteredAttendance(testTenantId, {
          status: 'AI_VERIFIED_PRESENT'
        });

        expect(attendances).toBeDefined();
        expect(Array.isArray(attendances)).toBe(true);
      });

      it('should apply multiple filters', async () => {
        const attendances = await dashboardService.getFilteredAttendance(testTenantId, {
          classId: testClassId,
          subjectId: testSubjectId,
          teacherId: testTeacherId
        });

        expect(attendances).toBeDefined();
        expect(Array.isArray(attendances)).toBe(true);
      });
    });
  });
});
