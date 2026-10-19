import { PrismaClient, UserRole } from '@prisma/client';
import { AuthService } from '../src/modules/auth/auth.service';

describe('AuthService', () => {
  let prisma: PrismaClient;
  let authService: AuthService;
  let testTenantId: string;

  beforeAll(async () => {
    prisma = new PrismaClient();
    authService = new AuthService(prisma);

    // Create a test tenant
    const tenant = await prisma.tenant.create({
      data: {
        name: 'Auth Test School',
        slug: 'auth-test-school',
        schemaName: 'school_auth_test',
        status: 'ACTIVE',
        configuration: {
          create: {
            maxUsers: 100,
            maxStudents: 1000,
            maxTeachers: 100,
            features: []
          }
        }
      }
    });
    testTenantId = tenant.id;
  });

  beforeEach(async () => {
    // Clean up users before each test
    await prisma.user.deleteMany({
      where: { tenantId: testTenantId }
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { tenantId: testTenantId }
    });
    await prisma.tenant.delete({
      where: { id: testTenantId }
    });
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePassword123',
        firstName: 'John',
        lastName: 'Doe',
        tenantId: testTenantId,
        role: UserRole.SCHOOL_ADMIN
      };

      const result = await authService.register(userData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.firstName).toBe('John');
      expect(result.user.role).toBe(UserRole.SCHOOL_ADMIN);
      expect(result.user.tenantId).toBe(testTenantId);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject duplicate email registration', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'SecurePassword123',
        firstName: 'Jane',
        lastName: 'Smith',
        tenantId: testTenantId,
        role: UserRole.SUBJECT_TEACHER
      };

      // First registration should succeed
      await authService.register(userData);

      // Second registration with same email should fail
      await expect(authService.register(userData)).rejects.toThrow('User with this email already exists');
    });

    it('should reject registration for non-existent tenant', async () => {
      const userData = {
        email: 'notenant@example.com',
        password: 'SecurePassword123',
        firstName: 'Bob',
        lastName: 'Johnson',
        tenantId: 'non-existent-tenant-id',
        role: UserRole.SCHOOL_ADMIN
      };

      await expect(authService.register(userData)).rejects.toThrow('Tenant not found');
    });

    it('should reject registration for inactive tenant', async () => {
      // Create an inactive tenant
      const inactiveTenant = await prisma.tenant.create({
        data: {
          name: 'Inactive School',
          slug: 'inactive-school',
          schemaName: 'school_inactive',
          status: 'SUSPENDED',
          configuration: {
            create: {
              maxUsers: 100,
              maxStudents: 1000,
              maxTeachers: 100,
              features: []
            }
          }
        }
      });

      const userData = {
        email: 'inactive@example.com',
        password: 'SecurePassword123',
        firstName: 'Charlie',
        lastName: 'Brown',
        tenantId: inactiveTenant.id,
        role: UserRole.SCHOOL_ADMIN
      };

      await expect(authService.register(userData)).rejects.toThrow('Tenant is not active');

      // Cleanup
      await prisma.tenant.delete({
        where: { id: inactiveTenant.id }
      });
    });
  });

  describe('login', () => {
    let testUserId: string;

    beforeEach(async () => {
      // Create a test user for login tests
      const { hashPassword } = await import('../src/common/utils/auth.util');
      const user = await prisma.user.create({
        data: {
          email: 'login@example.com',
          passwordHash: await hashPassword('TestPassword123'),
          firstName: 'Login',
          lastName: 'User',
          role: UserRole.CLASS_TEACHER,
          tenantId: testTenantId,
          isActive: true,
          emailVerified: true
        }
      });
      testUserId = user.id;
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'TestPassword123'
      };

      const result = await authService.login(loginData);

      expect(result).toBeDefined();
      expect(result.user.email).toBe('login@example.com');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123'
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'WrongPassword123'
      };

      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should reject login for inactive user', async () => {
      // Deactivate the test user
      await prisma.user.update({
        where: { id: testUserId },
        data: { isActive: false }
      });

      const loginData = {
        email: 'login@example.com',
        password: 'TestPassword123'
      };

      await expect(authService.login(loginData)).rejects.toThrow('User account is inactive');

      // Reactivate user for other tests
      await prisma.user.update({
        where: { id: testUserId },
        data: { isActive: true }
      });
    });
  });

  describe('getUserById', () => {
    let testUserId: string;

    beforeEach(async () => {
      const { hashPassword } = await import('../src/common/utils/auth.util');
      const user = await prisma.user.create({
        data: {
          email: 'profile@example.com',
          passwordHash: await hashPassword('TestPassword123'),
          firstName: 'Profile',
          lastName: 'User',
          role: UserRole.PRINCIPAL,
          tenantId: testTenantId,
          isActive: true,
          emailVerified: true
        }
      });
      testUserId = user.id;
    });

    it('should return user profile for valid ID', async () => {
      const user = await authService.getUserById(testUserId);

      expect(user).toBeDefined();
      expect(user.id).toBe(testUserId);
      expect(user.email).toBe('profile@example.com');
      expect(user.firstName).toBe('Profile');
      expect(user.role).toBe(UserRole.PRINCIPAL);
      expect(user.tenantName).toBe('Auth Test School');
    });

    it('should throw error for non-existent user ID', async () => {
      await expect(authService.getUserById('non-existent-id')).rejects.toThrow('User not found');
    });
  });
});