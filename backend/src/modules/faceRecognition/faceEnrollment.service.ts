import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';
import { biometricEncryption } from './biometricEncryption.util';

export class FaceEnrollmentService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Enroll a face for a student
   */
  async enrollFace(data: {
    studentId: string;
    tenantId: string;
    faceEmbedding: number[];
    faceThumbnail?: string;
    qualityScore: number;
    deviceId?: string;
    tenantSecret: string; // For encryption
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

    // Check biometric consent
    const consent = await this.prisma.biometricConsent.findUnique({
      where: {
        studentId_tenantId: {
          studentId: data.studentId,
          tenantId: data.tenantId
        }
      }
    });

    if (!consent || !consent.consentGiven) {
      throw new AppError(403, 'Biometric consent not given for this student');
    }

    // Check if already enrolled
    const existingEnrollment = await this.prisma.faceEnrollment.findUnique({
      where: {
        studentId_tenantId: {
          studentId: data.studentId,
          tenantId: data.tenantId
        }
      }
    });

    if (existingEnrollment) {
      // Update existing enrollment
      const encryptedEmbedding = biometricEncryption.encryptEmbedding(
        data.faceEmbedding,
        data.tenantSecret
      );

      const encryptedThumbnail = data.faceThumbnail
        ? biometricEncryption.encrypt(data.faceThumbnail, data.tenantSecret)
        : null;

      const updatedEnrollment = await this.prisma.faceEnrollment.update({
        where: {
          studentId_tenantId: {
            studentId: data.studentId,
            tenantId: data.tenantId
          }
        },
        data: {
          faceEmbedding: encryptedEmbedding,
          faceThumbnail: encryptedThumbnail,
          qualityScore: data.qualityScore,
          deviceId: data.deviceId,
          isActive: true,
          enrollmentDate: new Date(),
          updatedAt: new Date()
        }
      });

      return updatedEnrollment;
    }

    // Calculate retention date (e.g., 1 year from now)
    const retentionUntil = new Date();
    retentionUntil.setFullYear(retentionUntil.getFullYear() + 1);

    // Encrypt biometric data
    const encryptedEmbedding = biometricEncryption.encryptEmbedding(
      data.faceEmbedding,
      data.tenantSecret
    );

    const encryptedThumbnail = data.faceThumbnail
      ? biometricEncryption.encrypt(data.faceThumbnail, data.tenantSecret)
      : null;

    // Create new enrollment
    const enrollment = await this.prisma.faceEnrollment.create({
      data: {
        studentId: data.studentId,
        tenantId: data.tenantId,
        faceEmbedding: encryptedEmbedding,
        faceThumbnail: encryptedThumbnail,
        qualityScore: data.qualityScore,
        deviceId: data.deviceId,
        retentionUntil,
        isActive: true
      }
    });

    return enrollment;
  }

  /**
   * Get face enrollment by student ID
   */
  async getEnrollmentByStudent(studentId: string, tenantId: string, tenantSecret: string) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      }
    });

    if (!enrollment) {
      throw new AppError(404, 'Face enrollment not found');
    }

    if (enrollment.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Enrollment belongs to different tenant');
    }

    // Decrypt biometric data
    const decryptedEmbedding = biometricEncryption.decryptEmbedding(
      enrollment.faceEmbedding,
      tenantSecret
    );

    const decryptedThumbnail = enrollment.faceThumbnail
      ? biometricEncryption.decrypt(enrollment.faceThumbnail, tenantSecret)
      : null;

    return {
      ...enrollment,
      faceEmbedding: decryptedEmbedding,
      faceThumbnail: decryptedThumbnail
    };
  }

  /**
   * Get all enrollments for a tenant
   */
  async getEnrollmentsByTenant(tenantId: string, activeOnly: boolean = true) {
    const where: any = { tenantId };

    if (activeOnly) {
      where.isActive = true;
    }

    const enrollments = await this.prisma.faceEnrollment.findMany({
      where,
      include: {
        student: true
      },
      orderBy: { enrollmentDate: 'desc' }
    });

    // Don't return encrypted biometric data in list view
    return enrollments.map(enrollment => ({
      ...enrollment,
      faceEmbedding: null,
      faceThumbnail: null
    }));
  }

  /**
   * Deactivate face enrollment
   */
  async deactivateEnrollment(studentId: string, tenantId: string) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      }
    });

    if (!enrollment) {
      throw new AppError(404, 'Face enrollment not found');
    }

    if (enrollment.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Enrollment belongs to different tenant');
    }

    const updatedEnrollment = await this.prisma.faceEnrollment.update({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    });

    return updatedEnrollment;
  }

  /**
   * Delete face enrollment with audit trail
   */
  async deleteEnrollment(
    studentId: string,
    tenantId: string,
    deletedBy: string,
    deletionReason: string,
    authorizationLevel: string
  ) {
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      }
    });

    if (!enrollment) {
      throw new AppError(404, 'Face enrollment not found');
    }

    if (enrollment.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Enrollment belongs to different tenant');
    }

    // Create audit record
    await this.prisma.biometricDeletionAudit.create({
      data: {
        studentId,
        tenantId,
        enrollmentId: enrollment.id,
        deletedBy,
        deletionReason,
        authorizationLevel,
        verified: false
      }
    });

    // Delete enrollment
    await this.prisma.faceEnrollment.delete({
      where: {
        studentId_tenantId: {
          studentId,
          tenantId
        }
      }
    });

    return { message: 'Face enrollment deleted successfully' };
  }
}
