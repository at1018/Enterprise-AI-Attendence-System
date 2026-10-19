import { Request, Response, NextFunction } from 'express';
import { ClassService } from './class.service';
import { AppError } from '../../common/middleware/error.middleware';

export class ClassController {
  private classService: ClassService;

  constructor(classService: ClassService) {
    this.classService = classService;
  }

  /**
   * Create a new class
   * POST /api/v1/classes
   */
  async createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const classData = await this.classService.createClass(req.body);

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: classData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get class by ID
   * GET /api/v1/classes/:id
   */
  async getClassById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classData = await this.classService.getClassById(id, tenantId);

      res.status(200).json({
        success: true,
        data: classData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all classes for tenant
   * GET /api/v1/classes
   */
  async getClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { academicYearId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classes = await this.classService.getClassesByTenant(
        tenantId,
        academicYearId as string
      );

      res.status(200).json({
        success: true,
        data: classes,
        count: classes.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update class
   * PUT /api/v1/classes/:id
   */
  async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const classData = await this.classService.updateClass(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Class updated successfully',
        data: classData
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete class
   * DELETE /api/v1/classes/:id
   */
  async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.classService.deleteClass(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new section
   * POST /api/v1/sections
   */
  async createSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const section = await this.classService.createSection(req.body);

      res.status(201).json({
        success: true,
        message: 'Section created successfully',
        data: section
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get section by ID
   * GET /api/v1/sections/:id
   */
  async getSectionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const section = await this.classService.getSectionById(id, tenantId);

      res.status(200).json({
        success: true,
        data: section
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all sections for a class
   * GET /api/v1/classes/:classId/sections
   */
  async getSectionsByClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const sections = await this.classService.getSectionsByClass(classId, tenantId);

      res.status(200).json({
        success: true,
        data: sections,
        count: sections.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update section
   * PUT /api/v1/sections/:id
   */
  async updateSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const section = await this.classService.updateSection(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Section updated successfully',
        data: section
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete section
   * DELETE /api/v1/sections/:id
   */
  async deleteSection(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.classService.deleteSection(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}