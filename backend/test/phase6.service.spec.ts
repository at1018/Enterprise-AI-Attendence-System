import { PrismaClient } from '@prisma/client';
import { AttendanceReportService } from '../src/modules/reports/attendanceReport.service';
import { StudentAttendanceSummaryService } from '../src/modules/reports/studentAttendanceSummary.service';
import { ClassAttendanceAnalyticsService } from '../src/modules/reports/classAttendanceAnalytics.service';

describe('Phase 6: Reports & Analytics Services', () => {
  let prisma: PrismaClient;
  let attendanceReportService: AttendanceReportService;
  let studentAttendanceSummaryService: StudentAttendanceSummaryService;
  let classAttendanceAnalyticsService: ClassAttendanceAnalyticsService;
  let testTenantId: string;
  let testReportId: string;
  let testSummaryId: string;
  let testAnalyticsId: string;
  let testAcademicYearId: string;
  let testClassId: string;
  let testStudentId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    attendanceReportService = new AttendanceReportService(prisma);
    studentAttendanceSummaryService = new StudentAttendanceSummaryService(prisma);
    classAttendanceAnalyticsService = new ClassAttendanceAnalyticsService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Phase 6 Test School',
        slug: 'phase6-test-school',
        schemaName: 'school_phase6_test',
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
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.classAttendanceAnalytics.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.studentAttendanceSummary.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.attendanceReport.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.student.deleteMany({
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

  describe('AttendanceReportService', () => {
    it('should create an attendance report', async () => {
      const report = await attendanceReportService.createAttendanceReport({
        reportId: 'REPORT-2024-09-20-001',
        reportType: 'STUDENT_ATTENDANCE',
        title: 'Student Attendance Report',
        description: 'Monthly attendance report',
        generatedBy: 'user-123',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-09-30'),
        filters: { classId: testClassId },
        parameters: { includeExcused: true },
        tenantId: testTenantId
      });

      expect(report).toBeDefined();
      expect(report.reportId).toBe('REPORT-2024-09-20-001');
      expect(report.reportType).toBe('STUDENT_ATTENDANCE');
      expect(report.status).toBe('COMPLETED');
      expect(report.tenantId).toBe(testTenantId);
      testReportId = report.id;
    });

    it('should reject duplicate report ID', async () => {
      await expect(
        attendanceReportService.createAttendanceReport({
          reportId: 'REPORT-2024-09-20-001',
          reportType: 'CLASS_ATTENDANCE',
          title: 'Class Attendance Report',
          generatedBy: 'user-123',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-30'),
          tenantId: testTenantId
        })
      ).rejects.toThrow('Report with this ID already exists');
    });

    it('should get attendance report by ID', async () => {
      const report = await attendanceReportService.getAttendanceReportById(testReportId, testTenantId);

      expect(report).toBeDefined();
      expect(report.id).toBe(testReportId);
      expect(report.reportId).toBe('REPORT-2024-09-20-001');
    });

    it('should get reports by date range', async () => {
      const reports = await attendanceReportService.getReportsByDateRange(
        new Date('2024-01-01'),
        new Date('2025-12-31'),
        testTenantId
      );

      expect(reports).toBeDefined();
      if (reports.length > 0) {
        expect(reports[0].tenantId).toBe(testTenantId);
      }
    });

    it('should reject report from different tenant', async () => {
      await expect(
        attendanceReportService.getAttendanceReportById(testReportId, 'different-tenant-id')
      ).rejects.toThrow('Access denied: Report belongs to different tenant');
    });
  });

  describe('StudentAttendanceSummaryService', () => {
    it('should create student attendance summary', async () => {
      const summary = await studentAttendanceSummaryService.upsertStudentAttendanceSummary({
        studentId: testStudentId,
        academicYearId: testAcademicYearId,
        classId: testClassId,
        totalSessions: 20,
        presentCount: 18,
        absentCount: 1,
        lateCount: 1,
        excusedCount: 0,
        attendancePercentage: 90,
        tenantId: testTenantId
      });

      expect(summary).toBeDefined();
      expect(summary.studentId).toBe(testStudentId);
      expect(summary.attendancePercentage).toBe(90);
      expect(summary.tenantId).toBe(testTenantId);
      testSummaryId = summary.id;
    });

    it('should get student attendance summary', async () => {
      const summary = await studentAttendanceSummaryService.getStudentAttendanceSummary(
        testStudentId,
        testAcademicYearId,
        testTenantId
      );

      expect(summary).toBeDefined();
      expect(summary.id).toBe(testSummaryId);
      expect(summary.studentId).toBe(testStudentId);
    });

    it('should update student attendance summary', async () => {
      const summary = await studentAttendanceSummaryService.upsertStudentAttendanceSummary({
        studentId: testStudentId,
        academicYearId: testAcademicYearId,
        classId: testClassId,
        totalSessions: 25,
        presentCount: 23,
        absentCount: 1,
        lateCount: 1,
        excusedCount: 0,
        attendancePercentage: 92,
        tenantId: testTenantId
      });

      expect(summary).toBeDefined();
      expect(summary.totalSessions).toBe(25);
      expect(summary.attendancePercentage).toBe(92);
    });

    it('should get summaries by class', async () => {
      const summaries = await studentAttendanceSummaryService.getSummariesByClass(
        testClassId,
        testAcademicYearId,
        testTenantId
      );

      expect(summaries).toBeDefined();
      expect(summaries.length).toBeGreaterThan(0);
      expect(summaries[0].classId).toBe(testClassId);
    });

    it('should reject summary from different tenant', async () => {
      await expect(
        studentAttendanceSummaryService.getStudentAttendanceSummary(
          testStudentId,
          testAcademicYearId,
          'different-tenant-id'
        )
      ).rejects.toThrow('Student attendance summary not found');
    });
  });

  describe('ClassAttendanceAnalyticsService', () => {
    it('should create class attendance analytics', async () => {
      const analytics = await classAttendanceAnalyticsService.upsertClassAttendanceAnalytics({
        classId: testClassId,
        academicYearId: testAcademicYearId,
        date: new Date('2024-09-20'),
        totalStudents: 40,
        presentCount: 38,
        absentCount: 1,
        lateCount: 1,
        excusedCount: 0,
        attendancePercentage: 95,
        tenantId: testTenantId
      });

      expect(analytics).toBeDefined();
      expect(analytics.classId).toBe(testClassId);
      expect(analytics.attendancePercentage).toBe(95);
      expect(analytics.tenantId).toBe(testTenantId);
      testAnalyticsId = analytics.id;
    });

    it('should get class analytics by date', async () => {
      const analytics = await classAttendanceAnalyticsService.getClassAttendanceAnalyticsByDate(
        testClassId,
        new Date('2024-09-20'),
        testTenantId
      );

      expect(analytics).toBeDefined();
      expect(analytics.id).toBe(testAnalyticsId);
      expect(analytics.classId).toBe(testClassId);
    });

    it('should get class analytics by date range', async () => {
      const analytics = await classAttendanceAnalyticsService.getClassAttendanceAnalyticsByDateRange(
        testClassId,
        new Date('2024-09-01'),
        new Date('2024-09-30'),
        testTenantId
      );

      expect(analytics).toBeDefined();
      expect(analytics.length).toBeGreaterThan(0);
      expect(analytics[0].classId).toBe(testClassId);
    });

    it('should get class attendance trends', async () => {
      const trends = await classAttendanceAnalyticsService.getClassAttendanceTrends(
        testClassId,
        new Date('2024-09-01'),
        new Date('2024-09-30'),
        testTenantId
      );

      expect(trends).toBeDefined();
      expect(trends.length).toBeGreaterThan(0);
    });

    it('should get overall attendance statistics', async () => {
      const statistics = await classAttendanceAnalyticsService.getOverallAttendanceStatistics(testTenantId);

      expect(statistics).toBeDefined();
      expect(statistics.totalSessions).toBeGreaterThanOrEqual(0);
      expect(statistics.totalStudents).toBeGreaterThanOrEqual(0);
    });

    it('should reject analytics from different tenant', async () => {
      await expect(
        classAttendanceAnalyticsService.getClassAttendanceAnalyticsByDate(
          testClassId,
          new Date('2024-09-20'),
          'different-tenant-id'
        )
      ).rejects.toThrow('Class attendance analytics not found');
    });
  });
});