import { Request, Response, NextFunction } from 'express';
import { AttendanceReportService } from './attendanceReport.service';
import { AppError } from '../../common/middleware/error.middleware';

export class AttendanceReportController {
  private attendanceReportService: AttendanceReportService;

  constructor(attendanceReportService: AttendanceReportService) {
    this.attendanceReportService = attendanceReportService;
  }

  async createAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await this.attendanceReportService.createAttendanceReport(req.body);

      res.status(201).json({
        success: true,
        message: 'Attendance report created successfully',
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const report = await this.attendanceReportService.getAttendanceReportById(id, tenantId);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      next(error);
    }
  }

  async getReportsByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { startDate, endDate, reportType } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const reports = await this.attendanceReportService.getReportsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
        tenantId,
        reportType as string
      );

      res.status(200).json({
        success: true,
        data: reports,
        count: reports.length
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttendanceReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.attendanceReportService.deleteAttendanceReport(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}