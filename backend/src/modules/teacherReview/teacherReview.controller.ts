import { Request, Response, NextFunction } from 'express';
import { TeacherReviewService } from './teacherReview.service';
import { AppError } from '../../common/middleware/error.middleware';
import {
  acceptAttendanceSchema,
  overrideAttendanceSchema,
  confirmSessionSchema,
  bulkAcceptSchema
} from './dto/teacherReview.dto';

const teacherReviewService = new TeacherReviewService();

export class TeacherReviewController {
  /**
   * Accept AI-generated preliminary attendance
   */
  async acceptAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = acceptAttendanceSchema.parse(req.body);
      const tenantId = req.user?.tenantId;
      const teacherId = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      if (!teacherId) {
        throw new AppError(401, 'User ID not found in token');
      }

      const result = await teacherReviewService.acceptAttendance(
        dto.preliminaryAttendanceId,
        teacherId,
        tenantId,
        dto.notes
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Attendance accepted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Override AI-generated preliminary attendance
   */
  async overrideAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = overrideAttendanceSchema.parse(req.body);
      const tenantId = req.user?.tenantId;
      const teacherId = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      if (!teacherId) {
        throw new AppError(401, 'User ID not found in token');
      }

      const result = await teacherReviewService.overrideAttendance(
        dto.preliminaryAttendanceId,
        teacherId,
        dto.newStatus,
        dto.reason,
        tenantId,
        dto.notes
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Attendance overridden successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm final attendance for a session
   */
  async confirmSessionAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = confirmSessionSchema.parse(req.body);
      const tenantId = req.user?.tenantId;
      const teacherId = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      if (!teacherId) {
        throw new AppError(401, 'User ID not found in token');
      }

      const result = await teacherReviewService.confirmSessionAttendance(
        dto.sessionId,
        teacherId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Session attendance confirmed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit trail for a student
   */
  async getAuditTrailForStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const auditTrails = await teacherReviewService.getAuditTrailForStudent(studentId, tenantId);

      res.status(200).json({
        success: true,
        data: auditTrails
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get audit trail for a session
   */
  async getAuditTrailForSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const auditTrails = await teacherReviewService.getAuditTrailForSession(sessionId, tenantId);

      res.status(200).json({
        success: true,
        data: auditTrails
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get review dashboard data for a session
   */
  async getReviewDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const dashboard = await teacherReviewService.getReviewDashboard(sessionId, tenantId);

      res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk accept attendance for a session
   */
  async bulkAcceptAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = bulkAcceptSchema.parse(req.body);
      const tenantId = req.user?.tenantId;
      const teacherId = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      if (!teacherId) {
        throw new AppError(401, 'User ID not found in token');
      }

      const result = await teacherReviewService.bulkAcceptAttendance(
        dto.sessionId,
        teacherId,
        tenantId,
        dto.notes
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Bulk attendance accepted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
