import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../common/utils/validation.util';
import { registerSchema, loginSchema, refreshTokenSchema } from './dto/auth.dto';
import { authenticate } from '../../common/middleware/auth.middleware';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  /**
   * POST /api/v1/auth/register
   * Register a new user
   */
  router.post('/register', validate(registerSchema), (req, res, next) => 
    authController.register(req, res, next)
  );

  /**
   * POST /api/v1/auth/login
   * Login user
   */
  router.post('/login', validate(loginSchema), (req, res, next) => 
    authController.login(req, res, next)
  );

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token
   */
  router.post('/refresh', validate(refreshTokenSchema), (req, res, next) => 
    authController.refreshTokens(req, res, next)
  );

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  router.post('/logout', validate(refreshTokenSchema), (req, res, next) => 
    authController.logout(req, res, next)
  );

  /**
   * GET /api/v1/auth/me
   * Get current user profile (protected)
   */
  router.get('/me', authenticate, (req, res, next) => 
    authController.getProfile(req, res, next)
  );

  return router;
};