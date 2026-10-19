import { PrismaClient } from '@prisma/client';
import { AttendanceSessionService } from '../src/modules/attendance/attendanceSession.service';
import { AttendanceRecordService } from '../src/modules/attendance/attendanceRecord.service';
import { AttendanceEvidenceService } from '../src/modules/attendance/attendanceEvidence.service';

describe('Phase 5: Attendance System Services', () => {
  let prisma: PrismaClient;
  let attendanceSessionService: AttendanceSessionService;
  let attendanceRecordService: AttendanceRecordService;
  let attendanceEvidenceService: AttendanceEvidenceService;
  let testTenantId: string;
  let testSessionId: string;
  let testRecordId: string;
  let testEvidenceId: string;
  let testAcademicYearId: string;
  let testClassId: string;
  let testSubjectId: string;
  let testTeacherId: string;
  let testClassroomId: string;
  let testStudentId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    attendanceSessionService = new AttendanceSessionService(prisma);
    attendanceRecordService = new AttendanceRecordService(prisma);
    attendanceEvidenceService = new AttendanceEvidenceService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Phase 5 Test School',
        slug: 'phase5-test-school',
        schemaName: 'school_phase5_test',
        status: 'ACTIVE',
        configuration: {
          create: {
            maxUsers: 100,
            maxStudents: 1000,
            maxTeachers: 100,
            features: []
          }
        }
      }
    });
    testTenantId = tenant.id;

    // Create a test academic year
    const academicYear = await prisma.academicYear.create({
      data: {
        name: '2024-2025',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        tenantId: testTenantId,
        isActive: true
      }
    });
    testAcademicYearId = academicYear.id;

    // Create a test class
    const classData = await prisma.class.create({
      data: {
        name: 'Grade 10',
        grade: 10,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      }
    });
    testClassId = classData.id;

    // Create a test subject
    const subject = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        tenantId: testTenantId,
        isActive: true
      }
    });
    testSubjectId = subject.id;

    // Create a test teacher
    const teacher = await prisma.teacher.create({
      data: {
        teacherId: 'TCH001',
        firstName: 'Alice',
        lastName: 'Johnson',
        academicYearId: testAcademicYearId,
        tenantId: testTenantId,
        isActive: true
      }
    });
    testTeacherId = teacher.id;

    // Create a test classroom
    const classroom = await prisma.classroom.create({
      data: {
        name: 'Room 101',
        building: 'Main Building',
        floor: '1',
        capacity: 40,
        tenantId: testTenantId,
        isActive: true
      }
    });
    testClassroomId = classroom.id;

    // Create a test student
    const student = await prisma.student.create({
      data: {
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        academicYearId: testAcademicYearId,
        tenantId: testTenantId,
        isActive: true
      }
    });
    testStudentId = student.id;

    // Enroll student in class
    await prisma.studentEnrollment.create({
      data: {
        studentId: testStudentId,
        classId: testClassId,
        tenantId: testTenantId,
        isActive: true
      }
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.attendanceEvidence.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.attendanceRecord.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.attendanceSession.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.studentEnrollment.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.student.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.classroom.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.teacher.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.subject.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.class.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.academicYear.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.tenant.delete({
      where: { id: testTenantId }
    });
    await prisma.$disconnect();
  });

  describe('AttendanceSessionService', () => {
    it('should create an attendance session', async () => {
      const session = await attendanceSessionService.createAttendanceSession({
        sessionId: 'SESSION-2024-09-20-001',
        date: new Date('2024-09-20'),
        dayOfWeek: 5, // Friday
        period: 1,
        classId: testClassId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        classroomId: testClassroomId,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      });

      expect(session).toBeDefined();
      expect(session.sessionId).toBe('SESSION-2024-09-20-001');
      expect(session.status).toBe('SCHEDULED');
      expect(session.totalStudents).toBe(1);
      expect(session.tenantId).toBe(testTenantId);
      testSessionId = session.id;
    });

    it('should reject invalid day of week', async () => {
      await expect(
        attendanceSessionService.createAttendanceSession({
          sessionId: 'SESSION-INVALID',
          date: new Date('2024-09-20'),
          dayOfWeek: 7, // Invalid
          period: 1,
          classId: testClassId,
          subjectId: testSubjectId,
          teacherId: testTeacherId,
          classroomId: testClassroomId,
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    });

    it('should reject duplicate session ID', async () => {
      await expect(
        attendanceSessionService.createAttendanceSession({
          sessionId: 'SESSION-2024-09-20-001',
          date: new Date('2024-09-20'),
          dayOfWeek: 5,
          period: 1,
          classId: testClassId,
          subjectId: testSubjectId,
          teacherId: testTeacherId,
          classroomId: testClassroomId,
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Attendance session with this ID already exists');
    });

    it('should get attendance session by ID', async () => {
      const session = await attendanceSessionService.getAttendanceSessionById(testSessionId, testTenantId);

      expect(session).toBeDefined();
      expect(session.id).toBe(testSessionId);
      expect(session.sessionId).toBe('SESSION-2024-09-20-001');
    });

    it('should start attendance session', async () => {
      const session = await attendanceSessionService.startAttendanceSession(testSessionId, testTenantId);

      expect(session).toBeDefined();
      expect(session.status).toBe('IN_PROGRESS');
      expect(session.startTime).toBeDefined();
    });

    it('should complete attendance session', async () => {
      const session = await attendanceSessionService.completeAttendanceSession(testSessionId, 'user-123', testTenantId);

      expect(session).toBeDefined();
      expect(session.status).toBe('COMPLETED');
      expect(session.isCompleted).toBe(true);
      expect(session.completedAt).toBeDefined();
      expect(session.completedBy).toBe('user-123');
    });

    it('should reject session from different tenant', async () => {
      await expect(
        attendanceSessionService.getAttendanceSessionById(testSessionId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Attendance session belongs to different tenant');
    });
  });

  describe('AttendanceRecordService', () => {
    beforeAll(async () => {
      // Create a new session for record tests
      const session = await attendanceSessionService.createAttendanceSession({
        sessionId: 'SESSION-2024-09-20-002',
        date: new Date('2024-09-20'),
        dayOfWeek: 5,
        period: 2,
        classId: testClassId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        classroomId: testClassroomId,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      });
      testSessionId = session.id;
    });

    it('should create an attendance record', async () => {
      const record = await attendanceRecordService.createAttendanceRecord({
        sessionId: testSessionId,
        studentId: testStudentId,
        status: 'PRESENT',
        markedBy: 'teacher-123',
        isManual: false,
        tenantId: testTenantId
      });

      expect(record).toBeDefined();
      expect(record.status).toBe('PRESENT');
      expect(record.studentId).toBe(testStudentId);
      expect(record.checkInTime).toBeDefined();
      expect(record.tenantId).toBe(testTenantId);
      testRecordId = record.id;
    });

    it('should reject duplicate record', async () => {
      await expect(
        attendanceRecordService.createAttendanceRecord({
          sessionId: testSessionId,
          studentId: testStudentId,
          status: 'ABSENT',
          tenantId: testTenantId
        })
      ).rejects.toThrow('Attendance record already exists for this student in this session');
    });

    it('should get attendance record by ID', async () => {
      const record = await attendanceRecordService.getAttendanceRecordById(testRecordId, testTenantId);

      expect(record).toBeDefined();
      expect(record.id).toBe(testRecordId);
      expect(record.status).toBe('PRESENT');
    });

    it('should get attendance records by session', async () => {
      const records = await attendanceRecordService.getAttendanceRecordsBySession(testSessionId, testTenantId);

      expect(records).toBeDefined();
      expect(records.length).toBeGreaterThan(0);
      expect(records[0].sessionId).toBe(testSessionId);
    });

    it('should update attendance record', async () => {
      const record = await attendanceRecordService.updateAttendanceRecord(
        testRecordId,
        { status: 'LATE', overriddenBy: 'teacher-123', overrideReason: 'Student arrived late' },
        testTenantId
      );

      expect(record).toBeDefined();
      expect(record.status).toBe('LATE');
      expect(record.overriddenBy).toBe('teacher-123');
    });

    it('should reject record from different tenant', async () => {
      await expect(
        attendanceRecordService.getAttendanceRecordById(testRecordId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Attendance record belongs to different tenant');
    });
  });

  describe('AttendanceEvidenceService', () => {
    it('should create attendance evidence', async () => {
      const evidence = await attendanceEvidenceService.createAttendanceEvidence({
        recordId: testRecordId,
        checkpoint: 1,
        imageUrl: 'https://example.com/evidence.jpg',
        faceData: 'encoded-face-data',
        confidence: 0.95,
        cameraId: testClassroomId,
        isMatched: true,
        matchedStudentId: testStudentId,
        tenantId: testTenantId
      });

      expect(evidence).toBeDefined();
      expect(evidence.checkpoint).toBe(1);
      expect(evidence.isMatched).toBe(true);
      expect(evidence.confidence).toBe(0.95);
      expect(evidence.tenantId).toBe(testTenantId);
      testEvidenceId = evidence.id;
    });

    it('should reject invalid checkpoint', async () => {
      await expect(
        attendanceEvidenceService.createAttendanceEvidence({
          recordId: testRecordId,
          checkpoint: 4, // Invalid
          tenantId: testTenantId
        })
      ).rejects.toThrow('Checkpoint must be 1, 2, or 3');
    });

    it('should get attendance evidence by ID', async () => {
      const evidence = await attendanceEvidenceService.getAttendanceEvidenceById(testEvidenceId, testTenantId);

      expect(evidence).toBeDefined();
      expect(evidence.id).toBe(testEvidenceId);
      expect(evidence.checkpoint).toBe(1);
    });

    it('should get evidence by record', async () => {
      const evidences = await attendanceEvidenceService.getEvidenceByRecord(testRecordId, testTenantId);

      expect(evidences).toBeDefined();
      expect(evidences.length).toBeGreaterThan(0);
      expect(evidences[0].recordId).toBe(testRecordId);
    });

    it('should get evidence by checkpoint', async () => {
      const evidences = await attendanceEvidenceService.getEvidenceByCheckpoint(testRecordId, 1, testTenantId);

      expect(evidences).toBeDefined();
      expect(evidences.length).toBeGreaterThan(0);
      expect(evidences[0].checkpoint).toBe(1);
    });

    it('should update attendance evidence', async () => {
      const evidence = await attendanceEvidenceService.updateAttendanceEvidence(
        testEvidenceId,
        { confidence: 0.98 },
        testTenantId
      );

      expect(evidence).toBeDefined();
      expect(evidence.confidence).toBe(0.98);
    });

    it('should reject evidence from different tenant', async () => {
      await expect(
        attendanceEvidenceService.getAttendanceEvidenceById(testEvidenceId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Attendance evidence belongs to different tenant');
    });
  });
});