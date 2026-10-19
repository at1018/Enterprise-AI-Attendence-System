import { Request, Response, NextFunction } from 'express';
import { CheckpointAttendanceService } from './checkpointAttendance.service';
import { AppError } from '../../common/middleware/error.middleware';
import {
  createCheckpointSchema,
  completeCheckpointSchema,
  markAsReviewedSchema,
  checkpointQuerySchema,
  preliminaryAttendanceQuerySchema
} from './dto/checkpointAttendance.dto';

const checkpointAttendanceService = new CheckpointAttendanceService();

export class CheckpointAttendanceController {
  /**
   * Create checkpoints for a session
   */
  async createCheckpoints(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const checkpoints = await checkpointAttendanceService.createCheckpointsForSession(sessionId, tenantId);

      res.status(201).json({
        success: true,
        data: checkpoints,
        message: 'Checkpoints created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete a checkpoint with recognition results
   */
  async completeCheckpoint(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = completeCheckpointSchema.parse(req.body);
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const result = await checkpointAttendanceService.completeCheckpoint(
        dto.checkpointId,
        dto.deviceId,
        dto.recognitionResults,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: result,
        message: 'Checkpoint completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate preliminary attendance for a session
   */
  async calculatePreliminaryAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const preliminaryAttendances = await checkpointAttendanceService.calculatePreliminaryAttendance(
        sessionId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: preliminaryAttendances,
        message: 'Preliminary attendance calculated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get checkpoint records for a session
   */
  async getCheckpointRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const checkpoints = await checkpointAttendanceService.getCheckpointRecords(sessionId, tenantId);

      res.status(200).json({
        success: true,
        data: checkpoints
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get preliminary attendance for a session
   */
  async getPreliminaryAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const preliminaryAttendances = await checkpointAttendanceService.getPreliminaryAttendance(
        sessionId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: preliminaryAttendances
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get preliminary attendance for a specific student
   */
  async getPreliminaryAttendanceByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const preliminaryAttendances = await checkpointAttendanceService.getPreliminaryAttendanceByStudent(
        studentId,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: preliminaryAttendances
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark preliminary attendance as reviewed
   */
  async markAsReviewed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = markAsReviewedSchema.parse(req.body);
      const tenantId = req.user?.tenantId;
      const reviewedBy = req.user?.userId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      if (!reviewedBy) {
        throw new AppError(401, 'User ID not found in token');
      }

      const updated = await checkpointAttendanceService.markAsReviewed(
        dto.preliminaryAttendanceId,
        reviewedBy,
        dto.finalStatus,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Preliminary attendance marked as reviewed'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sessions needing review
   */
  async getSessionsNeedingReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        throw new AppError(401, 'Tenant ID not found in token');
      }

      const sessions = await checkpointAttendanceService.getSessionsNeedingReview(tenantId);

      res.status(200).json({
        success: true,
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }
}
