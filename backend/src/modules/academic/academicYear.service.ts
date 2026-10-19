import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateAcademicYearDto {
  name: string;
  startDate: Date;
  endDate: Date;
  tenantId: string;
}

export interface UpdateAcademicYearDto {
  name?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
}

export class AcademicYearService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new academic year
   */
  async createAcademicYear(data: CreateAcademicYearDto) {
    // Validate dates
    if (data.startDate >= data.endDate) {
      throw new AppError(400, 'Start date must be before end date');
    }

    // Check for overlapping academic years in the same tenant
    const overlappingYear = await this.prisma.academicYear.findFirst({
      where: {
        tenantId: data.tenantId,
        isActive: true,
        OR: [
          {
            startDate: { lte: data.startDate },
            endDate: { gte: data.startDate }
          },
          {
            startDate: { lte: data.endDate },
            endDate: { gte: data.endDate }
          },
          {
            startDate: { gte: data.startDate },
            endDate: { lte: data.endDate }
          }
        ]
      }
    });

    if (overlappingYear) {
      throw new AppError(409, 'Academic year overlaps with an existing active academic year');
    }

    // Create academic year
    const academicYear = await this.prisma.academicYear.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return academicYear;
  }

  /**
   * Get academic year by ID
   */
  async getAcademicYearById(id: string, tenantId: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id },
      include: {
        classes: true,
        students: true,
        teachers: true
      }
    });

    if (!academicYear) {
      throw new AppError(404, 'Academic year not found');
    }

    if (academicYear.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Academic year belongs to different tenant');
    }

    return academicYear;
  }

  /**
   * Get all academic years for tenant
   */
  async getAcademicYearsByTenant(tenantId: string) {
    const academicYears = await this.prisma.academicYear.findMany({
      where: { tenantId },
      include: {
        _count: {
          select: {
            classes: true,
            students: true,
            teachers: true
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return academicYears;
  }

  /**
   * Get active academic year for tenant
   */
  async getActiveAcademicYear(tenantId: string) {
    const academicYear = await this.prisma.academicYear.findFirst({
      where: {
        tenantId,
        isActive: true
      },
      include: {
        classes: true,
        students: true,
        teachers: true
      }
    });

    if (!academicYear) {
      throw new AppError(404, 'No active academic year found');
    }

    return academicYear;
  }

  /**
   * Update academic year
   */
  async updateAcademicYear(id: string, data: UpdateAcademicYearDto, tenantId: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id }
    });

    if (!academicYear) {
      throw new AppError(404, 'Academic year not found');
    }

    if (academicYear.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Academic year belongs to different tenant');
    }

    // Validate dates if provided
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new AppError(400, 'Start date must be before end date');
    }

    const updatedAcademicYear = await this.prisma.academicYear.update({
      where: { id },
      data
    });

    return updatedAcademicYear;
  }

  /**
   * Delete academic year (soft delete by setting isActive to false)
   */
  async deleteAcademicYear(id: string, tenantId: string) {
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id }
    });

    if (!academicYear) {
      throw new AppError(404, 'Academic year not found');
    }

    if (academicYear.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Academic year belongs to different tenant');
    }

    // Check if academic year has any data
    const classCount = await this.prisma.class.count({
      where: { academicYearId: id }
    });

    const studentCount = await this.prisma.student.count({
      where: { academicYearId: id }
    });

    const teacherCount = await this.prisma.teacher.count({
      where: { academicYearId: id }
    });

    if (classCount > 0 || studentCount > 0 || teacherCount > 0) {
      throw new AppError(400, 'Cannot delete academic year with associated data');
    }

    // Soft delete
    await this.prisma.academicYear.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Academic year deactivated successfully' };
  }
}