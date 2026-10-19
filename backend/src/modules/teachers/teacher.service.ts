import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateTeacherDto {
  teacherId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  academicYearId: string;
  tenantId: string;
}

export interface UpdateTeacherDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  qualification?: string;
  specialization?: string;
  isActive?: boolean;
}

export class TeacherService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new teacher
   */
  async createTeacher(data: CreateTeacherDto) {
    // Check if teacher ID already exists
    const existingTeacher = await this.prisma.teacher.findUnique({
      where: { teacherId: data.teacherId }
    });

    if (existingTeacher) {
      throw new AppError(409, 'Teacher with this ID already exists');
    }

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

    // Create teacher
    const teacher = await this.prisma.teacher.create({
      data: {
        teacherId: data.teacherId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        qualification: data.qualification,
        specialization: data.specialization,
        academicYearId: data.academicYearId,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return teacher;
  }

  /**
   * Get teacher by ID
   */
  async getTeacherById(id: string, tenantId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        academicYear: true,
        classTeacherAssignments: {
          include: {
            class: true,
            section: true
          }
        },
        subjectTeacherAssignments: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    return teacher;
  }

  /**
   * Get teacher by teacher ID
   */
  async getTeacherByTeacherId(teacherId: string, tenantId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { teacherId },
      include: {
        academicYear: true,
        classTeacherAssignments: {
          include: {
            class: true,
            section: true
          }
        },
        subjectTeacherAssignments: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    return teacher;
  }

  /**
   * Get all teachers for a tenant
   */
  async getTeachersByTenant(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const teachers = await this.prisma.teacher.findMany({
      where,
      include: {
        academicYear: true,
        classTeacherAssignments: {
          include: {
            class: true,
            section: true
          }
        },
        subjectTeacherAssignments: {
          include: {
            subject: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    return teachers;
  }

  /**
   * Update teacher
   */
  async updateTeacher(id: string, data: UpdateTeacherDto, tenantId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    const updatedTeacher = await this.prisma.teacher.update({
      where: { id },
      data
    });

    return updatedTeacher;
  }

  /**
   * Delete teacher (soft delete by setting isActive to false)
   */
  async deleteTeacher(id: string, tenantId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    // Soft delete
    await this.prisma.teacher.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Teacher deactivated successfully' };
  }

  /**
   * Assign teacher to class
   */
  async assignToClass(teacherId: string, classId: string, tenantId: string, sectionId?: string) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    // Validate class exists
    const classData = await this.prisma.class.findUnique({
      where: { id: classId }
    });

    if (!classData) {
      throw new AppError(404, 'Class not found');
    }

    if (classData.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Class belongs to different tenant');
    }

    // Validate section if provided
    if (sectionId) {
      const section = await this.prisma.section.findUnique({
        where: { id: sectionId }
      });

      if (!section) {
        throw new AppError(404, 'Section not found');
      }

      if (section.classId !== classId) {
        throw new AppError(400, 'Section does not belong to this class');
      }
    }

    // Check for duplicate assignment
    const existingAssignment = await this.prisma.classTeacherAssignment.findFirst({
      where: {
        teacherId,
        classId,
        sectionId
      }
    });

    if (existingAssignment) {
      throw new AppError(409, 'Teacher is already assigned to this class/section');
    }

    // Create assignment
    const assignment = await this.prisma.classTeacherAssignment.create({
      data: {
        teacherId,
        classId,
        sectionId,
        tenantId,
        isActive: true
      }
    });

    return assignment;
  }

  /**
   * Assign teacher to subject
   */
  async assignToSubject(teacherId: string, subjectId: string, tenantId: string, classId?: string, sectionId?: string) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new AppError(404, 'Teacher not found');
    }

    if (teacher.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Teacher belongs to different tenant');
    }

    // Validate subject exists
    const subject = await this.prisma.subject.findUnique({
      where: { id: subjectId }
    });

    if (!subject) {
      throw new AppError(404, 'Subject not found');
    }

    if (subject.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Subject belongs to different tenant');
    }

    // Create assignment
    const assignment = await this.prisma.subjectTeacherAssignment.create({
      data: {
        teacherId,
        subjectId,
        classId,
        sectionId,
        tenantId,
        isActive: true
      }
    });

    return assignment;
  }

  /**
   * Remove class assignment
   */
  async removeClassAssignment(assignmentId: string, tenantId: string) {
    const assignment = await this.prisma.classTeacherAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      throw new AppError(404, 'Assignment not found');
    }

    if (assignment.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Assignment belongs to different tenant');
    }

    await this.prisma.classTeacherAssignment.delete({
      where: { id: assignmentId }
    });

    return { message: 'Class assignment removed successfully' };
  }

  /**
   * Remove subject assignment
   */
  async removeSubjectAssignment(assignmentId: string, tenantId: string) {
    const assignment = await this.prisma.subjectTeacherAssignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      throw new AppError(404, 'Assignment not found');
    }

    if (assignment.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Assignment belongs to different tenant');
    }

    await this.prisma.subjectTeacherAssignment.delete({
      where: { id: assignmentId }
    });

    return { message: 'Subject assignment removed successfully' };
  }
}