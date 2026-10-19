import { Request, Response, NextFunction } from 'express';
import { AttendanceEvidenceService } from './attendanceEvidence.service';
import { AppError } from '../../common/middleware/error.middleware';

export class AttendanceEvidenceController {
  private attendanceEvidenceService: AttendanceEvidenceService;

  constructor(attendanceEvidenceService: AttendanceEvidenceService) {
    this.attendanceEvidenceService = attendanceEvidenceService;
  }

  async createAttendanceEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const evidence = await this.attendanceEvidenceService.createAttendanceEvidence(req.body);

      res.status(201).json({
        success: true,
        message: 'Attendance evidence created successfully',
        data: evidence
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceEvidenceById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const evidence = await this.attendanceEvidenceService.getAttendanceEvidenceById(id, tenantId);

      res.status(200).json({
        success: true,
        data: evidence
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvidenceByRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const evidences = await this.attendanceEvidenceService.getEvidenceByRecord(recordId, tenantId);

      res.status(200).json({
        success: true,
        data: evidences,
        count: evidences.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvidenceByCheckpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { recordId, checkpoint } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const evidences = await this.attendanceEvidenceService.getEvidenceByCheckpoint(
        recordId,
        parseInt(checkpoint),
        tenantId
      );

      res.status(200).json({
        success: true,
        data: evidences,
        count: evidences.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvidencesBySession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const evidences = await this.attendanceEvidenceService.getEvidencesBySession(sessionId, tenantId);

      res.status(200).json({
        success: true,
        data: evidences,
        count: evidences.length
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAttendanceEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const evidence = await this.attendanceEvidenceService.updateAttendanceEvidence(id, req.body, tenantId);

      res.status(200).json({
        success: true,
        message: 'Attendance evidence updated successfully',
        data: evidence
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteAttendanceEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant context not available');
      }

      const result = await this.attendanceEvidenceService.deleteAttendanceEvidence(id, tenantId);

      res.status(200).json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}