import { Router } from 'express';
import { BiometricConsentController } from './biometricConsent.controller';

export function createBiometricConsentRoutes(biometricConsentController: BiometricConsentController): Router {
  const router = Router();

  // Give consent
  router.post('/consent', biometricConsentController.giveConsent);

  // Withdraw consent
  router.put('/consent/:studentId/withdraw', biometricConsentController.withdrawConsent);

  // Get consent by student
  router.get('/consent/student/:studentId', biometricConsentController.getConsentByStudent);

  // Get all consents for tenant
  router.get('/consent', biometricConsentController.getConsentsByTenant);

  return router;
}
