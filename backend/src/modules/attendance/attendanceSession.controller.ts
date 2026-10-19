import { Request, Response, NextFunction } from 'express';
import { AttendanceSessionService } from './attendanceSession.service';
import { AppError } from '../../common/middleware/error.middleware';

export class AttendanceSessionController {
  private attendanceSessionService: AttendanceSessionService;

  constructor(attendanceSessionService: AttendanceSessionService) {
    this.attendanceSessionService = attendanceSessionService;
  }

  async createAttendanceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const session = await this.attendanceSessionService.createAttendanceSession(req.body);

      res.status(201).json({
        success: true,
        message: 'Attendance session created successfully',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceSessionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const session = await this.attendanceSessionService.getAttendanceSessionById(id, tenantId);

      res.status(200).json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllAttendanceSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { classId, teacherId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const sessions = await this.attendanceSessionService.getAllAttendanceSessions(
        tenantId,
        classId as string,
        teacherId as string
      );

      res.status(200).json({
        success: true,
        data: sessions,
        count: sessions.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceSessionsByDateRange(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;
      const { startDate, endDate, classId, teacherId } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const sessions = await this.attendanceSessionService.getAttendanceSessionsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
        tenantId,
        classId as string,
        teacherId as string
      );

      res.status(200).json({
        success: true,
        data: sessions,
        count: sessions.length
      });
    } catch (error) {
      next(error);
    }
  }

  async startAttendanceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const session = await this.attendanceSessionService.startAttendanceSession(id, tenantId);

      res.status(200).json({
        success: true,
        message: 'Attendance session started successfully',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async completeAttendanceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;
      const completedBy = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const session = await this.attendanceSessionService.completeAttendanceSession(id, completedBy!, tenantId);

      res.status(200).json({
        success: true,
        message: 'Attendance session completed successfully',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelAttendanceSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const session = await this.attendanceSessionService.cancelAttendanceSession(id, tenantId);

      res.status(200).json({
        success: true,
        message: 'Attendance session cancelled successfully',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }
}