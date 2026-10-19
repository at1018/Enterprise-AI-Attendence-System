import { Request, Response, NextFunction } from 'express';
import { AttendanceRecordService } from './attendanceRecord.service';
import { AppError } from '../../common/middleware/error.middleware';

export class AttendanceRecordController {
  private attendanceRecordService: AttendanceRecordService;

  constructor(attendanceRecordService: AttendanceRecordService) {
    this.attendanceRecordService = attendanceRecordService;
  }

  async createAttendanceRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await this.attendanceRecordService.createAttendanceRecord(req.body);

      res.status(201).json({
        success: true,
        message: 'Attendance record created successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceRecordById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const record = await this.attendanceRecordService.getAttendanceRecordById(id, tenantId);

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceRecordsBySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const records = await this.attendanceRecordService.getAttendanceRecordsBySession(sessionId, tenantId);

      res.status(200).json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceRecordsByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId;
      const { startDate, endDate } = req.query;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const records = await this.attendanceRecordService.getAttendanceRecordsByStudent(
        studentId,
        tenantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.status(200).json({
        success: true,
        data: records,
        count: records.length
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAttendanceRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const record = await this.attendanceRecordService.updateAttendanceRecord(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Attendance record updated successfully',
        data: record
      });
    } catch (error) {
      next(error);
    }
  }

  async bulkCreateAttendanceRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, studentIds } = req.body;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.attendanceRecordService.bulkCreateAttendanceRecords(
        sessionId,
        studentIds,
        tenantId
      );

      res.status(201).json({
        success: true,
        message: 'Attendance records created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttendanceRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.attendanceRecordService.deleteAttendanceRecord(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}