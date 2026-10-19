import { PrismaClient } from '@prisma/client';
import { ClassroomService } from '../src/modules/classrooms/classroom.service';
import { CameraService } from '../src/modules/cameras/camera.service';
import { TimetableService } from '../src/modules/timetable/timetable.service';

describe('Phase 4: Classroom / Camera / Timetable Services', () => {
  let prisma: PrismaClient;
  let classroomService: ClassroomService;
  let cameraService: CameraService;
  let timetableService: TimetableService;
  let testTenantId: string;
  let testClassroomId: string;
  let testCameraId: string;
  let testTimetableEntryId: string;
  let testAcademicYearId: string;
  let testClassEntityId: string;
  let testSubjectId: string;
  let testTeacherId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    classroomService = new ClassroomService(prisma);
    cameraService = new CameraService(prisma);
    timetableService = new TimetableService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Phase 4 Test School',
        slug: 'phase4-test-school',
        schemaName: 'school_phase4_test',
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
    testClassEntityId = classData.id;

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
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.timetableEntry.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.camera.deleteMany({
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

  describe('ClassroomService', () => {
    it('should create a classroom', async () => {
      const classroom = await classroomService.createClassroom({
        name: 'Room 101',
        building: 'Main Building',
        floor: '1',
        capacity: 40,
        description: 'Science classroom',
        tenantId: testTenantId
      });

      expect(classroom).toBeDefined();
      expect(classroom.name).toBe('Room 101');
      expect(classroom.building).toBe('Main Building');
      expect(classroom.tenantId).toBe(testTenantId);
      testClassroomId = classroom.id;
    });

    it('should get classroom by ID', async () => {
      const classroom = await classroomService.getClassroomById(testClassroomId, testTenantId);

      expect(classroom).toBeDefined();
      expect(classroom.id).toBe(testClassroomId);
      expect(classroom.name).toBe('Room 101');
    });

    it('should get all classrooms for tenant', async () => {
      const classrooms = await classroomService.getClassroomsByTenant(testTenantId);

      expect(classrooms).toBeDefined();
      expect(classrooms.length).toBeGreaterThan(0);
      expect(classrooms[0].tenantId).toBe(testTenantId);
    });

    it('should update classroom', async () => {
      const classroom = await classroomService.updateClassroom(
        testClassroomId,
        { capacity: 50 },
        testTenantId
      );

      expect(classroom).toBeDefined();
      expect(classroom.capacity).toBe(50);
    });

    it('should reject classroom from different tenant', async () => {
      await expect(
        classroomService.getClassroomById(testClassroomId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Classroom belongs to different tenant');
    });
  });

  describe('CameraService', () => {
    it('should create a camera', async () => {
      const camera = await cameraService.createCamera({
        name: 'Camera 1',
        cameraId: 'CAM001',
        ipAddress: '192.168.1.100',
        port: 8080,
        rtspUrl: 'rtsp://192.168.1.100:8080/stream',
        resolution: '1920x1080',
        fps: 30,
        classroomId: testClassroomId,
        tenantId: testTenantId
      });

      expect(camera).toBeDefined();
      expect(camera.name).toBe('Camera 1');
      expect(camera.cameraId).toBe('CAM001');
      expect(camera.tenantId).toBe(testTenantId);
      testCameraId = camera.id;
    });

    it('should reject duplicate camera ID', async () => {
      await expect(
        cameraService.createCamera({
          name: 'Camera 2',
          cameraId: 'CAM001',
          tenantId: testTenantId
        })
      ).rejects.toThrow('Camera with this ID already exists');
    });

    it('should get camera by ID', async () => {
      const camera = await cameraService.getCameraById(testCameraId, testTenantId);

      expect(camera).toBeDefined();
      expect(camera.id).toBe(testCameraId);
      expect(camera.cameraId).toBe('CAM001');
    });

    it('should get cameras by tenant', async () => {
      const cameras = await cameraService.getCamerasByTenant(testTenantId);

      expect(cameras).toBeDefined();
      expect(cameras.length).toBeGreaterThan(0);
      expect(cameras[0].tenantId).toBe(testTenantId);
    });

    it('should get cameras by classroom', async () => {
      const cameras = await cameraService.getCamerasByTenant(testTenantId, testClassroomId);

      expect(cameras).toBeDefined();
      expect(cameras.length).toBeGreaterThan(0);
      expect(cameras[0].classroomId).toBe(testClassroomId);
    });

    it('should update camera', async () => {
      const camera = await cameraService.updateCamera(
        testCameraId,
        { fps: 25 },
        testTenantId
      );

      expect(camera).toBeDefined();
      expect(camera.fps).toBe(25);
    });

    it('should reject camera from different tenant', async () => {
      await expect(
        cameraService.getCameraById(testCameraId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Camera belongs to different tenant');
    });
  });

  describe('TimetableService', () => {
    it('should create a timetable entry', async () => {
      const timetableEntry = await timetableService.createTimetableEntry({
        dayOfWeek: 1, // Monday
        period: 1,
        startTime: '09:00',
        endTime: '09:45',
        classId: testClassEntityId,
        subjectId: testSubjectId,
        teacherId: testTeacherId,
        classroomId: testClassroomId,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      });

      expect(timetableEntry).toBeDefined();
      expect(timetableEntry.dayOfWeek).toBe(1);
      expect(timetableEntry.period).toBe(1);
      expect(timetableEntry.tenantId).toBe(testTenantId);
      testTimetableEntryId = timetableEntry.id;
    });

    it('should reject invalid day of week', async () => {
      await expect(
        timetableService.createTimetableEntry({
          dayOfWeek: 7, // Invalid
          period: 1,
          startTime: '09:00',
          endTime: '09:45',
          classId: testClassEntityId,
          subjectId: testSubjectId,
          teacherId: testTeacherId,
          classroomId: testClassroomId,
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Day of week must be between 0 (Sunday) and 6 (Saturday)');
    });

    it('should reject invalid time format', async () => {
      await expect(
        timetableService.createTimetableEntry({
          dayOfWeek: 1,
          period: 1,
          startTime: 'invalid',
          endTime: '09:45',
          classId: testClassEntityId,
          subjectId: testSubjectId,
          teacherId: testTeacherId,
          classroomId: testClassroomId,
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Time must be in HH:MM format');
    });

    it('should reject duplicate timetable entry', async () => {
      await expect(
        timetableService.createTimetableEntry({
          dayOfWeek: 1,
          period: 1,
          startTime: '09:00',
          endTime: '09:45',
          classId: testClassEntityId,
          subjectId: testSubjectId,
          teacherId: testTeacherId,
          classroomId: testClassroomId,
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Timetable entry already exists for this day, period, and class');
    });

    it('should get timetable entry by ID', async () => {
      const timetableEntry = await timetableService.getTimetableEntryById(testTimetableEntryId, testTenantId);

      expect(timetableEntry).toBeDefined();
      expect(timetableEntry.id).toBe(testTimetableEntryId);
      expect(timetableEntry.dayOfWeek).toBe(1);
    });

    it('should get timetable by class', async () => {
      const timetableEntries = await timetableService.getTimetableByClass(testClassEntityId, testTenantId);

      expect(timetableEntries).toBeDefined();
      expect(timetableEntries.length).toBeGreaterThan(0);
      expect(timetableEntries[0].classId).toBe(testClassEntityId);
    });

    it('should get timetable by teacher', async () => {
      const timetableEntries = await timetableService.getTimetableByTeacher(testTeacherId, testTenantId);

      expect(timetableEntries).toBeDefined();
      expect(timetableEntries.length).toBeGreaterThan(0);
      expect(timetableEntries[0].teacherId).toBe(testTeacherId);
    });

    it('should get timetable by classroom', async () => {
      const timetableEntries = await timetableService.getTimetableByClassroom(testClassroomId, testTenantId);

      expect(timetableEntries).toBeDefined();
      expect(timetableEntries.length).toBeGreaterThan(0);
      expect(timetableEntries[0].classroomId).toBe(testClassroomId);
    });

    it('should update timetable entry', async () => {
      const timetableEntry = await timetableService.updateTimetableEntry(
        testTimetableEntryId,
        { period: 2 },
        testTenantId
      );

      expect(timetableEntry).toBeDefined();
      expect(timetableEntry.period).toBe(2);
    });

    it('should reject timetable entry from different tenant', async () => {
      await expect(
        timetableService.getTimetableEntryById(testTimetableEntryId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Timetable entry belongs to different tenant');
    });
  });
});