import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateAttendanceRecordDto {
  sessionId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  markedBy?: string;
  isManual?: boolean;
  tenantId: string;
}

export interface UpdateAttendanceRecordDto {
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  checkInTime?: Date;
  checkOutTime?: Date;
  overriddenBy?: string;
  overrideReason?: string;
  isManual?: boolean;
}

export class AttendanceRecordService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new attendance record
   */
  async createAttendanceRecord(data: CreateAttendanceRecordDto) {
    // Validate session exists and belongs to tenant
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: data.sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

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

    // Check for duplicate record
    const existingRecord = await this.prisma.attendanceRecord.findFirst({
      where: {
        sessionId: data.sessionId,
        studentId: data.studentId
      }
    });

    if (existingRecord) {
      throw new AppError(409, 'Attendance record already exists for this student in this session');
    }

    // Create attendance record
    const record = await this.prisma.attendanceRecord.create({
      data: {
        sessionId: data.sessionId,
        studentId: data.studentId,
        status: data.status,
        markedBy: data.markedBy,
        isManual: data.isManual || false,
        checkInTime: data.status === 'PRESENT' || data.status === 'LATE' ? new Date() : null,
        tenantId: data.tenantId
      }
    });

    // Update session statistics
    await this.updateSessionStatistics(data.sessionId, data.tenantId);

    return record;
  }

  /**
   * Get attendance record by ID
   */
  async getAttendanceRecordById(id: string, tenantId: string) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id },
      include: {
        evidences: true,
        session: true
      }
    });

    if (!record) {
      throw new AppError(404, 'Attendance record not found');
    }

    if (record.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance record belongs to different tenant');
    }

    return record;
  }

  /**
   * Get attendance records by session
   */
  async getAttendanceRecordsBySession(sessionId: string, tenantId: string) {
    // Validate session exists and belongs to tenant
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where: { sessionId },
      include: {
        evidences: true
      },
      orderBy: { createdAt: 'asc' }
    });

    return records;
  }

  /**
   * Get attendance records by student
   */
  async getAttendanceRecordsByStudent(studentId: string, tenantId: string, startDate?: Date, endDate?: Date) {
    // Validate student exists and belongs to tenant
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    const where: any = {
      studentId,
      tenantId
    };

    if (startDate && endDate) {
      where.session = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        session: true,
        evidences: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return records;
  }

  /**
   * Update attendance record
   */
  async updateAttendanceRecord(id: string, data: UpdateAttendanceRecordDto, tenantId: string) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new AppError(404, 'Attendance record not found');
    }

    if (record.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance record belongs to different tenant');
    }

    // If status is being changed and not manual, mark as override
    if (data.status && data.status !== record.status && !data.isManual) {
      data.isManual = true;
    }

    const updatedRecord = await this.prisma.attendanceRecord.update({
      where: { id },
      data
    });

    // Update session statistics
    await this.updateSessionStatistics(record.sessionId, tenantId);

    return updatedRecord;
  }

  /**
   * Bulk create attendance records for a session
   */
  async bulkCreateAttendanceRecords(sessionId: string, studentIds: string[], tenantId: string) {
    // Validate session exists and belongs to tenant
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    // Validate all students exist and belong to tenant
    const students = await this.prisma.student.findMany({
      where: {
        id: { in: studentIds },
        tenantId
      }
    });

    if (students.length !== studentIds.length) {
      throw new AppError(400, 'One or more students not found or belong to different tenant');
    }

    // Create attendance records
    const records = await this.prisma.attendanceRecord.createMany({
      data: studentIds.map(studentId => ({
        sessionId,
        studentId,
        status: 'ABSENT', // Default to absent, will be updated by face recognition
        tenantId
      })),
      skipDuplicates: true
    });

    // Update session statistics
    await this.updateSessionStatistics(sessionId, tenantId);

    return { count: records.count };
  }

  /**
   * Delete attendance record
   */
  async deleteAttendanceRecord(id: string, tenantId: string) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id }
    });

    if (!record) {
      throw new AppError(404, 'Attendance record not found');
    }

    if (record.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance record belongs to different tenant');
    }

    await this.prisma.attendanceRecord.delete({
      where: { id }
    });

    // Update session statistics
    await this.updateSessionStatistics(record.sessionId, tenantId);

    return { message: 'Attendance record deleted successfully' };
  }

  /**
   * Update session statistics helper
   */
  private async updateSessionStatistics(sessionId: string, tenantId: string) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: { sessionId }
    });

    const presentCount = records.filter(r => r.status === 'PRESENT').length;
    const absentCount = records.filter(r => r.status === 'ABSENT').length;
    const lateCount = records.filter(r => r.status === 'LATE').length;
    const excusedCount = records.filter(r => r.status === 'EXCUSED').length;

    await this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: {
        presentCount,
        absentCount,
        lateCount,
        excusedCount
      }
    });
  }
}