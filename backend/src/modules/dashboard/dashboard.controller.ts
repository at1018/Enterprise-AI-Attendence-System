import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { AppError } from '../../common/middleware/error.middleware';
import {
  teacherDashboardSchema,
  schoolAdminDashboardSchema,
  principalDashboardSchema,
  studentAttendanceHistorySchema,
  filteredAttendanceSchema
} from './dto/dashboard.dto';

const dashboardService = new DashboardService();

export class DashboardController {
  /**
   * Get teacher dashboard
   */
  async getTeacherDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = teacherDashboardSchema.parse(req.params);
      const tenantId = req.user?.tenantId;
      const teacherId = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      if (!teacherId) {
        throw new AppError(401, 'User ID not found in token');
      }

      const dashboard = await dashboardService.getTeacherDashboard(
        dto.sessionId,
        teacherId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get school admin dashboard
   */
  async getSchoolAdminDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = schoolAdminDashboardSchema.parse(req.query);
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const dashboard = await dashboardService.getSchoolAdminDashboard(
        tenantId,
        dto.academicYearId
      );

      res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get principal dashboard
   */
  async getPrincipalDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = principalDashboardSchema.parse(req.query);
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const dashboard = await dashboardService.getPrincipalDashboard(
        tenantId,
        dto.academicYearId
      );

      res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get student attendance history
   */
  async getStudentAttendanceHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = studentAttendanceHistorySchema.parse(req.params);
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const history = await dashboardService.getStudentAttendanceHistory(
        dto.studentId,
        tenantId,
        dto.academicYearId,
        dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dto.dateTo ? new Date(dto.dateTo) : undefined
      );

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export attendance as CSV
   */
  async exportAttendanceAsCSV(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;
      const teacherId = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const csvContent = await dashboardService.exportAttendanceAsCSV(sessionId, tenantId, teacherId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get filtered attendance records
   */
  async getFilteredAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = filteredAttendanceSchema.parse(req.query);
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const attendances = await dashboardService.getFilteredAttendance(tenantId, {
        classId: dto.classId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId,
        dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined,
        dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined,
        status: dto.status
      });

      res.status(200).json({
        success: true,
        data: attendances
      });
    } catch (error) {
      next(error);
    }
  }
}
