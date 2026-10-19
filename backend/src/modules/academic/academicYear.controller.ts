import { Request, Response, NextFunction } from 'express';
import { AcademicYearService } from './academicYear.service';
import { AppError } from '../../common/middleware/error.middleware';

export class AcademicYearController {
  private academicYearService: AcademicYearService;

  constructor(academicYearService: AcademicYearService) {
    this.academicYearService = academicYearService;
  }

  /**
   * Create a new academic year
   * POST /api/v1/academic-years
   */
  async createAcademicYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const academicYear = await this.academicYearService.createAcademicYear(req.body);

      res.status(201).json({
        success: true,
        message: 'Academic year created successfully',
        data: academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get academic year by ID
   * GET /api/v1/academic-years/:id
   */
  async getAcademicYearById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const academicYear = await this.academicYearService.getAcademicYearById(id, tenantId);

      res.status(200).json({
        success: true,
        data: academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all academic years for tenant
   * GET /api/v1/academic-years
   */
  async getAcademicYears(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const academicYears = await this.academicYearService.getAcademicYearsByTenant(tenantId);

      res.status(200).json({
        success: true,
        data: academicYears,
        count: academicYears.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get active academic year for tenant
   * GET /api/v1/academic-years/active
   */
  async getActiveAcademicYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const academicYear = await this.academicYearService.getActiveAcademicYear(tenantId);

      res.status(200).json({
        success: true,
        data: academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update academic year
   * PUT /api/v1/academic-years/:id
   */
  async updateAcademicYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const academicYear = await this.academicYearService.updateAcademicYear(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Academic year updated successfully',
        data: academicYear
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete academic year (soft delete)
   * DELETE /api/v1/academic-years/:id
   */
  async deleteAcademicYear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.academicYearService.deleteAcademicYear(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}