import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

/**
 * Role-based authorization middleware
 * Checks if the authenticated user has the required role
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      if (!req.user.role) {
        throw new AppError(403, 'User role not defined');
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(403, 'Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Tenant authorization middleware
 * Ensures the user belongs to the correct tenant
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Authentication required');
    }

    if (!req.user.tenantId) {
      throw new AppError(403, 'Tenant context not available');
    }

    // Tenant validation is now handled by tenant middleware
    // This middleware ensures user has tenant context
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Resource ownership authorization middleware
 * Ensures the user has access to the specific resource
 */
export const requireResourceAccess = (resourceType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required');
      }

      // TODO: Implement resource-level authorization
      // This will be implemented in later phases based on specific resource types
      // For Phase 2, we have basic role-based authorization
      
      next();
    } catch (error) {
      next(error);
    }
  };
};