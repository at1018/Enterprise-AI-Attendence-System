import { Request, Response, NextFunction } from 'express';
import { TeacherService } from './teacher.service';
import { AppError } from '../../common/middleware/error.middleware';

export class TeacherController {
  private teacherService: TeacherService;

  constructor(teacherService: TeacherService) {
    this.teacherService = teacherService;
  }

  /**
   * Create a new teacher
   * POST /api/v1/teachers
   */
  async createTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const teacher = await this.teacherService.createTeacher(req.body);

      res.status(201).json({
        success: true,
        message: 'Teacher created successfully',
        data: teacher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get teacher by ID
   * GET /api/v1/teachers/:id
   */
  async getTeacherById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const teacher = await this.teacherService.getTeacherById(id, tenantId);

      res.status(200).json({
        success: true,
        data: teacher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get teacher by teacher ID
   * GET /api/v1/teachers/teacher/:teacherId
   */
  async getTeacherByTeacherId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const teacher = await this.teacherService.getTeacherByTeacherId(teacherId, tenantId);

      res.status(200).json({
        success: true,
        data: teacher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all teachers for tenant
   * GET /api/v1/teachers
   */
  async getTeachers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { academicYearId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const teachers = await this.teacherService.getTeachersByTenant(
        tenantId,
        academicYearId as string
      );

      res.status(200).json({
        success: true,
        data: teachers,
        count: teachers.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update teacher
   * PUT /api/v1/teachers/:id
   */
  async updateTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const teacher = await this.teacherService.updateTeacher(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Teacher updated successfully',
        data: teacher
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete teacher (soft delete)
   * DELETE /api/v1/teachers/:id
   */
  async deleteTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.teacherService.deleteTeacher(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign teacher to class
   * POST /api/v1/teachers/assign-class
   */
  async assignToClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId, classId, sectionId, tenantId } = req.body;

      const assignment = await this.teacherService.assignToClass(
        teacherId,
        classId,
        tenantId,
        sectionId
      );

      res.status(201).json({
        success: true,
        message: 'Teacher assigned to class successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign teacher to subject
   * POST /api/v1/teachers/assign-subject
   */
  async assignToSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { teacherId, subjectId, classId, sectionId, tenantId } = req.body;

      const assignment = await this.teacherService.assignToSubject(
        teacherId,
        subjectId,
        tenantId,
        classId,
        sectionId
      );

      res.status(201).json({
        success: true,
        message: 'Teacher assigned to subject successfully',
        data: assignment
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove class assignment
   * DELETE /api/v1/teachers/class-assignments/:assignmentId
   */
  async removeClassAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.teacherService.removeClassAssignment(assignmentId, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove subject assignment
   * DELETE /api/v1/teachers/subject-assignments/:assignmentId
   */
  async removeSubjectAssignment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { assignmentId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.teacherService.removeSubjectAssignment(assignmentId, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}