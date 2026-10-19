import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateAttendanceReportDto {
  reportId: string;
  reportType: 'STUDENT_ATTENDANCE' | 'CLASS_ATTENDANCE' | 'TEACHER_ATTENDANCE' | 'DAILY_SUMMARY' | 'MONTHLY_SUMMARY' | 'CUSTOM';
  title: string;
  description?: string;
  generatedBy: string;
  startDate: Date;
  endDate: Date;
  filters?: any;
  parameters?: any;
  tenantId: string;
}

export class AttendanceReportService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new attendance report
   */
  async createAttendanceReport(data: CreateAttendanceReportDto) {
    // Check for duplicate report ID
    const existingReport = await this.prisma.attendanceReport.findUnique({
      where: { reportId: data.reportId }
    });

    if (existingReport) {
      throw new AppError(409, 'Report with this ID already exists');
    }

    // Create report
    const report = await this.prisma.attendanceReport.create({
      data: {
        reportId: data.reportId,
        reportType: data.reportType,
        title: data.title,
        description: data.description,
        generatedBy: data.generatedBy,
        startDate: data.startDate,
        endDate: data.endDate,
        filters: data.filters,
        parameters: data.parameters,
        status: 'COMPLETED',
        tenantId: data.tenantId
      }
    });

    return report;
  }

  /**
   * Get attendance report by ID
   */
  async getAttendanceReportById(id: string, tenantId: string) {
    const report = await this.prisma.attendanceReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw new AppError(404, 'Attendance report not found');
    }

    if (report.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Report belongs to different tenant');
    }

    return report;
  }

  /**
   * Get attendance report by report ID
   */
  async getAttendanceReportByReportId(reportId: string, tenantId: string) {
    const report = await this.prisma.attendanceReport.findUnique({
      where: { reportId }
    });

    if (!report) {
      throw new AppError(404, 'Attendance report not found');
    }

    if (report.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Report belongs to different tenant');
    }

    return report;
  }

  /**
   * Get reports by date range
   */
  async getReportsByDateRange(startDate: Date, endDate: Date, tenantId: string, reportType?: string) {
    const where: any = {
      tenantId,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    };

    if (reportType) {
      where.reportType = reportType;
    }

    const reports = await this.prisma.attendanceReport.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  }

  /**
   * Get reports by generator
   */
  async getReportsByGenerator(generatedBy: string, tenantId: string) {
    const reports = await this.prisma.attendanceReport.findMany({
      where: {
        generatedBy,
        tenantId
      },
      orderBy: { createdAt: 'desc' }
    });

    return reports;
  }

  /**
   * Delete attendance report
   */
  async deleteAttendanceReport(id: string, tenantId: string) {
    const report = await this.prisma.attendanceReport.findUnique({
      where: { id }
    });

    if (!report) {
      throw new AppError(404, 'Attendance report not found');
    }

    if (report.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Report belongs to different tenant');
    }

    await this.prisma.attendanceReport.delete({
      where: { id }
    });

    return { message: 'Attendance report deleted successfully' };
  }
}