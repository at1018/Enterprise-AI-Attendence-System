import { Request, Response, NextFunction } from 'express';
import { ClassAttendanceAnalyticsService } from './classAttendanceAnalytics.service';
import { AppError } from '../../common/middleware/error.middleware';

export class ClassAttendanceAnalyticsController {
  private classAttendanceAnalyticsService: ClassAttendanceAnalyticsService;

  constructor(classAttendanceAnalyticsService: ClassAttendanceAnalyticsService) {
    this.classAttendanceAnalyticsService = classAttendanceAnalyticsService;
  }

  async calculateClassAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const { date } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const analytics = await this.classAttendanceAnalyticsService.calculateClassAnalytics(
        classId,
        new Date(date as string),
        tenantId
      );

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  async getClassAnalyticsByDate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const { date } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const analytics = await this.classAttendanceAnalyticsService.getClassAttendanceAnalyticsByDate(
        classId,
        new Date(date as string),
        tenantId
      );

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      next(error);
    }
  }

  async getClassAnalyticsByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const { startDate, endDate } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const analytics = await this.classAttendanceAnalyticsService.getClassAttendanceAnalyticsByDateRange(
        classId,
        new Date(startDate as string),
        new Date(endDate as string),
        tenantId
      );

      res.status(200).json({
        success: true,
        data: analytics,
        count: analytics.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getClassAttendanceTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId } = req.params;
      const { startDate, endDate } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const trends = await this.classAttendanceAnalyticsService.getClassAttendanceTrends(
        classId,
        new Date(startDate as string),
        new Date(endDate as string),
        tenantId
      );

      res.status(200).json({
        success: true,
        data: trends,
        count: trends.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getOverallStatistics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { startDate, endDate } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const statistics = await this.classAttendanceAnalyticsService.getOverallAttendanceStatistics(
        tenantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }
}