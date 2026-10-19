import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateClassroomDto {
  name: string;
  building?: string;
  floor?: string;
  capacity?: number;
  description?: string;
  tenantId: string;
}

export interface UpdateClassroomDto {
  name?: string;
  building?: string;
  floor?: string;
  capacity?: number;
  description?: string;
  isActive?: boolean;
}

export class ClassroomService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new classroom
   */
  async createClassroom(data: CreateClassroomDto) {
    // Create classroom
    const classroom = await this.prisma.classroom.create({
      data: {
        name: data.name,
        building: data.building,
        floor: data.floor,
        capacity: data.capacity,
        description: data.description,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return classroom;
  }

  /**
   * Get classroom by ID
   */
  async getClassroomById(id: string, tenantId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id },
      include: {
        cameras: true,
        timetableEntries: true
      }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    return classroom;
  }

  /**
   * Get all classrooms for tenant
   */
  async getClassroomsByTenant(tenantId: string) {
    const classrooms = await this.prisma.classroom.findMany({
      where: { tenantId },
      include: {
        cameras: true,
        _count: {
          select: {
            cameras: true,
            timetableEntries: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return classrooms;
  }

  /**
   * Update classroom
   */
  async updateClassroom(id: string, data: UpdateClassroomDto, tenantId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    const updatedClassroom = await this.prisma.classroom.update({
      where: { id },
      data
    });

    return updatedClassroom;
  }

  /**
   * Delete classroom (soft delete by setting isActive to false)
   */
  async deleteClassroom(id: string, tenantId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id }
    });

    if (!classroom) {
      throw new AppError(404, 'Classroom not found');
    }

    if (classroom.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Classroom belongs to different tenant');
    }

    // Check if classroom has active cameras
    const cameraCount = await this.prisma.camera.count({
      where: { classroomId: id, isActive: true }
    });

    if (cameraCount > 0) {
      throw new AppError(400, 'Cannot delete classroom with active cameras');
    }

    // Check if classroom has active timetable entries
    const timetableCount = await this.prisma.timetableEntry.count({
      where: { classroomId: id, isActive: true }
    });

    if (timetableCount > 0) {
      throw new AppError(400, 'Cannot delete classroom with active timetable entries');
    }

    // Soft delete
    await this.prisma.classroom.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Classroom deactivated successfully' };
  }

  /**
   * Get available classrooms (not assigned to any camera)
   */
  async getAvailableClassrooms(tenantId: string) {
    const classrooms = await this.prisma.classroom.findMany({
      where: {
        tenantId,
        isActive: true,
        cameras: {
          none: { isActive: true }
        }
      },
      include: {
        cameras: true
      }
    });

    return classrooms;
  }
}