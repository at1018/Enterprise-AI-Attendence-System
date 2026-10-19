import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateAttendanceSessionDto {
  sessionId: string;
  date: Date;
  dayOfWeek: number;
  period: number;
  classId: string;
  sectionId?: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  academicYearId: string;
  timetableEntryId?: string;
  cameraId?: string;
  tenantId: string;
}

export interface UpdateAttendanceSessionDto {
  status?: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime?: Date;
  endTime?: Date;
  isCompleted?: boolean;
  completedBy?: string;
}

export class AttendanceSessionService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new attendance session
   */
  async createAttendanceSession(data: CreateAttendanceSessionDto) {
    // Validate day of week
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new AppError(400, 'Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

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

    // Validate teacher exists and belongs to tenant
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    // Validate classroom exists and belongs to tenant
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: data.classroomId }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    // Check for duplicate session
    const existingSession = await this.prisma.attendanceSession.findFirst({
      where: {
        sessionId: data.sessionId
      }
    });

    if (existingSession) {
      throw new AppError(409, 'Attendance session with this ID already exists');
    }

    // Get total students in class
    const totalStudents = await this.prisma.studentEnrollment.count({
      where: {
        classId: data.classId,
        sectionId: data.sectionId,
        isActive: true
      }
    });

    // Create attendance session
    const session = await this.prisma.attendanceSession.create({
      data: {
        sessionId: data.sessionId,
        date: data.date,
        dayOfWeek: data.dayOfWeek,
        period: data.period,
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        academicYearId: data.academicYearId,
        timetableEntryId: data.timetableEntryId,
        cameraId: data.cameraId,
        totalStudents,
        status: 'SCHEDULED',
        tenantId: data.tenantId
      }
    });

    return session;
  }

  /**
   * Get attendance session by ID
   */
  async getAttendanceSessionById(id: string, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id },
      include: {
        attendanceRecords: {
          include: {
            evidences: true
          }
        }
      }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    return session;
  }

  /**
   * Get attendance session by session ID
   */
  async getAttendanceSessionBySessionId(sessionId: string, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { sessionId },
      include: {
        attendanceRecords: {
          include: {
            evidences: true
          }
        }
      }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    return session;
  }

  /**
   * Get all attendance sessions for a tenant
   */
  async getAllAttendanceSessions(tenantId: string, classId?: string, teacherId?: string) {
    const where: any = {
      tenantId
    };

    if (classId) {
      where.classId = classId;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    const sessions = await this.prisma.attendanceSession.findMany({
      where,
      include: {
        attendanceRecords: true
      },
      orderBy: { date: 'desc' }
    });

    return sessions;
  }

  /**
   * Get attendance sessions by date range
   */
  async getAttendanceSessionsByDateRange(
    startDate: Date,
    endDate: Date,
    tenantId: string,
    classId?: string,
    teacherId?: string
  ) {
    const where: any = {
      tenantId,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    if (classId) {
      where.classId = classId;
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    const sessions = await this.prisma.attendanceSession.findMany({
      where,
      include: {
        attendanceRecords: true
      },
      orderBy: { date: 'desc' }
    });

    return sessions;
  }

  /**
   * Update attendance session
   */
  async updateAttendanceSession(id: string, data: UpdateAttendanceSessionDto, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    const updatedSession = await this.prisma.attendanceSession.update({
      where: { id },
      data
    });

    return updatedSession;
  }

  /**
   * Start attendance session
   */
  async startAttendanceSession(id: string, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    if (session.status === 'IN_PROGRESS') {
      throw new AppError(400, 'Attendance session is already in progress');
    }

    if (session.status === 'COMPLETED') {
      throw new AppError(400, 'Attendance session is already completed');
    }

    const updatedSession = await this.prisma.attendanceSession.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startTime: new Date()
      }
    });

    return updatedSession;
  }

  /**
   * Complete attendance session
   */
  async completeAttendanceSession(id: string, completedBy: string, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    if (session.status === 'COMPLETED') {
      throw new AppError(400, 'Attendance session is already completed');
    }

    const updatedSession = await this.prisma.attendanceSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        isCompleted: true,
        completedAt: new Date(),
        completedBy
      }
    });

    return updatedSession;
  }

  /**
   * Cancel attendance session
   */
  async cancelAttendanceSession(id: string, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    if (session.status === 'COMPLETED') {
      throw new AppError(400, 'Cannot cancel a completed attendance session');
    }

    const updatedSession = await this.prisma.attendanceSession.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    });

    return updatedSession;
  }

  /**
   * Update session statistics
   */
  async updateSessionStatistics(id: string, tenantId: string) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    // Calculate statistics from attendance records
    const records = await this.prisma.attendanceRecord.findMany({
      where: { sessionId: id }
    });

    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const absentCount = records.filter(r => r.status === 'ABSENT').length;
    const lateCount = records.filter(r => r.status === 'LATE').length;
    const excusedCount = records.filter(r => r.status === 'EXCUSED').length;

    const updatedSession = await this.prisma.attendanceSession.update({
      where: { id },
      data: {
        presentCount,
        absentCount,
        lateCount,
        excusedCount
      }
    });

    return updatedSession;
  }
}