import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateSubjectDto {
  name: string;
  code: string;
  description?: string;
  tenantId: string;
}

export interface UpdateSubjectDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export class SubjectService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new subject
   */
  async createSubject(data: CreateSubjectDto) {
    // Check if subject code already exists in tenant
    const existingSubject = await this.prisma.subject.findFirst({
      where: {
        code: data.code,
        tenantId: data.tenantId
      }
    });

    if (existingSubject) {
      throw new AppError(409, 'Subject with this code already exists in this tenant');
    }

    // Create subject
    const subject = await this.prisma.subject.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return subject;
  }

  /**
   * Get subject by ID
   */
  async getSubjectById(id: string, tenantId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        subjectTeacherAssignments: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    if (subject.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Subject belongs to different tenant');
    }

    return subject;
  }

  /**
   * Get subject by code
   */
  async getSubjectByCode(code: string, tenantId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: {
        code,
        tenantId
      },
      include: {
        subjectTeacherAssignments: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    return subject;
  }

  /**
   * Get all subjects for tenant
   */
  async getSubjectsByTenant(tenantId: string) {
    const subjects = await this.prisma.subject.findMany({
      where: { tenantId },
      include: {
        subjectTeacherAssignments: {
          include: {
            teacher: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return subjects;
  }

  /**
   * Update subject
   */
  async updateSubject(id: string, data: UpdateSubjectDto, tenantId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id }
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    if (subject.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Subject belongs to different tenant');
    }

    // If updating code, check for duplicate
    if (data.code && data.code !== subject.code) {
      const existingSubject = await this.prisma.subject.findFirst({
        where: {
          code: data.code,
          tenantId,
          id: { not: id }
        }
      });

      if (existingSubject) {
        throw new AppError(409, 'Subject with this code already exists in this tenant');
      }
    }

    const updatedSubject = await this.prisma.subject.update({
      where: { id },
      data
    });

    return updatedSubject;
  }

  /**
   * Delete subject (soft delete by setting isActive to false)
   */
  async deleteSubject(id: string, tenantId: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id }
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    if (subject.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Subject belongs to different tenant');
    }

    // Soft delete
    await this.prisma.subject.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Subject deactivated successfully' };
  }
}