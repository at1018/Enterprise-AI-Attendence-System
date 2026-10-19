import { Request, Response, NextFunction } from 'express';
import { FaceEnrollmentService } from './faceEnrollment.service';
import { faceEnrollmentSchema, deleteFaceEnrollmentSchema } from './dto/faceEnrollment.dto';

export class FaceEnrollmentController {
  constructor(private faceEnrollmentService: FaceEnrollmentService) {}

  /**
   * Enroll a face for a student
   */
  enrollFace = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = faceEnrollmentSchema.parse(req.body);
      const enrollment = await this.faceEnrollmentService.enrollFace(dto);
      res.status(201).json(enrollment);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get face enrollment by student ID
   */
  getEnrollmentByStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const tenantSecret = req.body.tenantSecret || req.headers['x-tenant-secret'] as string;
      
      if (!tenantSecret) {
        return res.status(400).json({ error: 'Tenant secret required for decryption' });
      }
      
      const enrollment = await this.faceEnrollmentService.getEnrollmentByStudent(
        studentId,
        tenantId,
        tenantSecret
      );
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all enrollments for a tenant
   */
  getEnrollmentsByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { activeOnly } = req.query;
      const enrollments = await this.faceEnrollmentService.getEnrollmentsByTenant(
        tenantId,
        activeOnly === 'true'
      );
      res.json({ enrollments });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deactivate face enrollment
   */
  deactivateEnrollment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const enrollment = await this.faceEnrollmentService.deactivateEnrollment(studentId, tenantId);
      res.json(enrollment);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete face enrollment with audit trail
   */
  deleteEnrollment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = deleteFaceEnrollmentSchema.parse(req.body);
      const result = await this.faceEnrollmentService.deleteEnrollment(
        dto.studentId,
        dto.tenantId,
        dto.deletedBy,
        dto.deletionReason,
        dto.authorizationLevel
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
