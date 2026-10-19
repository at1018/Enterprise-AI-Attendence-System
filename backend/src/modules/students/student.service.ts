import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateStudentDto {
  studentId: string;
  firstName: string;
  lastName: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  academicYearId: string;
  tenantId: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  phone?: string;
  parentName?: string;
  parentPhone?: string;
  isActive?: boolean;
}

export class StudentService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new student
   */
  async createStudent(data: CreateStudentDto) {
    // Check if student ID already exists
    const existingStudent = await this.prisma.student.findUnique({
      where: { studentId: data.studentId }
    });

    if (existingStudent) {
      throw new AppError(409, 'Student with this ID already exists');
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

    // Create student
    const student = await this.prisma.student.create({
      data: {
        studentId: data.studentId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        phone: data.phone,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        academicYearId: data.academicYearId,
        tenantId: data.tenantId,
        isActive: true
      }
    });

    return student;
  }

  /**
   * Get student by ID
   */
  async getStudentById(id: string, tenantId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        academicYear: true,
        enrollments: {
          include: {
            class: true,
            section: true
          }
        }
      }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    return student;
  }

  /**
   * Get student by student ID
   */
  async getStudentByStudentId(studentId: string, tenantId: string) {
    const student = await this.prisma.student.findUnique({
      where: { studentId },
      include: {
        academicYear: true,
        enrollments: {
          include: {
            class: true,
            section: true
          }
        }
      }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    return student;
  }

  /**
   * Get all students for a tenant
   */
  async getStudentsByTenant(tenantId: string, academicYearId?: string) {
    const where: any = { tenantId };

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    const students = await this.prisma.student.findMany({
      where,
      include: {
        academicYear: true,
        enrollments: {
          include: {
            class: true,
            section: true
          }
        }
      },
      orderBy: { lastName: 'asc' }
    });

    return students;
  }

  /**
   * Update student
   */
  async updateStudent(id: string, data: UpdateStudentDto, tenantId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    const updatedStudent = await this.prisma.student.update({
      where: { id },
      data
    });

    return updatedStudent;
  }

  /**
   * Delete student (soft delete by setting isActive to false)
   */
  async deleteStudent(id: string, tenantId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    // Soft delete
    await this.prisma.student.update({
      where: { id },
      data: { isActive: false }
    });

    return { message: 'Student deactivated successfully' };
  }

  /**
   * Enroll student in a class/section
   */
  async enrollStudent(studentId: string, classId: string, tenantId: string, sectionId?: string) {
    // Validate student exists
    const student = await this.prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
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

    // Check for duplicate enrollment
    const existingEnrollment = await this.prisma.studentEnrollment.findFirst({
      where: {
        studentId,
        classId,
        sectionId
      }
    });

    if (existingEnrollment) {
      throw new AppError(409, 'Student is already enrolled in this class/section');
    }

    // Create enrollment
    const enrollment = await this.prisma.studentEnrollment.create({
      data: {
        studentId,
        classId,
        sectionId,
        tenantId,
        isActive: true
      }
    });

    return enrollment;
  }

  /**
   * Remove student enrollment
   */
  async removeEnrollment(enrollmentId: string, tenantId: string) {
    const enrollment = await this.prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId }
    });

    if (!enrollment) {
      throw new AppError(404, 'Enrollment not found');
    }

    if (enrollment.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Enrollment belongs to different tenant');
    }

    await this.prisma.studentEnrollment.delete({
      where: { id: enrollmentId }
    });

    return { message: 'Enrollment removed successfully' };
  }

  /**
   * Get students by class
   */
  async getStudentsByClass(classId: string, tenantId: string) {
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

    const enrollments = await this.prisma.studentEnrollment.findMany({
      where: {
        classId,
        tenantId,
        isActive: true
      },
      include: {
        student: {
          include: {
            academicYear: true
          }
        },
        section: true
      }
    });

    return enrollments;
  }
}