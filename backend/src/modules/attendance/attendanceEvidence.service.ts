import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

export interface CreateAttendanceEvidenceDto {
  recordId: string;
  checkpoint: number; // 1, 2, or 3
  imageUrl?: string;
  faceData?: string;
  confidence?: number;
  cameraId?: string;
  isMatched?: boolean;
  matchedStudentId?: string;
  tenantId: string;
}

export class AttendanceEvidenceService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create a new attendance evidence
   */
  async createAttendanceEvidence(data: CreateAttendanceEvidenceDto) {
    // Validate checkpoint (1, 2, or 3)
    if (data.checkpoint < 1 || data.checkpoint > 3) {
      throw new AppError(400, 'Checkpoint must be 1, 2, or 3');
    }

    // Validate record exists and belongs to tenant
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: data.recordId }
    });

    if (!record) {
      throw new AppError(404, 'Attendance record not found');
    }

    if (record.tenantId !== data.tenantId) {
      throw new AppError(403, 'Access denied: Attendance record belongs to different tenant');
    }

    // Create attendance evidence
    const evidence = await this.prisma.attendanceEvidence.create({
      data: {
        recordId: data.recordId,
        checkpoint: data.checkpoint,
        imageUrl: data.imageUrl,
        faceData: data.faceData,
        confidence: data.confidence,
        cameraId: data.cameraId,
        isMatched: data.isMatched || false,
        matchedStudentId: data.matchedStudentId,
        tenantId: data.tenantId
      }
    });

    // Update evidence count on record
    await this.updateEvidenceCount(data.recordId, data.tenantId);

    return evidence;
  }

  /**
   * Get attendance evidence by ID
   */
  async getAttendanceEvidenceById(id: string, tenantId: string) {
    const evidence = await this.prisma.attendanceEvidence.findUnique({
      where: { id },
      include: {
        record: true
      }
    });

    if (!evidence) {
      throw new AppError(404, 'Attendance evidence not found');
    }

    if (evidence.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance evidence belongs to different tenant');
    }

    return evidence;
  }

  /**
   * Get evidence by attendance record
   */
  async getEvidenceByRecord(recordId: string, tenantId: string) {
    // Validate record exists and belongs to tenant
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      throw new AppError(404, 'Attendance record not found');
    }

    if (record.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance record belongs to different tenant');
    }

    const evidences = await this.prisma.attendanceEvidence.findMany({
      where: { recordId },
      orderBy: { checkpoint: 'asc' }
    });

    return evidences;
  }

  /**
   * Get evidence by checkpoint
   */
  async getEvidenceByCheckpoint(recordId: string, checkpoint: number, tenantId: string) {
    // Validate checkpoint
    if (checkpoint < 1 || checkpoint > 3) {
      throw new AppError(400, 'Checkpoint must be 1, 2, or 3');
    }

    // Validate record exists and belongs to tenant
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId }
    });

    if (!record) {
      throw new AppError(404, 'Attendance record not found');
    }

    if (record.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance record belongs to different tenant');
    }

    const evidences = await this.prisma.attendanceEvidence.findMany({
      where: {
        recordId,
        checkpoint
      },
      orderBy: { timestamp: 'desc' }
    });

    return evidences;
  }

  /**
   * Update attendance evidence
   */
  async updateAttendanceEvidence(id: string, data: Partial<CreateAttendanceEvidenceDto>, tenantId: string) {
    const evidence = await this.prisma.attendanceEvidence.findUnique({
      where: { id }
    });

    if (!evidence) {
      throw new AppError(404, 'Attendance evidence not found');
    }

    if (evidence.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance evidence belongs to different tenant');
    }

    // Validate checkpoint if provided
    if (data.checkpoint !== undefined && (data.checkpoint < 1 || data.checkpoint > 3)) {
      throw new AppError(400, 'Checkpoint must be 1, 2, or 3');
    }

    const updatedEvidence = await this.prisma.attendanceEvidence.update({
      where: { id },
      data
    });

    return updatedEvidence;
  }

  /**
   * Delete attendance evidence
   */
  async deleteAttendanceEvidence(id: string, tenantId: string) {
    const evidence = await this.prisma.attendanceEvidence.findUnique({
      where: { id }
    });

    if (!evidence) {
      throw new AppError(404, 'Attendance evidence not found');
    }

    if (evidence.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance evidence belongs to different tenant');
    }

    await this.prisma.attendanceEvidence.delete({
      where: { id }
    });

    // Update evidence count on record
    await this.updateEvidenceCount(evidence.recordId, tenantId);

    return { message: 'Attendance evidence deleted successfully' };
  }

  /**
   * Get all evidences for a session
   */
  async getEvidencesBySession(sessionId: string, tenantId: string) {
    // Validate session exists and belongs to tenant
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance session belongs to different tenant');
    }

    const evidences = await this.prisma.attendanceEvidence.findMany({
      where: {
        record: {
          sessionId
        }
      },
      include: {
        record: true
      },
      orderBy: { timestamp: 'desc' }
    });

    return evidences;
  }

  /**
   * Update evidence count helper
   */
  private async updateEvidenceCount(recordId: string, tenantId: string) {
    const count = await this.prisma.attendanceEvidence.count({
      where: { recordId }
    });

    await this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: { evidenceCount: count }
    });
  }
}