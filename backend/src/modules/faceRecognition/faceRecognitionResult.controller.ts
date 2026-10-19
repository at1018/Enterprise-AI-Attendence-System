import { Request, Response, NextFunction } from 'express';
import { FaceRecognitionResultService } from './faceRecognitionResult.service';

export class FaceRecognitionResultController {
  constructor(private faceRecognitionResultService: FaceRecognitionResultService) {}

  /**
   * Create a face recognition result
   */
  createResult = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        enrollmentId,
        tenantId,
        sessionId,
        deviceId,
        confidence,
        faceQuality,
        thumbnail,
        tenantSecret,
        metadata
      } = req.body;
      
      const result = await this.faceRecognitionResultService.createRecognitionResult({
        enrollmentId,
        tenantId,
        sessionId,
        deviceId,
        confidence,
        faceQuality,
        thumbnail,
        tenantSecret,
        metadata
      });
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recognition result by ID
   */
  getResultById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const tenantSecret = req.body.tenantSecret || req.headers['x-tenant-secret'] as string;
      
      if (!tenantSecret) {
        return res.status(400).json({ error: 'Tenant secret required for decryption' });
      }
      
      const result = await this.faceRecognitionResultService.getResultById(id, tenantId, tenantSecret);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recognition results by session
   */
  getResultsBySession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const results = await this.faceRecognitionResultService.getResultsBySession(sessionId, tenantId);
      res.json({ results });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recognition results by student
   */
  getResultsByStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { limit } = req.query;
      const results = await this.faceRecognitionResultService.getResultsByStudent(
        studentId,
        tenantId,
        limit ? parseInt(limit as string) : 50
      );
      res.json({ results });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recognition results by device
   */
  getResultsByDevice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deviceId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { limit } = req.query;
      const results = await this.faceRecognitionResultService.getResultsByDevice(
        deviceId,
        tenantId,
        limit ? parseInt(limit as string) : 100
      );
      res.json({ results });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get recognition results by tenant
   */
  getResultsByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { startDate, endDate, limit } = req.query;
      const results = await this.faceRecognitionResultService.getResultsByTenant(
        tenantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        limit ? parseInt(limit as string) : 100
      );
      res.json({ results });
    } catch (error) {
      next(error);
    }
  };
}
