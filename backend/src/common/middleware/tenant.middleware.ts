import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../../modules/tenants/tenant.service';
import { AppError } from './error.middleware';

/**
 * Extend Request interface to include tenant context
 */
declare global {
  namespace Express {
    interface Request {
      tenantContext?: {
        tenantId: string;
        schemaName: string;
        tenantName: string;
        status: string;
      };
    }
  }
}

/**
 * Tenant resolution middleware
 * Resolves tenant context from authenticated user's JWT token
 * This is a critical security boundary for multi-tenancy
 */
export const resolveTenant = (tenantService: TenantService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // In Phase 2, tenant resolution comes from authenticated user's JWT token
      // This is the production-safe approach
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(400, 'Tenant ID not found in user context');
      }

      // Resolve tenant context (trusted backend operation)
      const tenantContext = await tenantService.resolveTenantContext(tenantId);
      
      // Attach tenant context to request
      req.tenantContext = tenantContext;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional tenant resolution middleware
 * Attaches tenant context if available but doesn't require it
 */
export const optionalResolveTenant = (tenantService: TenantService) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (tenantId) {
        const tenantContext = await tenantService.resolveTenantContext(tenantId);
        req.tenantContext = tenantContext;
      }
      
      next();
    } catch (error) {
      // Don't fail the request if tenant resolution fails
      // Just continue without tenant context
      next();
    }
  };
};

/**
 * Ensure tenant context is present
 * This should be used for routes that require tenant context
 */
export const requireTenantContext = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.tenantContext) {
    throw new AppError(403, 'Tenant context is required for this operation');
  }
  next();
};

/**
 * Validate that the request is not attempting to access another tenant's data
 * This prevents cross-tenant access attempts
 */
export const preventCrossTenantAccess = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check for suspicious tenant override attempts
  const suspiciousParams = ['schema', 'tenantId', 'tenant_slug'];
  
  for (const param of suspiciousParams) {
    if (req.query[param] && req.tenantContext) {
      // Log potential cross-tenant access attempt
      console.warn(`Potential cross-tenant access attempt: ${param}=${req.query[param]}`);
      
      // In production, this might trigger security alerts
      // For now, we'll just reject the request
      throw new AppError(403, 'Invalid tenant parameter provided');
    }
  }
  
  next();
};