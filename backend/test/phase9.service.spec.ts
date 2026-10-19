import { PrismaClient } from '@prisma/client';
import { TeacherReviewService } from '../src/modules/teacherReview/teacherReview.service';

const prisma = new PrismaClient();
const teacherReviewService = new TeacherReviewService();

// Helper to generate unique session IDs
let sessionCounter = 1;
const generateSessionId = () => `SESSION-${sessionCounter++}-${Date.now()}`;

describe('Phase 9: Teacher Review / Override / Audit', () => {
  let testTenantId: string;
  let testAcademicYearId: string;
  let testClassId: string;
  let testSubjectId: string;
  let testTeacherId: string;
  let testClassroomId: string;
  let testStudentId: string;
  let testSessionId: string;
  let testPreliminaryAttendanceId: string;

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
        slug: 'test-school-phase9',
        schemaName: 'test_school_phase9',
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
        sessionId: 'SESSION-001',
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
    const preliminaryAttendance = await prisma.preliminaryAttendance.create({
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
    testPreliminaryAttendanceId = preliminaryAttendance.id;
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

  describe('TeacherReviewService', () => {
    describe('acceptAttendance', () => {
      it('should accept AI-generated attendance', async () => {
        const result = await teacherReviewService.acceptAttendance(
          testPreliminaryAttendanceId,
          testTeacherId,
          testTenantId,
          'Student confirmed present'
        );

        expect(result).toBeDefined();
        expect(result.reviewedBy).toBe(testTeacherId);
        expect(result.reviewedAt).toBeDefined();
        expect(result.finalStatus).toBe('AI_VERIFIED_PRESENT');
        expect(result.notes).toBe('Student confirmed present');
      });

      it('should create audit trail on accept', async () => {
        await teacherReviewService.acceptAttendance(
          testPreliminaryAttendanceId,
          testTeacherId,
          testTenantId
        );

        const auditTrails = await prisma.attendanceAuditTrail.findMany({
          where: { preliminaryAttendanceId: testPreliminaryAttendanceId }
        });

        expect(auditTrails.length).toBeGreaterThan(0);
        expect(auditTrails[0].changeReason).toBe('Teacher accepted AI result');
        expect(auditTrails[0].changedBy).toBe(testTeacherId);
      });

      it('should reject accept for non-existent attendance', async () => {
        await expect(
          teacherReviewService.acceptAttendance('non-existent-id', testTeacherId, testTenantId)
        ).rejects.toThrow('Preliminary attendance not found');
      });

      it('should reject accept for different tenant', async () => {
        await expect(
          teacherReviewService.acceptAttendance(testPreliminaryAttendanceId, testTeacherId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Attendance belongs to different tenant');
      });

      it('should reject accept for unauthorized teacher', async () => {
        const unauthorizedTeacherId = 'unauthorized-teacher-id';
        await expect(
          teacherReviewService.acceptAttendance(testPreliminaryAttendanceId, unauthorizedTeacherId, testTenantId)
        ).rejects.toThrow('Teacher not authorized to review this attendance');
      });

      it('should reject accept for already confirmed attendance', async () => {
        // Mark as confirmed
        await prisma.preliminaryAttendance.update({
          where: { id: testPreliminaryAttendanceId },
          data: { isConfirmed: true }
        });

        await expect(
          teacherReviewService.acceptAttendance(testPreliminaryAttendanceId, testTeacherId, testTenantId)
        ).rejects.toThrow('Attendance already confirmed');
      });
    });

    describe('overrideAttendance', () => {
      let testPreliminaryAttendanceId2: string;
      let testSessionId2: string;

      beforeEach(async () => {
        // Create a new session for override tests with unique sessionId
        const session2 = await prisma.attendanceSession.create({
          data: {
            sessionId: generateSessionId(),
            date: new Date(),
            dayOfWeek: 1,
            period: 3,
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
        testSessionId2 = session2.id;

        // Create a new preliminary attendance for override tests
        const pa = await prisma.preliminaryAttendance.create({
          data: {
            sessionId: testSessionId2,
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
        testPreliminaryAttendanceId2 = pa.id;
      });

      it('should override AI-generated attendance with reason', async () => {
        const result = await teacherReviewService.overrideAttendance(
          testPreliminaryAttendanceId2,
          testTeacherId,
          'ABSENT',
          'Student was sick',
          testTenantId,
          'Medical leave'
        );

        expect(result).toBeDefined();
        expect(result.finalStatus).toBe('ABSENT');
        expect(result.reviewedBy).toBe(testTeacherId);
      });

      it('should require reason for override', async () => {
        await expect(
          teacherReviewService.overrideAttendance(
            testPreliminaryAttendanceId2,
            testTeacherId,
            'ABSENT',
            '',
            testTenantId
          )
        ).rejects.toThrow('Override reason is required');
      });

      it('should create audit trail on override', async () => {
        await teacherReviewService.overrideAttendance(
          testPreliminaryAttendanceId2,
          testTeacherId,
          'ABSENT',
          'Student was sick',
          testTenantId
        );

        const auditTrails = await prisma.attendanceAuditTrail.findMany({
          where: { preliminaryAttendanceId: testPreliminaryAttendanceId2 }
        });

        expect(auditTrails.length).toBeGreaterThan(0);
        expect(auditTrails[0].changeReason).toBe('Student was sick');
        expect(auditTrails[0].changeSource).toBe('TEACHER_OVERRIDE');
        expect(auditTrails[0].previousStatus).toBe('AI_VERIFIED_PRESENT');
        expect(auditTrails[0].newStatus).toBe('ABSENT');
      });

      it('should reject override for non-existent attendance', async () => {
        await expect(
          teacherReviewService.overrideAttendance('non-existent-id', testTeacherId, 'ABSENT', 'reason', testTenantId)
        ).rejects.toThrow('Preliminary attendance not found');
      });

      it('should reject override for different tenant', async () => {
        await expect(
          teacherReviewService.overrideAttendance(testPreliminaryAttendanceId2, testTeacherId, 'ABSENT', 'reason', 'different-tenant-id')
        ).rejects.toThrow('Access denied: Attendance belongs to different tenant');
      });

      it('should reject override for already confirmed attendance', async () => {
        await prisma.preliminaryAttendance.update({
          where: { id: testPreliminaryAttendanceId2 },
          data: { isConfirmed: true }
        });

        await expect(
          teacherReviewService.overrideAttendance(testPreliminaryAttendanceId2, testTeacherId, 'ABSENT', 'reason', testTenantId)
        ).rejects.toThrow('Attendance already confirmed');
      });
    });

    describe('confirmSessionAttendance', () => {
      it('should confirm session attendance', async () => {
        const result = await teacherReviewService.confirmSessionAttendance(
          testSessionId,
          testTeacherId,
          testTenantId
        );

        expect(result).toBeDefined();
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].isConfirmed).toBe(true);
        expect(result[0].confirmedBy).toBe(testTeacherId);
        expect(result[0].confirmedAt).toBeDefined();
      });

      it('should reject confirmation for session with unreviewed students', async () => {
        // Create a new session with unreviewed attendance
        const session2 = await prisma.attendanceSession.create({
          data: {
            sessionId: generateSessionId(),
            date: new Date(),
            dayOfWeek: 1,
            period: 2,
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

        await prisma.preliminaryAttendance.create({
          data: {
            sessionId: session2.id,
            studentId: testStudentId,
            tenantId: testTenantId,
            status: 'ATTENDANCE_EXCEPTION',
            startRecognized: true,
            middleRecognized: false,
            endRecognized: true,
            needsReview: true
          }
        });

        await expect(
          teacherReviewService.confirmSessionAttendance(session2.id, testTeacherId, testTenantId)
        ).rejects.toThrow('Cannot confirm session');
      });

      it('should reject confirmation for non-existent session', async () => {
        await expect(
          teacherReviewService.confirmSessionAttendance('non-existent-id', testTeacherId, testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject confirmation for different tenant', async () => {
        await expect(
          teacherReviewService.confirmSessionAttendance(testSessionId, testTeacherId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('getAuditTrailForStudent', () => {
      it('should retrieve audit trail for student', async () => {
        const auditTrails = await teacherReviewService.getAuditTrailForStudent(testStudentId, testTenantId);

        expect(auditTrails).toBeDefined();
        expect(Array.isArray(auditTrails)).toBe(true);
      });

      it('should reject retrieval for non-existent student', async () => {
        await expect(
          teacherReviewService.getAuditTrailForStudent('non-existent-id', testTenantId)
        ).rejects.toThrow('Student not found');
      });

      it('should reject retrieval for different tenant', async () => {
        await expect(
          teacherReviewService.getAuditTrailForStudent(testStudentId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Student belongs to different tenant');
      });
    });

    describe('getAuditTrailForSession', () => {
      it('should retrieve audit trail for session', async () => {
        const auditTrails = await teacherReviewService.getAuditTrailForSession(testSessionId, testTenantId);

        expect(auditTrails).toBeDefined();
        expect(Array.isArray(auditTrails)).toBe(true);
      });

      it('should reject retrieval for non-existent session', async () => {
        await expect(
          teacherReviewService.getAuditTrailForSession('non-existent-id', testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject retrieval for different tenant', async () => {
        await expect(
          teacherReviewService.getAuditTrailForSession(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('getReviewDashboard', () => {
      it('should retrieve review dashboard data', async () => {
        const dashboard = await teacherReviewService.getReviewDashboard(testSessionId, testTenantId);

        expect(dashboard).toBeDefined();
        expect(dashboard.session).toBeDefined();
        expect(dashboard.stats).toBeDefined();
        expect(dashboard.students).toBeDefined();
        expect(dashboard.stats.totalStudents).toBeGreaterThanOrEqual(1);
      });

      it('should reject dashboard for non-existent session', async () => {
        await expect(
          teacherReviewService.getReviewDashboard('non-existent-id', testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject dashboard for different tenant', async () => {
        await expect(
          teacherReviewService.getReviewDashboard(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('bulkAcceptAttendance', () => {
      let testSessionId3: string;

      beforeEach(async () => {
        // Create a new session for bulk accept tests with unique sessionId
        const session3 = await prisma.attendanceSession.create({
          data: {
            sessionId: generateSessionId(),
            date: new Date(),
            dayOfWeek: 1,
            period: 4,
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
        testSessionId3 = session3.id;

        // Create preliminary attendance
        await prisma.preliminaryAttendance.create({
          data: {
            sessionId: testSessionId3,
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

      it('should bulk accept attendance for session', async () => {
        const result = await teacherReviewService.bulkAcceptAttendance(
          testSessionId3,
          testTeacherId,
          testTenantId,
          'Bulk confirmed'
        );

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
      });

      it('should reject bulk accept for non-existent session', async () => {
        await expect(
          teacherReviewService.bulkAcceptAttendance('non-existent-id', testTeacherId, testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject bulk accept for different tenant', async () => {
        await expect(
          teacherReviewService.bulkAcceptAttendance(testSessionId, testTeacherId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });
  });
});
