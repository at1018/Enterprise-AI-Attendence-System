import { PrismaClient, CheckpointType, PreliminaryAttendanceStatus, CheckpointStatus } from '@prisma/client';
import { CheckpointAttendanceService } from '../src/modules/checkpointAttendance/checkpointAttendance.service';

const prisma = new PrismaClient();
const checkpointAttendanceService = new CheckpointAttendanceService();

describe('Phase 8: Three-Checkpoint Automated Attendance', () => {
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
        slug: 'test-school-phase8',
        schemaName: 'test_school_phase8',
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
  });

  afterAll(async () => {
    // Clean up test data
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

  describe('CheckpointAttendanceService', () => {
    describe('createCheckpointsForSession', () => {
      it('should create three checkpoints for a session', async () => {
        const checkpoints = await checkpointAttendanceService.createCheckpointsForSession(
          testSessionId,
          testTenantId
        );

        expect(checkpoints).toBeDefined();
        expect(checkpoints).toHaveLength(3);
        expect(checkpoints[0].checkpointType).toBe(CheckpointType.START);
        expect(checkpoints[1].checkpointType).toBe(CheckpointType.MIDDLE);
        expect(checkpoints[2].checkpointType).toBe(CheckpointType.END);
      });

      it('should reject checkpoint creation for non-existent session', async () => {
        await expect(
          checkpointAttendanceService.createCheckpointsForSession('non-existent-id', testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject checkpoint creation for different tenant', async () => {
        await expect(
          checkpointAttendanceService.createCheckpointsForSession(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('completeCheckpoint', () => {
      let startCheckpointId: string;

      beforeEach(async () => {
        // Clean up existing checkpoints
        await prisma.checkpointRecord.deleteMany({});
        await prisma.attendanceCheckpoint.deleteMany({});

        // Create checkpoints first
        const checkpoints = await checkpointAttendanceService.createCheckpointsForSession(
          testSessionId,
          testTenantId
        );
        startCheckpointId = checkpoints[0].id;
      });

      it('should complete a checkpoint with recognition results', async () => {
        const recognitionResults = [
          {
            studentId: testStudentId,
            recognized: true,
            confidence: 0.95,
            faceQuality: 0.88
          }
        ];

        const result = await checkpointAttendanceService.completeCheckpoint(
          startCheckpointId,
          'DEVICE-001',
          recognitionResults,
          testTenantId
        );

        expect(result).toBeDefined();
        expect(result.checkpoint.status).toBe(CheckpointStatus.COMPLETED);
        expect(result.checkpoint.recognizedCount).toBe(1);
        expect(result.records).toHaveLength(1);
        expect(result.records[0].recognized).toBe(true);
      });

      it('should handle unrecognized students', async () => {
        const recognitionResults = [
          {
            studentId: testStudentId,
            recognized: false,
            confidence: 0.30,
            faceQuality: 0.45
          }
        ];

        const result = await checkpointAttendanceService.completeCheckpoint(
          startCheckpointId,
          'DEVICE-001',
          recognitionResults,
          testTenantId
        );

        expect(result.checkpoint.unknownCount).toBe(1);
        expect(result.records[0].recognized).toBe(false);
      });

      it('should track low confidence recognitions', async () => {
        const recognitionResults = [
          {
            studentId: testStudentId,
            recognized: true,
            confidence: 0.55,
            faceQuality: 0.60
          }
        ];

        const result = await checkpointAttendanceService.completeCheckpoint(
          startCheckpointId,
          'DEVICE-001',
          recognitionResults,
          testTenantId
        );

        expect(result.checkpoint.lowConfidenceCount).toBeGreaterThan(0);
      });

      it('should reject completion for non-existent checkpoint', async () => {
        await expect(
          checkpointAttendanceService.completeCheckpoint(
            'non-existent-id',
            'DEVICE-001',
            [],
            testTenantId
          )
        ).rejects.toThrow('Checkpoint not found');
      });

      it('should reject completion for different tenant', async () => {
        await expect(
          checkpointAttendanceService.completeCheckpoint(
            startCheckpointId,
            'DEVICE-001',
            [],
            'different-tenant-id'
          )
        ).rejects.toThrow('Access denied: Checkpoint belongs to different tenant');
      });
    });

    describe('calculatePreliminaryAttendance', () => {
      let allCheckpointIds: string[];

      beforeAll(async () => {
        // Clean up existing checkpoints
        await prisma.checkpointRecord.deleteMany({});
        await prisma.attendanceCheckpoint.deleteMany({});

        // Create new checkpoints
        const checkpoints = await checkpointAttendanceService.createCheckpointsForSession(
          testSessionId,
          testTenantId
        );
        allCheckpointIds = checkpoints.map((cp: any) => cp.id);

        // Complete all checkpoints with recognition results
        for (const checkpointId of allCheckpointIds) {
          await checkpointAttendanceService.completeCheckpoint(
            checkpointId,
            'DEVICE-001',
            [{
              studentId: testStudentId,
              recognized: true,
              confidence: 0.90,
              faceQuality: 0.85
            }],
            testTenantId
          );
        }
      });

      it('should calculate preliminary attendance for all checkpoints recognized', async () => {
        const preliminaryAttendances = await checkpointAttendanceService.calculatePreliminaryAttendance(
          testSessionId,
          testTenantId
        );

        expect(preliminaryAttendances).toBeDefined();
        expect(preliminaryAttendances).toHaveLength(1);
        expect(preliminaryAttendances[0].startRecognized).toBe(true);
        expect(preliminaryAttendances[0].middleRecognized).toBe(true);
        expect(preliminaryAttendances[0].endRecognized).toBe(true);
        expect(preliminaryAttendances[0].status).toBe(PreliminaryAttendanceStatus.AI_VERIFIED_PRESENT);
        expect(preliminaryAttendances[0].needsReview).toBe(false);
      });

      it('should mark as needs review for low confidence', async () => {
        // Create a new session for this test
        const sessionLow = await prisma.attendanceSession.create({
          data: {
            sessionId: 'SESSION-LOW-CONF',
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

        const checkpointsLow = await checkpointAttendanceService.createCheckpointsForSession(
          sessionLow.id,
          testTenantId
        );

        // Complete a checkpoint with low confidence
        await checkpointAttendanceService.completeCheckpoint(
          checkpointsLow[0].id,
          'DEVICE-001',
          [{
            studentId: testStudentId,
            recognized: true,
            confidence: 0.70,
            faceQuality: 0.65
          }],
          testTenantId
        );

        // Complete other checkpoints with high confidence
        await checkpointAttendanceService.completeCheckpoint(
          checkpointsLow[1].id,
          'DEVICE-001',
          [{ studentId: testStudentId, recognized: true, confidence: 0.90, faceQuality: 0.85 }],
          testTenantId
        );
        await checkpointAttendanceService.completeCheckpoint(
          checkpointsLow[2].id,
          'DEVICE-001',
          [{ studentId: testStudentId, recognized: true, confidence: 0.90, faceQuality: 0.85 }],
          testTenantId
        );

        const preliminaryAttendances = await checkpointAttendanceService.calculatePreliminaryAttendance(
          sessionLow.id,
          testTenantId
        );

        expect(preliminaryAttendances[0].overallConfidence).toBeLessThan(0.85);
        expect(preliminaryAttendances[0].needsReview).toBe(true);
      });

      it('should flag attendance exception for missing checkpoints', async () => {
        // Create a new session and only complete 2 checkpoints
        const session2 = await prisma.attendanceSession.create({
          data: {
            sessionId: 'SESSION-002',
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

        const checkpoints2 = await checkpointAttendanceService.createCheckpointsForSession(
          session2.id,
          testTenantId
        );

        // Only complete 2 out of 3 checkpoints
        await checkpointAttendanceService.completeCheckpoint(
          checkpoints2[0].id,
          'DEVICE-001',
          [{ studentId: testStudentId, recognized: true, confidence: 0.90, faceQuality: 0.85 }],
          testTenantId
        );
        await checkpointAttendanceService.completeCheckpoint(
          checkpoints2[1].id,
          'DEVICE-001',
          [{ studentId: testStudentId, recognized: true, confidence: 0.90, faceQuality: 0.85 }],
          testTenantId
        );

        const preliminaryAttendances = await checkpointAttendanceService.calculatePreliminaryAttendance(
          session2.id,
          testTenantId
        );

        expect(preliminaryAttendances[0].status).toBe(PreliminaryAttendanceStatus.ATTENDANCE_EXCEPTION);
        expect(preliminaryAttendances[0].needsReview).toBe(true);
        expect(preliminaryAttendances[0].exceptionReason).toContain('2/3');
      });

      it('should flag insufficient evidence for no checkpoints recognized', async () => {
        const session3 = await prisma.attendanceSession.create({
          data: {
            sessionId: 'SESSION-003',
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

        const checkpoints3 = await checkpointAttendanceService.createCheckpointsForSession(
          session3.id,
          testTenantId
        );

        // Complete all checkpoints but student not recognized
        for (const checkpointId of checkpoints3.map((cp: any) => cp.id)) {
          await checkpointAttendanceService.completeCheckpoint(
            checkpointId,
            'DEVICE-001',
            [{ studentId: testStudentId, recognized: false, confidence: 0.30, faceQuality: 0.40 }],
            testTenantId
          );
        }

        const preliminaryAttendances = await checkpointAttendanceService.calculatePreliminaryAttendance(
          session3.id,
          testTenantId
        );

        expect(preliminaryAttendances[0].status).toBe(PreliminaryAttendanceStatus.INSUFFICIENT_EVIDENCE);
        expect(preliminaryAttendances[0].needsReview).toBe(true);
      });

      it('should reject calculation for non-existent session', async () => {
        await expect(
          checkpointAttendanceService.calculatePreliminaryAttendance('non-existent-id', testTenantId)
        ).rejects.toThrow('Attendance session not found');
      });

      it('should reject calculation for different tenant', async () => {
        await expect(
          checkpointAttendanceService.calculatePreliminaryAttendance(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('getCheckpointRecords', () => {
      it('should retrieve checkpoint records for a session', async () => {
        const checkpoints = await checkpointAttendanceService.getCheckpointRecords(
          testSessionId,
          testTenantId
        );

        expect(checkpoints).toBeDefined();
        expect(checkpoints.length).toBeGreaterThanOrEqual(3);
      });

      it('should reject retrieval for different tenant', async () => {
        await expect(
          checkpointAttendanceService.getCheckpointRecords(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('getPreliminaryAttendance', () => {
      it('should retrieve preliminary attendance for a session', async () => {
        const preliminaryAttendances = await checkpointAttendanceService.getPreliminaryAttendance(
          testSessionId,
          testTenantId
        );

        expect(preliminaryAttendances).toBeDefined();
        expect(preliminaryAttendances.length).toBeGreaterThanOrEqual(1);
      });

      it('should reject retrieval for different tenant', async () => {
        await expect(
          checkpointAttendanceService.getPreliminaryAttendance(testSessionId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Session belongs to different tenant');
      });
    });

    describe('getPreliminaryAttendanceByStudent', () => {
      it('should retrieve preliminary attendance for a student', async () => {
        const preliminaryAttendances = await checkpointAttendanceService.getPreliminaryAttendanceByStudent(
          testStudentId,
          testTenantId
        );

        expect(preliminaryAttendances).toBeDefined();
        expect(preliminaryAttendances.length).toBeGreaterThanOrEqual(1);
      });

      it('should reject retrieval for different tenant', async () => {
        await expect(
          checkpointAttendanceService.getPreliminaryAttendanceByStudent(testStudentId, 'different-tenant-id')
        ).rejects.toThrow('Access denied: Student belongs to different tenant');
      });
    });

    describe('markAsReviewed', () => {
      let preliminaryAttendanceId: string;

      beforeAll(async () => {
        // Ensure we have a preliminary attendance record
        const preliminaryAttendances = await checkpointAttendanceService.calculatePreliminaryAttendance(
          testSessionId,
          testTenantId
        );
        preliminaryAttendanceId = preliminaryAttendances[0].id;
      });

      it('should mark preliminary attendance as reviewed', async () => {
        const updated = await checkpointAttendanceService.markAsReviewed(
          preliminaryAttendanceId,
          'USER-001',
          'PRESENT',
          testTenantId
        );

        expect(updated).toBeDefined();
        expect(updated.reviewedBy).toBe('USER-001');
        expect(updated.finalStatus).toBe('PRESENT');
        expect(updated.needsReview).toBe(false);
        expect(updated.reviewedAt).toBeDefined();
      });

      it('should reject marking for non-existent preliminary attendance', async () => {
        await expect(
          checkpointAttendanceService.markAsReviewed('non-existent-id', 'USER-001', 'PRESENT', testTenantId)
        ).rejects.toThrow('Preliminary attendance not found');
      });

      it('should reject marking for different tenant', async () => {
        await expect(
          checkpointAttendanceService.markAsReviewed(preliminaryAttendanceId, 'USER-001', 'PRESENT', 'different-tenant-id')
        ).rejects.toThrow('Access denied: Preliminary attendance belongs to different tenant');
      });
    });

    describe('getSessionsNeedingReview', () => {
      it('should retrieve sessions needing review', async () => {
        const sessions = await checkpointAttendanceService.getSessionsNeedingReview(testTenantId);

        expect(sessions).toBeDefined();
        expect(Array.isArray(sessions)).toBe(true);
      });
    });
  });
});
