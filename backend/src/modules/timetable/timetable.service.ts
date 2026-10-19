import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateTimetableEntryDto {
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  teacherId: string;
  classroomId: string;
  academicYearId: string;
  tenantId: string;
}

export interface UpdateTimetableEntryDto {
  dayOfWeek?: number;
  period?: number;
  startTime?: string;
  endTime?: string;
  classId?: string;
  sectionId?: string;
  subjectId?: string;
  teacherId?: string;
  classroomId?: string;
  isActive?: boolean;
}

export class TimetableService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new timetable entry
   */
  async createTimetableEntry(data: CreateTimetableEntryDto) {
    // Validate day of week (0-6)
    if (data.dayOfWeek < 0 || data.dayOfWeek > 6) {
      throw new AppError(400, 'Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Validate period
    if (data.period < 1) {
      throw new AppError(400, 'Period must be greater than 0');
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime) || !timeRegex.test(data.endTime)) {
      throw new AppError(400, 'Time must be in HH:MM format');
    }

    // Validate class exists
    const classData = await this.prisma.class.findUnique({
      where: { id: data.classId }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    // Validate subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: data.subjectId }
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    if (subject.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Subject belongs to different tenant');
    }

    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    // Validate classroom exists
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: data.classroomId }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    // Check for duplicate entry
    const existingEntry = await this.prisma.timetableEntry.findFirst({
      where: {
        dayOfWeek: data.dayOfWeek,
        period: data.period,
        classId: data.classId,
        sectionId: data.sectionId,
        academicYearId: data.academicYearId
      }
    });

    if (existingEntry) {
      throw new AppError(409, 'Timetable entry already exists for this day, period, and class');
    }

    // Create timetable entry
    const timetableEntry = await this.prisma.timetableEntry.create({
      data: {
        dayOfWeek: data.dayOfWeek,
        period: data.period,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        teacherId: data.teacherId,
        classroomId: data.classroomId,
        academicYearId: data.academicYearId,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return timetableEntry;
  }

  /**
   * Get timetable entry by ID
   */
  async getTimetableEntryById(id: string, tenantId: string) {
    const timetableEntry = await this.prisma.timetableEntry.findUnique({
      where: { id },
      include: {
        classroom: true
      }
    });

    if (!timetableEntry) {
      throw new AppError(404, 'Timetable entry not found');
    }

    if (timetableEntry.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Timetable entry belongs to different tenant');
    }

    return timetableEntry;
  }

  /**
   * Get timetable by class
   */
  async getTimetableByClass(classId: string, tenantId: string, academicYearId?: string) {
    // Validate class exists and belongs to tenant
    const classData = await this.prisma.class.findUnique({
      where: { id: classId }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    const where: any = {
      classId,
      tenantId
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const timetableEntries = await this.prisma.timetableEntry.findMany({
      where,
      include: {
        classroom: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { period: 'asc' }
      ]
    });

    return timetableEntries;
  }

  /**
   * Get timetable by teacher
   */
  async getTimetableByTeacher(teacherId: string, tenantId: string, academicYearId?: string) {
    const where: any = {
      teacherId,
      tenantId
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const timetableEntries = await this.prisma.timetableEntry.findMany({
      where,
      include: {
        classroom: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { period: 'asc' }
      ]
    });

    return timetableEntries;
  }

  /**
   * Get timetable by classroom
   */
  async getTimetableByClassroom(classroomId: string, tenantId: string, academicYearId?: string) {
    // Validate classroom exists and belongs to tenant
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    const where: any = {
      classroomId,
      tenantId
    };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const timetableEntries = await this.prisma.timetableEntry.findMany({
      where,
      include: {
        classroom: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { period: 'asc' }
      ]
    });

    return timetableEntries;
  }

  /**
   * Update timetable entry
   */
  async updateTimetableEntry(id: string, data: UpdateTimetableEntryDto, tenantId: string) {
    const timetableEntry = await this.prisma.timetableEntry.findUnique({
      where: { id }
    });

    if (!timetableEntry) {
      throw new AppError(404, 'Timetable entry not found');
    }

    if (timetableEntry.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Timetable entry belongs to different tenant');
    }

    // Validate day of week if provided
    if (data.dayOfWeek !== undefined && (data.dayOfWeek < 0 || data.dayOfWeek > 6)) {
      throw new AppError(400, 'Day of week must be between 0 (Sunday) and 6 (Saturday)');
    }

    // Validate time format if provided
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (data.startTime && !timeRegex.test(data.startTime)) {
      throw new AppError(400, 'Time must be in HH:MM format');
    }
    if (data.endTime && !timeRegex.test(data.endTime)) {
      throw new AppError(400, 'Time must be in HH:MM format');
    }

    const updatedTimetableEntry = await this.prisma.timetableEntry.update({
      where: { id },
      data
    });

    return updatedTimetableEntry;
  }

  /**
   * Delete timetable entry (soft delete by setting isActive to false)
   */
  async deleteTimetableEntry(id: string, tenantId: string) {
    const timetableEntry = await this.prisma.timetableEntry.findUnique({
      where: { id }
    });

    if (!timetableEntry) {
      throw new AppError(404, 'Timetable entry not found');
    }

    if (timetableEntry.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Timetable entry belongs to different tenant');
    }

    // Soft delete
    await this.prisma.timetableEntry.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Timetable entry deactivated successfully' };
  }
}