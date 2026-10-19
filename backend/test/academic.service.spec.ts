import { PrismaClient } from '@prisma/client';
import { StudentService } from '../src/modules/students/student.service';
import { TeacherService } from '../src/modules/teachers/teacher.service';
import { ClassService } from '../src/modules/classes/class.service';
import { SubjectService } from '../src/modules/subjects/subject.service';
import { AcademicYearService } from '../src/modules/academic/academicYear.service';

describe('Academic Management Services', () => {
  let prisma: PrismaClient;
  let studentService: StudentService;
  let teacherService: TeacherService;
  let classService: ClassService;
  let subjectService: SubjectService;
  let academicYearService: AcademicYearService;
  let testTenantId: string;
  let testAcademicYearId: string;
  let testClassId: string;
  let testSectionId: string;
  let testSubjectId: string;
  let testStudentId: string;
  let testTeacherId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    studentService = new StudentService(prisma);
    teacherService = new TeacherService(prisma);
    classService = new ClassService(prisma);
    subjectService = new SubjectService(prisma);
    academicYearService = new AcademicYearService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Academic Test School',
        slug: 'academic-test-school',
        schemaName: 'school_academic_test',
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
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.studentEnrollment.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.student.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.teacher.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.section.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.class.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.subject.deleteMany({
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

  describe('AcademicYearService', () => {
    it('should create an academic year', async () => {
      const academicYear = await academicYearService.createAcademicYear({
        name: '2025-2026',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        tenantId: testTenantId
      });

      expect(academicYear).toBeDefined();
      expect(academicYear.name).toBe('2025-2026');
      expect(academicYear.tenantId).toBe(testTenantId);
      expect(academicYear.isActive).toBe(true);
    });

    it('should reject overlapping academic years', async () => {
      await expect(
        academicYearService.createAcademicYear({
          name: '2024-2025-Overlap',
          startDate: new Date('2024-10-01'),
          endDate: new Date('2025-06-30'),
          tenantId: testTenantId
        })
      ).rejects.toThrow('Academic year overlaps with an existing active academic year');
    });

    it('should get academic year by ID', async () => {
      const academicYear = await academicYearService.getAcademicYearById(testAcademicYearId, testTenantId);

      expect(academicYear).toBeDefined();
      expect(academicYear.id).toBe(testAcademicYearId);
      expect(academicYear.name).toBe('2024-2025');
    });

    it('should get active academic year', async () => {
      const academicYear = await academicYearService.getActiveAcademicYear(testTenantId);

      expect(academicYear).toBeDefined();
      expect(academicYear.id).toBe(testAcademicYearId);
      expect(academicYear.isActive).toBe(true);
    });

    it('should reject academic year from different tenant', async () => {
      await expect(
        academicYearService.getAcademicYearById(testAcademicYearId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Academic year belongs to different tenant');
    });
  });

  describe('ClassService', () => {
    it('should create a class', async () => {
      const classData = await classService.createClass({
        name: 'Grade 10',
        grade: 10,
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      });

      expect(classData).toBeDefined();
      expect(classData.name).toBe('Grade 10');
      expect(classData.grade).toBe(10);
      expect(classData.tenantId).toBe(testTenantId);
      testClassId = classData.id;
    });

    it('should create a section', async () => {
      const section = await classService.createSection({
        name: 'Section A',
        classId: testClassId,
        tenantId: testTenantId
      });

      expect(section).toBeDefined();
      expect(section.name).toBe('Section A');
      expect(section.classId).toBe(testClassId);
      testSectionId = section.id;
    });

    it('should get sections by class', async () => {
      const sections = await classService.getSectionsByClass(testClassId, testTenantId);

      expect(sections).toBeDefined();
      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].classId).toBe(testClassId);
    });

    it('should reject class from different tenant', async () => {
      await expect(
        classService.getClassById(testClassId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Class belongs to different tenant');
    });

    it('should reject section from different tenant', async () => {
      await expect(
        classService.getSectionById(testSectionId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Section belongs to different tenant');
    });
  });

  describe('SubjectService', () => {
    it('should create a subject', async () => {
      const subject = await subjectService.createSubject({
        name: 'Mathematics',
        code: 'MATH101',
        description: 'Advanced Mathematics',
        tenantId: testTenantId
      });

      expect(subject).toBeDefined();
      expect(subject.name).toBe('Mathematics');
      expect(subject.code).toBe('MATH101');
      expect(subject.tenantId).toBe(testTenantId);
      testSubjectId = subject.id;
    });

    it('should reject duplicate subject code', async () => {
      await expect(
        subjectService.createSubject({
          name: 'Physics',
          code: 'MATH101',
          tenantId: testTenantId
        })
      ).rejects.toThrow('Subject with this code already exists in this tenant');
    });

    it('should get subject by ID', async () => {
      const subject = await subjectService.getSubjectById(testSubjectId, testTenantId);

      expect(subject).toBeDefined();
      expect(subject.id).toBe(testSubjectId);
      expect(subject.code).toBe('MATH101');
    });

    it('should get subjects by tenant', async () => {
      const subjects = await subjectService.getSubjectsByTenant(testTenantId);

      expect(subjects).toBeDefined();
      expect(subjects.length).toBeGreaterThan(0);
      expect(subjects[0].tenantId).toBe(testTenantId);
    });

    it('should reject subject from different tenant', async () => {
      await expect(
        subjectService.getSubjectById(testSubjectId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Subject belongs to different tenant');
    });
  });

  describe('StudentService', () => {
    it('should create a student', async () => {
      const student = await studentService.createStudent({
        studentId: 'STU001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '1234567890',
        parentName: 'Jane Doe',
        parentPhone: '0987654321',
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      });

      expect(student).toBeDefined();
      expect(student.studentId).toBe('STU001');
      expect(student.firstName).toBe('John');
      expect(student.tenantId).toBe(testTenantId);
      testStudentId = student.id;
    });

    it('should reject duplicate student ID', async () => {
      await expect(
        studentService.createStudent({
          studentId: 'STU001',
          firstName: 'Jane',
          lastName: 'Smith',
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Student with this ID already exists');
    });

    it('should enroll student in class', async () => {
      const enrollment = await studentService.enrollStudent(
        testStudentId,
        testClassId,
        testTenantId,
        testSectionId
      );

      expect(enrollment).toBeDefined();
      expect(enrollment.studentId).toBe(testStudentId);
      expect(enrollment.classId).toBe(testClassId);
    });

    it('should reject duplicate enrollment', async () => {
      await expect(
        studentService.enrollStudent(
          testStudentId,
          testClassId,
          testTenantId,
          testSectionId
        )
      ).rejects.toThrow('Student is already enrolled in this class/section');
    });

    it('should get student by ID', async () => {
      const student = await studentService.getStudentById(testStudentId, testTenantId);

      expect(student).toBeDefined();
      expect(student.id).toBe(testStudentId);
      expect(student.studentId).toBe('STU001');
    });

    it('should get students by class', async () => {
      const students = await studentService.getStudentsByClass(testClassId, testTenantId);

      expect(students).toBeDefined();
      expect(students.length).toBeGreaterThan(0);
      expect(students[0].student.studentId).toBe('STU001');
    });

    it('should reject student from different tenant', async () => {
      await expect(
        studentService.getStudentById(testStudentId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Student belongs to different tenant');
    });
  });

  describe('TeacherService', () => {
    it('should create a teacher', async () => {
      const teacher = await teacherService.createTeacher({
        teacherId: 'TCH001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        phone: '5551234567',
        qualification: 'M.Sc Mathematics',
        specialization: 'Calculus',
        academicYearId: testAcademicYearId,
        tenantId: testTenantId
      });

      expect(teacher).toBeDefined();
      expect(teacher.teacherId).toBe('TCH001');
      expect(teacher.firstName).toBe('Alice');
      expect(teacher.tenantId).toBe(testTenantId);
      testTeacherId = teacher.id;
    });

    it('should reject duplicate teacher ID', async () => {
      await expect(
        teacherService.createTeacher({
          teacherId: 'TCH001',
          firstName: 'Bob',
          lastName: 'Williams',
          academicYearId: testAcademicYearId,
          tenantId: testTenantId
        })
      ).rejects.toThrow('Teacher with this ID already exists');
    });

    it('should assign teacher to class', async () => {
      const assignment = await teacherService.assignToClass(
        testTeacherId,
        testClassId,
        testTenantId,
        testSectionId
      );

      expect(assignment).toBeDefined();
      expect(assignment.teacherId).toBe(testTeacherId);
      expect(assignment.classId).toBe(testClassId);
    });

    it('should assign teacher to subject', async () => {
      const assignment = await teacherService.assignToSubject(
        testTeacherId,
        testSubjectId,
        testTenantId,
        testClassId,
        testSectionId
      );

      expect(assignment).toBeDefined();
      expect(assignment.teacherId).toBe(testTeacherId);
      expect(assignment.subjectId).toBe(testSubjectId);
    });

    it('should get teacher by ID', async () => {
      const teacher = await teacherService.getTeacherById(testTeacherId, testTenantId);

      expect(teacher).toBeDefined();
      expect(teacher.id).toBe(testTeacherId);
      expect(teacher.teacherId).toBe('TCH001');
    });

    it('should get teachers by tenant', async () => {
      const teachers = await teacherService.getTeachersByTenant(testTenantId);

      expect(teachers).toBeDefined();
      expect(teachers.length).toBeGreaterThan(0);
      expect(teachers[0].tenantId).toBe(testTenantId);
    });

    it('should reject teacher from different tenant', async () => {
      await expect(
        teacherService.getTeacherById(testTeacherId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Teacher belongs to different tenant');
    });
  });
});