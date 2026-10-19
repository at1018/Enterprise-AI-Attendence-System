import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateStudentAttendanceSummaryDto {
  studentId: string;
  academicYearId: string;
  classId?: string;
  sectionId?: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  tenantId: string;
}

export class StudentAttendanceSummaryService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create or update student attendance summary
   */
  async upsertStudentAttendanceSummary(data: CreateStudentAttendanceSummaryDto) {
    // Validate student exists and belongs to tenant
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    // Calculate attendance percentage if not provided
    const attendancePercentage = data.attendancePercentage || 
      (data.totalSessions > 0 ? (data.presentCount / data.totalSessions) * 100 : 0);

    // Check if summary exists
    const existingSummary = await this.prisma.studentAttendanceSummary.findFirst({
      where: {
        studentId: data.studentId,
        academicYearId: data.academicYearId,
        classId: data.classId,
        sectionId: data.sectionId
      }
    });

    if (existingSummary) {
      // Update existing
      const summary = await this.prisma.studentAttendanceSummary.update({
        where: { id: existingSummary.id },
        data: {
          totalSessions: data.totalSessions,
          presentCount: data.presentCount,
          absentCount: data.absentCount,
          lateCount: data.lateCount,
          excusedCount: data.excusedCount,
          attendancePercentage
        }
      });

      return summary;
    } else {
      // Create new
      const summary = await this.prisma.studentAttendanceSummary.create({
        data: {
          studentId: data.studentId,
          academicYearId: data.academicYearId,
          classId: data.classId,
          sectionId: data.sectionId || undefined,
          totalSessions: data.totalSessions,
          presentCount: data.presentCount,
          absentCount: data.absentCount,
          lateCount: data.lateCount,
          excusedCount: data.excusedCount,
          attendancePercentage,
          tenantId: data.tenantId
        }
      });

      return summary;
    }
  }

  /**
   * Get student attendance summary
   */
  async getStudentAttendanceSummary(studentId: string, academicYearId: string, tenantId: string) {
    const summary = await this.prisma.studentAttendanceSummary.findFirst({
      where: {
        studentId,
        academicYearId,
        tenantId
      },
      include: {
        student: true
      }
    });

    if (!summary) {
      throw new AppError(404, 'Student attendance summary not found');
    }

    if (summary.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Summary belongs to different tenant');
    }

    return summary;
  }

  /**
   * Get student attendance summaries by class
   */
  async getSummariesByClass(classId: string, academicYearId: string, tenantId: string) {
    const summaries = await this.prisma.studentAttendanceSummary.findMany({
      where: {
        classId,
        academicYearId,
        tenantId
      },
      include: {
        student: true
      },
      orderBy: {
        attendancePercentage: 'desc'
      }
    });

    return summaries;
  }

  /**
   * Calculate student attendance summary from records
   */
  async calculateStudentSummary(studentId: string, academicYearId: string, tenantId: string) {
    // Get all attendance records for the student in the academic year
    const records = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        tenantId
      },
      include: {
        session: true
      }
    });

    // Filter by academic year
    const academicYearRecords = records.filter(r => r.session.academicYearId === academicYearId);

    const totalSessions = academicYearRecords.length;
    const presentCount = academicYearRecords.filter(r => r.status === 'PRESENT').length;
    const absentCount = academicYearRecords.filter(r => r.status === 'ABSENT').length;
    const lateCount = academicYearRecords.filter(r => r.status === 'LATE').length;
    const excusedCount = academicYearRecords.filter(r => r.status === 'EXCUSED').length;
    const attendancePercentage = totalSessions > 0 ? (presentCount / totalSessions) * 100 : 0;

    // Get most recent class and section
    const mostRecentRecord = academicYearRecords[0];
    const classId = mostRecentRecord?.session.classId;
    const sectionId = mostRecentRecord?.session.sectionId;

    // Upsert summary
    const summary = await this.upsertStudentAttendanceSummary({
      studentId,
      academicYearId,
      classId,
      sectionId: sectionId || undefined,
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      tenantId
    });

    return summary;
  }

  /**
   * Get students with low attendance (below threshold)
   */
  async getLowAttendanceStudents(academicYearId: string, threshold: number, tenantId: string) {
    const summaries = await this.prisma.studentAttendanceSummary.findMany({
      where: {
        academicYearId,
        tenantId,
        attendancePercentage: {
          lt: threshold
        }
      },
      include: {
        student: true
      },
      orderBy: {
        attendancePercentage: 'asc'
      }
    });

    return summaries;
  }
}