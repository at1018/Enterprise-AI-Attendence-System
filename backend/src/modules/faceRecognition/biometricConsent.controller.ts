import { Request, Response, NextFunction } from 'express';
import { BiometricConsentService } from './biometricConsent.service';
import { biometricConsentSchema } from './dto/biometricConsent.dto';

export class BiometricConsentController {
  constructor(private biometricConsentService: BiometricConsentService) {}

  /**
   * Give biometric consent for a student
   */
  giveConsent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = biometricConsentSchema.parse(req.body);
      const consent = await this.biometricConsentService.giveConsent(dto);
      res.status(201).json(consent);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Withdraw biometric consent
   */
  withdrawConsent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const withdrawnBy = req.user?.userId || req.body.withdrawnBy;
      
      if (!withdrawnBy) {
        return res.status(400).json({ error: 'Withdrawn by user ID is required' });
      }
      
      const consent = await this.biometricConsentService.withdrawConsent(studentId, tenantId, withdrawnBy);
      res.json(consent);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get consent by student ID
   */
  getConsentByStudent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { studentId } = req.params;
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const consent = await this.biometricConsentService.getConsentByStudent(studentId, tenantId);
      res.json(consent);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all consents for a tenant
   */
  getConsentsByTenant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.user?.tenantId || req.body.tenantId;
      const { consentGiven } = req.query;
      const consents = await this.biometricConsentService.getConsentsByTenant(
        tenantId,
        consentGiven === 'true' ? true : consentGiven === 'false' ? false : undefined
      );
      res.json({ consents });
    } catch (error) {
      next(error);
    }
  };
}
