import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export class BiometricConsentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Give biometric consent for a student
   */
  async giveConsent(data: {
    studentId: string;
    tenantId: string;
    consentGiven: boolean;
    consentedBy: string;
    consentMethod: string;
    notes?: string;
  }) {
    // Check if student exists
    const student = await this.prisma.student.findUnique({
      where: { id: data.studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    // Check if consent already exists
    const existingConsent = await this.prisma.biometricConsent.findUnique({
      where: {
        studentId_tenantId: {
          studentId: data.studentId,
          tenantId: data.tenantId
        }
      }
    });

    if (existingConsent) {
      // Update existing consent
      const updatedConsent = await this.prisma.biometricConsent.update({
        where: {
          studentId_tenantId: {
            studentId: data.studentId,
            tenantId: data.tenantId
          }
        },
        data: {
          consentGiven: data.consentGiven,
          consentDate: new Date(),
          consentedBy: data.consentedBy,
          consentMethod: data.consentMethod,
          withdrawnAt: null,
          withdrawnBy: null,
          notes: data.notes
        }
      });

      return updatedConsent;
    }

    // Create new consent
    const consent = await this.prisma.biometricConsent.create({
      data: {
        studentId: data.studentId,
        tenantId: data.tenantId,
        consentGiven: data.consentGiven,
        consentedBy: data.consentedBy,
        consentMethod: data.consentMethod,
        notes: data.notes
      }
    });

    return consent;
  }

  /**
   * Withdraw biometric consent
   */
  async withdrawConsent(studentId: string, tenantId: string, withdrawnBy: string) {
    const consent = await this.prisma.biometricConsent.findUnique({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      }
    });

    if (!consent) {
      throw new AppError(404, 'Biometric consent not found');
    }

    if (consent.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Consent belongs to different tenant');
    }

    const updatedConsent = await this.prisma.biometricConsent.update({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      },
      data: {
        consentGiven: false,
        withdrawnAt: new Date(),
        withdrawnBy
      }
    });

    return updatedConsent;
  }

  /**
   * Get consent by student ID
   */
  async getConsentByStudent(studentId: string, tenantId: string) {
    const consent = await this.prisma.biometricConsent.findUnique({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      }
    });

    if (!consent) {
      throw new AppError(404, 'Biometric consent not found');
    }

    if (consent.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Consent belongs to different tenant');
    }

    return consent;
  }

  /**
   * Get all consents for a tenant
   */
  async getConsentsByTenant(tenantId: string, consentGiven?: boolean) {
    const where: any = { tenantId };

    if (consentGiven !== undefined) {
      where.consentGiven = consentGiven;
    }

    const consents = await this.prisma.biometricConsent.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { consentDate: 'desc' }
    });

    return consents;
  }
}
