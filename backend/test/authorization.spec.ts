import { Request, Response, NextFunction } from 'express';
import { requireRole, requireTenant, requireResourceAccess } from '../src/common/middleware/authorization.middleware';
import { AppError } from '../src/common/middleware/error.middleware';

describe('Authorization Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: {
        userId: 'test-user-id',
        email: 'test@example.com',
        tenantId: 'test-tenant-id',
        role: 'SCHOOL_ADMIN'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access when user has required role', () => {
      const middleware = requireRole('SCHOOL_ADMIN', 'PRINCIPAL');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should deny access when user does not have required role', () => {
      const middleware = requireRole('PRINCIPAL');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Insufficient permissions');
    });

    it('should deny access when user is not authenticated', () => {
      mockRequest.user = undefined;
      const middleware = requireRole('SCHOOL_ADMIN');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should deny access when user role is not defined', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        tenantId: 'test-tenant-id',
        role: undefined as any
      };
      const middleware = requireRole('SCHOOL_ADMIN');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('User role not defined');
    });

    it('should handle multiple allowed roles', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        tenantId: 'test-tenant-id',
        role: 'CLASS_TEACHER'
      };
      const middleware = requireRole('SCHOOL_ADMIN', 'CLASS_TEACHER', 'PRINCIPAL');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('requireTenant', () => {
    it('should allow access when user has tenant context', () => {
      requireTenant(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should deny access when user is not authenticated', () => {
      mockRequest.user = undefined;
      
      requireTenant(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should deny access when user does not have tenant context', () => {
      mockRequest.user = {
        userId: 'test-user-id',
        email: 'test@example.com',
        tenantId: undefined as any,
        role: 'SCHOOL_ADMIN'
      };
      
      requireTenant(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Tenant context not available');
    });
  });

  describe('requireResourceAccess', () => {
    it('should allow access when user is authenticated', () => {
      const middleware = requireResourceAccess('student');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    it('should deny access when user is not authenticated', () => {
      mockRequest.user = undefined;
      const middleware = requireResourceAccess('student');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
    });

    it('should handle different resource types', () => {
      const studentMiddleware = requireResourceAccess('student');
      const teacherMiddleware = requireResourceAccess('teacher');
      const classMiddleware = requireResourceAccess('class');
      
      studentMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      teacherMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      classMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(3);
    });
  });
});