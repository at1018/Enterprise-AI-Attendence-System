import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';
import { biometricEncryption } from './biometricEncryption.util';

export class FaceRecognitionResultService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a face recognition result
   */
  async createRecognitionResult(data: {
    enrollmentId: string;
    tenantId: string;
    sessionId?: string;
    deviceId: string;
    confidence: number;
    faceQuality: number;
    thumbnail?: string;
    tenantSecret: string;
    metadata?: any;
  }) {
    // Verify enrollment exists and belongs to tenant
    const enrollment = await this.prisma.faceEnrollment.findUnique({
      where: { id: data.enrollmentId }
    });

    if (!enrollment) {
      throw new AppError(404, 'Face enrollment not found');
    }

    if (enrollment.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Enrollment belongs to different tenant');
    }

    // Encrypt thumbnail if provided
    const encryptedThumbnail = data.thumbnail
      ? biometricEncryption.encrypt(data.thumbnail, data.tenantSecret)
      : null;

    // Create recognition result
    const result = await this.prisma.faceRecognitionResult.create({
      data: {
        enrollmentId: data.enrollmentId,
        tenantId: data.tenantId,
        sessionId: data.sessionId,
        deviceId: data.deviceId,
        confidence: data.confidence,
        faceQuality: data.faceQuality,
        thumbnail: encryptedThumbnail,
        metadata: data.metadata
      }
    });

    return result;
  }

  /**
   * Get recognition result by ID
   */
  async getResultById(id: string, tenantId: string, tenantSecret: string) {
    const result = await this.prisma.faceRecognitionResult.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      }
    });

    if (!result) {
      throw new AppError(404, 'Face recognition result not found');
    }

    if (result.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Result belongs to different tenant');
    }

    // Decrypt thumbnail if present
    const decryptedThumbnail = result.thumbnail
      ? biometricEncryption.decrypt(result.thumbnail, tenantSecret)
      : null;

    return {
      ...result,
      thumbnail: decryptedThumbnail
    };
  }

  /**
   * Get recognition results by session
   */
  async getResultsBySession(sessionId: string, tenantId: string) {
    const results = await this.prisma.faceRecognitionResult.findMany({
      where: {
        sessionId,
        tenantId
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      },
      orderBy: { recognizedAt: 'desc' }
    });

    // Don't return encrypted thumbnails in list view
    return results.map(result => ({
      ...result,
      thumbnail: null
    }));
  }

  /**
   * Get recognition results by student
   */
  async getResultsByStudent(studentId: string, tenantId: string, limit: number = 50) {
    // Get student's enrollment
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

    const results = await this.prisma.faceRecognitionResult.findMany({
      where: {
        enrollmentId: enrollment.id,
        tenantId
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      },
      orderBy: { recognizedAt: 'desc' },
      take: limit
    });

    // Don't return encrypted thumbnails in list view
    return results.map(result => ({
      ...result,
      thumbnail: null
    }));
  }

  /**
   * Get recognition results by device
   */
  async getResultsByDevice(deviceId: string, tenantId: string, limit: number = 100) {
    const results = await this.prisma.faceRecognitionResult.findMany({
      where: {
        deviceId,
        tenantId
      },
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      },
      orderBy: { recognizedAt: 'desc' },
      take: limit
    });

    // Don't return encrypted thumbnails in list view
    return results.map(result => ({
      ...result,
      thumbnail: null
    }));
  }

  /**
   * Get recognition results by tenant
   */
  async getResultsByTenant(tenantId: string, startDate?: Date, endDate?: Date, limit: number = 100) {
    const where: any = { tenantId };

    if (startDate || endDate) {
      where.recognizedAt = {};
      if (startDate) where.recognizedAt.gte = startDate;
      if (endDate) where.recognizedAt.lte = endDate;
    }

    const results = await this.prisma.faceRecognitionResult.findMany({
      where,
      include: {
        enrollment: {
          include: {
            student: true
          }
        }
      },
      orderBy: { recognizedAt: 'desc' },
      take: limit
    });

    // Don't return encrypted thumbnails in list view
    return results.map(result => ({
      ...result,
      thumbnail: null
    }));
  }
}
