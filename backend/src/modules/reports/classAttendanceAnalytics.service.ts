import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateClassAttendanceAnalyticsDto {
  classId: string;
  sectionId?: string;
  academicYearId: string;
  subjectId?: string;
  teacherId?: string;
  date: Date;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  tenantId: string;
}

export class ClassAttendanceAnalyticsService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create or update class attendance analytics
   */
  async upsertClassAttendanceAnalytics(data: CreateClassAttendanceAnalyticsDto) {
    // Validate class exists and belongs to tenant
    const classData = await this.prisma.class.findUnique({
      where: { id: data.classId }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    // Calculate attendance percentage if not provided
    const attendancePercentage = data.attendancePercentage || 
      (data.totalStudents > 0 ? (data.presentCount / data.totalStudents) * 100 : 0);

    // Check if analytics exists
    const existingAnalytics = await this.prisma.classAttendanceAnalytics.findFirst({
      where: {
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        date: data.date
      }
    });

    if (existingAnalytics) {
      // Update existing
      const analytics = await this.prisma.classAttendanceAnalytics.update({
        where: { id: existingAnalytics.id },
        data: {
          totalStudents: data.totalStudents,
          presentCount: data.presentCount,
          absentCount: data.absentCount,
          lateCount: data.lateCount,
          excusedCount: data.excusedCount,
          attendancePercentage
        }
      });

      return analytics;
    } else {
      // Create new
      const analytics = await this.prisma.classAttendanceAnalytics.create({
        data: {
          classId: data.classId,
          sectionId: data.sectionId,
          academicYearId: data.academicYearId,
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          date: data.date,
          totalStudents: data.totalStudents,
          presentCount: data.presentCount,
          absentCount: data.absentCount,
          lateCount: data.lateCount,
          excusedCount: data.excusedCount,
          attendancePercentage,
          tenantId: data.tenantId
        }
      });

      return analytics;
    }
  }

  /**
   * Get class attendance analytics by date
   */
  async getClassAttendanceAnalyticsByDate(classId: string, date: Date, tenantId: string) {
    const analytics = await this.prisma.classAttendanceAnalytics.findFirst({
      where: {
        classId,
        date,
        tenantId
      }
    });

    if (!analytics) {
      throw new AppError(404, 'Class attendance analytics not found');
    }

    if (analytics.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Analytics belongs to different tenant');
    }

    return analytics;
  }

  /**
   * Get class attendance analytics by date range
   */
  async getClassAttendanceAnalyticsByDateRange(classId: string, startDate: Date, endDate: Date, tenantId: string) {
    const analytics = await this.prisma.classAttendanceAnalytics.findMany({
      where: {
        classId,
        date: {
          gte: startDate,
          lte: endDate
        },
        tenantId
      },
      orderBy: { date: 'desc' }
    });

    return analytics;
  }

  /**
   * Calculate class attendance analytics from sessions
   */
  async calculateClassAnalytics(classId: string, date: Date, tenantId: string) {
    // Get all attendance sessions for the class on the date
    const sessions = await this.prisma.attendanceSession.findMany({
      where: {
        classId,
        date,
        tenantId
      },
      include: {
        attendanceRecords: true
      }
    });

    if (sessions.length === 0) {
      throw new AppError(404, 'No attendance sessions found for this class on this date');
    }

    let totalStudents = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    // Aggregate from all sessions
    for (const session of sessions) {
      totalStudents = Math.max(totalStudents, session.totalStudents);
      presentCount += session.presentCount;
      absentCount += session.absentCount;
      lateCount += session.lateCount;
      excusedCount += session.excusedCount;
    }

    const attendancePercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    // Get academic year and other details from the first session
    const firstSession = sessions[0];
    const academicYearId = firstSession.academicYearId;
    const subjectId = firstSession.subjectId;
    const teacherId = firstSession.teacherId;

    // Upsert analytics
    const analytics = await this.upsertClassAttendanceAnalytics({
      classId,
      sectionId: firstSession.sectionId || undefined,
      academicYearId,
      subjectId: subjectId || undefined,
      teacherId: teacherId || undefined,
      date,
      totalStudents,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
      tenantId
    });

    return analytics;
  }

  /**
   * Get class attendance trends over time
   */
  async getClassAttendanceTrends(classId: string, startDate: Date, endDate: Date, tenantId: string) {
    const analytics = await this.prisma.classAttendanceAnalytics.findMany({
      where: {
        classId,
        date: {
          gte: startDate,
          lte: endDate
        },
        tenantId
      },
      orderBy: { date: 'asc' }
    });

    return analytics;
  }

  /**
   * Get overall attendance statistics for tenant
   */
  async getOverallAttendanceStatistics(tenantId: string, startDate?: Date, endDate?: Date) {
    const where: any = { tenantId };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    const analytics = await this.prisma.classAttendanceAnalytics.findMany({
      where
    });

    const totalSessions = analytics.length;
    const totalStudents = analytics.reduce((sum, a) => sum + a.totalStudents, 0);
    const totalPresent = analytics.reduce((sum, a) => sum + a.presentCount, 0);
    const totalAbsent = analytics.reduce((sum, a) => sum + a.absentCount, 0);
    const totalLate = analytics.reduce((sum, a) => sum + a.lateCount, 0);
    const totalExcused = analytics.reduce((sum, a) => sum + a.excusedCount, 0);
    const averageAttendance = totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;

    return {
      totalSessions,
      totalStudents,
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      averageAttendance
    };
  }
}