import { Request, Response, NextFunction } from 'express';
import { ClassroomService } from './classroom.service';
import { AppError } from '../../common/middleware/error.middleware';

export class ClassroomController {
  private classroomService: ClassroomService;

  constructor(classroomService: ClassroomService) {
    this.classroomService = classroomService;
  }

  /**
   * Create a new classroom
   * POST /api/v1/classrooms
   */
  async createClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classroom = await this.classroomService.createClassroom(req.body);

      res.status(201).json({
        success: true,
        message: 'Classroom created successfully',
        data: classroom
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get classroom by ID
   * GET /api/v1/classrooms/:id
   */
  async getClassroomById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classroom = await this.classroomService.getClassroomById(id, tenantId);

      res.status(200).json({
        success: true,
        data: classroom
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all classrooms for tenant
   * GET /api/v1/classrooms
   */
  async getClassrooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classrooms = await this.classroomService.getClassroomsByTenant(tenantId);

      res.status(200).json({
        success: true,
        data: classrooms,
        count: classrooms.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update classroom
   * PUT /api/v1/classrooms/:id
   */
  async updateClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classroom = await this.classroomService.updateClassroom(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Classroom updated successfully',
        data: classroom
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete classroom (soft delete)
   * DELETE /api/v1/classrooms/:id
   */
  async deleteClassroom(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.classroomService.deleteClassroom(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available classrooms
   * GET /api/v1/classrooms/available
   */
  async getAvailableClassrooms(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classrooms = await this.classroomService.getAvailableClassrooms(tenantId);

      res.status(200).json({
        success: true,
        data: classrooms,
        count: classrooms.length
      });
    } catch (error) {
      next(error);
    }
  }
}