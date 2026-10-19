import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * DTO for user registration
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  role: z.nativeEnum(UserRole)
});

export type RegisterDto = z.infer<typeof registerSchema>;

/**
 * DTO for user login
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export type LoginDto = z.infer<typeof loginSchema>;

/**
 * DTO for token refresh
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;