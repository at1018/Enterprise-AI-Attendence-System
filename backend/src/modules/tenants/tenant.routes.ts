import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { validate } from '../../common/utils/validation.util';
import { createTenantSchema } from './dto/tenant.dto';

export const createTenantRoutes = (tenantController: TenantController): Router => {
  const router = Router();

  /**
   * GET /api/v1/tenants/:id
   * Get tenant by ID
   */
  router.get('/:id', (req, res, next) => tenantController.getTenantById(req, res, next));

  /**
   * GET /api/v1/tenants/slug/:slug
   * Get tenant by slug
   */
  router.get('/slug/:slug', (req, res, next) => tenantController.getTenantBySlug(req, res, next));

  /**
   * POST /api/v1/tenants
   * Create a new tenant
   */
  router.post('/', validate(createTenantSchema), (req, res, next) => tenantController.createTenant(req, res, next));

  /**
   * GET /api/v1/tenants
   * List all tenants (admin only)
   */
  router.get('/', (req, res, next) => tenantController.listTenants(req, res, next));

  return router;
};