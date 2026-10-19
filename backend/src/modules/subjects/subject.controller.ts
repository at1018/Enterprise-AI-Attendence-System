import { Request, Response, NextFunction } from 'express';
import { SubjectService } from './subject.service';
import { AppError } from '../../common/middleware/error.middleware';

export class SubjectController {
  private subjectService: SubjectService;

  constructor(subjectService: SubjectService) {
    this.subjectService = subjectService;
  }

  /**
   * Create a new subject
   * POST /api/v1/subjects
   */
  async createSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await this.subjectService.createSubject(req.body);

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject by ID
   * GET /api/v1/subjects/:id
   */
  async getSubjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const subject = await this.subjectService.getSubjectById(id, tenantId);

      res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get subject by code
   * GET /api/v1/subjects/code/:code
   */
  async getSubjectByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const subject = await this.subjectService.getSubjectByCode(code, tenantId);

      res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all subjects for tenant
   * GET /api/v1/subjects
   */
  async getSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const subjects = await this.subjectService.getSubjectsByTenant(tenantId);

      res.status(200).json({
        success: true,
        data: subjects,
        count: subjects.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update subject
   * PUT /api/v1/subjects/:id
   */
  async updateSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const subject = await this.subjectService.updateSubject(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: subject
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete subject (soft delete)
   * DELETE /api/v1/subjects/:id
   */
  async deleteSubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.subjectService.deleteSubject(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}