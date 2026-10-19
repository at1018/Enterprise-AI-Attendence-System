import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateClassDto {
  name: string;
  grade: number;
  academicYearId: string;
  tenantId: string;
}

export interface UpdateClassDto {
  name?: string;
  grade?: number;
}

export interface CreateSectionDto {
  name: string;
  classId: string;
  tenantId: string;
}

export interface UpdateSectionDto {
  name?: string;
}

export class ClassService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new class
   */
  async createClass(data: CreateClassDto) {
    // Validate academic year exists
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: data.academicYearId }
    });

    if (!academicYear) {
      throw new AppError(404, 'Academic year not found');
    }

    if (academicYear.tenantId !== data.tenantId) {
      throw new AppError(403, 'Academic year does not belong to this tenant');
    }

    // Create class
    const classData = await this.prisma.class.create({
      data: {
        name: data.name,
        grade: data.grade,
        academicYearId: data.academicYearId,
        tenantId: data.tenantId
      }
    });

    return classData;
  }

  /**
   * Get class by ID
   */
  async getClassById(id: string, tenantId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: true,
        sections: true,
        studentEnrollments: {
          include: {
            student: true
          }
        }
      }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    return classData;
  }

  /**
   * Get all classes for tenant
   */
  async getClassesByTenant(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const classes = await this.prisma.class.findMany({
      where,
      include: {
        academicYear: true,
        sections: true,
        _count: {
          select: {
            studentEnrollments: true
          }
        }
      },
      orderBy: { grade: 'asc' }
    });

    return classes;
  }

  /**
   * Update class
   */
  async updateClass(id: string, data: UpdateClassDto, tenantId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    const updatedClass = await this.prisma.class.update({
      where: { id },
      data
    });

    return updatedClass;
  }

  /**
   * Delete class
   */
  async deleteClass(id: string, tenantId: string) {
    const classData = await this.prisma.class.findUnique({
      where: { id }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    // Check if class has enrollments
    const enrollmentCount = await this.prisma.studentEnrollment.count({
      where: { classId: id }
    });

    if (enrollmentCount > 0) {
      throw new AppError(400, 'Cannot delete class with enrolled students');
    }

    await this.prisma.class.delete({
      where: { id }
    });

    return { message: 'Class deleted successfully' };
  }

  /**
   * Create a new section
   */
  async createSection(data: CreateSectionDto) {
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

    // Create section
    const section = await this.prisma.section.create({
      data: {
        name: data.name,
        classId: data.classId,
        tenantId: data.tenantId
      }
    });

    return section;
  }

  /**
   * Get section by ID
   */
  async getSectionById(id: string, tenantId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id },
      include: {
        class: true,
        studentEnrollments: {
          include: {
            student: true
          }
        },
        classTeacherAssignments: {
          include: {
            teacher: true
          }
        }
      }
    });

    if (!section) {
      throw new AppError(404, 'Section not found');
    }

    if (section.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Section belongs to different tenant');
    }

    return section;
  }

  /**
   * Get all sections for a class
   */
  async getSectionsByClass(classId: string, tenantId: string) {
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

    const sections = await this.prisma.section.findMany({
      where: {
        classId,
        tenantId
      },
      include: {
        _count: {
          select: {
            studentEnrollments: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return sections;
  }

  /**
   * Update section
   */
  async updateSection(id: string, data: UpdateSectionDto, tenantId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id }
    });

    if (!section) {
      throw new AppError(404, 'Section not found');
    }

    if (section.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Section belongs to different tenant');
    }

    const updatedSection = await this.prisma.section.update({
      where: { id },
      data
    });

    return updatedSection;
  }

  /**
   * Delete section
   */
  async deleteSection(id: string, tenantId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id }
    });

    if (!section) {
      throw new AppError(404, 'Section not found');
    }

    if (section.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Section belongs to different tenant');
    }

    // Check if section has enrollments
    const enrollmentCount = await this.prisma.studentEnrollment.count({
      where: { sectionId: id }
    });

    if (enrollmentCount > 0) {
      throw new AppError(400, 'Cannot delete section with enrolled students');
    }

    await this.prisma.section.delete({
      where: { id }
    });

    return { message: 'Section deleted successfully' };
  }
}