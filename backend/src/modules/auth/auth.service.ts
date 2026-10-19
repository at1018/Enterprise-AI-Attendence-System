import { PrismaClient, UserRole } from '@prisma/client';
import { 
  hashPassword, 
  comparePassword, 
  generateTokenPair, 
  getRefreshTokenExpiry,
  JWTPayload 
} from '../../common/utils/auth.util';
import { AppError } from '../../common/middleware/error.middleware';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  role: UserRole;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class AuthService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterUserDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new AppError(409, 'User with this email already exists');
    }

    // Validate tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: data.tenantId }
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    if (tenant.status !== 'ACTIVE') {
      throw new AppError(403, 'Tenant is not active');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        tenantId: data.tenantId,
        isActive: true,
        emailVerified: false
      }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId
      },
      tokens
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
      include: { tenant: true }
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError(403, 'User account is inactive');
    }

    // Check if tenant is active
    if (user.tenant.status !== 'ACTIVE') {
      throw new AppError(403, 'Tenant is not active');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId
      },
      tokens
    };
  }

  /**
   * Refresh access token
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    // Find refresh token in database
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: { include: { tenant: true } } }
    });

    if (!tokenRecord) {
      throw new AppError(401, 'Invalid refresh token');
    }

    // Check if token is revoked
    if (tokenRecord.revokedAt) {
      throw new AppError(401, 'Refresh token has been revoked');
    }

    // Check if token is expired
    if (tokenRecord.expiresAt < new Date()) {
      // Revoke expired token
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() }
      });
      throw new AppError(401, 'Refresh token has expired');
    }

    // Check if user is still active
    if (!tokenRecord.user.isActive) {
      throw new AppError(403, 'User account is inactive');
    }

    // Check if tenant is still active
    if (tokenRecord.user.tenant.status !== 'ACTIVE') {
      throw new AppError(403, 'Tenant is not active');
    }

    // Generate new tokens
    const tokens = await this.generateTokens(tokenRecord.user);

    // Revoke old refresh token
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() }
    });

    return {
      user: {
        id: tokenRecord.user.id,
        email: tokenRecord.user.email,
        firstName: tokenRecord.user.firstName,
        lastName: tokenRecord.user.lastName,
        role: tokenRecord.user.role,
        tenantId: tokenRecord.user.tenantId
      },
      tokens
    };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { 
        token: refreshToken,
        revokedAt: null
      },
      data: { revokedAt: new Date() }
    });
  }

  /**
   * Generate tokens for a user
   */
  private async generateTokens(user: { id: string; email: string; tenantId: string; role: string }): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role
    };

    const tokens = generateTokenPair(payload);

    // Store refresh token in database
    try {
      await this.prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: getRefreshTokenExpiry()
        }
      });
    } catch (error) {
      console.error('Failed to store refresh token:', error);
      // Don't fail token generation if refresh token storage fails
    }

    return tokens;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLoginAt: user.lastLoginAt
    };
  }
}