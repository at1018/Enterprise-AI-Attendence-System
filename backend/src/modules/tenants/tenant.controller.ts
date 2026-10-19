import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenant.service';
import { createTenantSchema, CreateTenantDto } from './dto/tenant.dto';
import { AppError } from '../../common/middleware/error.middleware';

export class TenantController {
  private tenantService: TenantService;

  constructor(tenantService: TenantService) {
    this.tenantService = tenantService;
  }

  /**
   * Get tenant by ID
   * GET /api/v1/tenants/:id
   */
  async getTenantById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      const tenantContext = await this.tenantService.getTenantById(id);
      
      if (!tenantContext) {
        throw new AppError(404, 'Tenant not found');
      }

      res.status(200).json({
        success: true,
        data: tenantContext
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tenant by slug
   * GET /api/v1/tenants/slug/:slug
   */
  async getTenantBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      
      const tenantContext = await this.tenantService.getTenantBySlug(slug);
      
      if (!tenantContext) {
        throw new AppError(404, 'Tenant not found');
      }

      res.status(200).json({
        success: true,
        data: tenantContext
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new tenant
   * POST /api/v1/tenants
   */
  async createTenant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData: CreateTenantDto = createTenantSchema.parse(req.body);
      
      const tenantContext = await this.tenantService.createTenant(validatedData);

      res.status(201).json({
        success: true,
        message: 'Tenant created successfully',
        data: tenantContext
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all tenants (admin only)
   * GET /api/v1/tenants
   */
  async listTenants(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenants = await this.tenantService.listTenants();
      
      res.status(200).json({
        success: true,
        message: 'Tenants retrieved successfully',
        data: tenants
      });
    } catch (error) {
      next(error);
    }
  }
}