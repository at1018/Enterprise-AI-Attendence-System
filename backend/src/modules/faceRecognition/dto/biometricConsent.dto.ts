import { z } from 'zod';

/**
 * DTO for biometric consent
 */
export const biometricConsentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  consentGiven: z.boolean(),
  consentedBy: z.string().min(1, 'Consented by user ID is required'),
  consentMethod: z.string().min(1, 'Consent method is required'),
  notes: z.string().optional()
});

export type BiometricConsentDto = z.infer<typeof biometricConsentSchema>;
