import { Request, Response, NextFunction } from 'express';
import { StudentAttendanceSummaryService } from './studentAttendanceSummary.service';
import { AppError } from '../../common/middleware/error.middleware';

export class StudentAttendanceSummaryController {
  private studentAttendanceSummaryService: StudentAttendanceSummaryService;

  constructor(studentAttendanceSummaryService: StudentAttendanceSummaryService) {
    this.studentAttendanceSummaryService = studentAttendanceSummaryService;
  }

  async calculateStudentSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, academicYearId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const summary = await this.studentAttendanceSummaryService.calculateStudentSummary(
        studentId,
        academicYearId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getStudentSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, academicYearId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const summary = await this.studentAttendanceSummaryService.getStudentAttendanceSummary(
        studentId,
        academicYearId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  }

  async getSummariesByClass(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { classId, academicYearId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const summaries = await this.studentAttendanceSummaryService.getSummariesByClass(
        classId,
        academicYearId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: summaries,
        count: summaries.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowAttendanceStudents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { academicYearId } = req.params;
      const { threshold } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const summaries = await this.studentAttendanceSummaryService.getLowAttendanceStudents(
        academicYearId,
        parseFloat(threshold as string) || 75,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: summaries,
        count: summaries.length
      });
    } catch (error) {
      next(error);
    }
  }
}