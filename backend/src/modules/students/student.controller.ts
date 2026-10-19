import { Request, Response, NextFunction } from 'express';
import { StudentService } from './student.service';
import { AppError } from '../../common/middleware/error.middleware';

export class StudentController {
  private studentService: StudentService;

  constructor(studentService: StudentService) {
    this.studentService = studentService;
  }

  /**
   * Create a new student
   * POST /api/v1/students
   */
  async createStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const student = await this.studentService.createStudent(req.body);

      res.status(201).json({
        success: true,
        message: 'Student created successfully',
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student by ID
   * GET /api/v1/students/:id
   */
  async getStudentById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const student = await this.studentService.getStudentById(id, tenantId);

      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student by student ID
   * GET /api/v1/students/student/:studentId
   */
  async getStudentByStudentId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const student = await this.studentService.getStudentByStudentId(studentId, tenantId);

      res.status(200).json({
        success: true,
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all students for tenant
   * GET /api/v1/students
   */
  async getStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { academicYearId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const students = await this.studentService.getStudentsByTenant(
        tenantId,
        academicYearId as string
      );

      res.status(200).json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update student
   * PUT /api/v1/students/:id
   */
  async updateStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const student = await this.studentService.updateStudent(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Student updated successfully',
        data: student
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete student (soft delete)
   * DELETE /api/v1/students/:id
   */
  async deleteStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.studentService.deleteStudent(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enroll student in class/section
   * POST /api/v1/students/enroll
   */
  async enrollStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, classId, sectionId, tenantId } = req.body;

      const enrollment = await this.studentService.enrollStudent(
        studentId,
        classId,
        tenantId,
        sectionId
      );

      res.status(201).json({
        success: true,
        message: 'Student enrolled successfully',
        data: enrollment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove student enrollment
   * DELETE /api/v1/students/enrollments/:enrollmentId
   */
  async removeEnrollment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { enrollmentId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.studentService.removeEnrollment(enrollmentId, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get students by class
   * GET /api/v1/students/class/:classId
   */
  async getStudentsByClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const students = await this.studentService.getStudentsByClass(classId, tenantId);

      res.status(200).json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      next(error);
    }
  }
}