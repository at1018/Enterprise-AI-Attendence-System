import { PrismaClient, CheckpointType, PreliminaryAttendanceStatus, CheckpointStatus } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

const prisma = new PrismaClient();

// Confidence thresholds for attendance calculation
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85,
  MEDIUM: 0.65,
  LOW: 0.50
};

// Face quality thresholds
const QUALITY_THRESHOLDS = {
  ACCEPTABLE: 0.60,
  GOOD: 0.75,
  EXCELLENT: 0.90
};

export class CheckpointAttendanceService {
  /**
   * Create attendance checkpoints for a session
   */
  async createCheckpointsForSession(sessionId: string, tenantId: string): Promise<any> {
    // Verify session exists and belongs to tenant
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Session belongs to different tenant');
    }

    // Calculate checkpoint times based on session start/end
    const startTime = session.startTime || new Date();
    const endTime = session.endTime || new Date(startTime.getTime() + 45 * 60 * 1000); // Default 45 min
    const duration = endTime.getTime() - startTime.getTime();

    const checkpoints = [
      {
        sessionId,
        checkpointType: CheckpointType.START,
        scheduledTime: startTime,
        status: CheckpointStatus.PENDING
      },
      {
        sessionId,
        checkpointType: CheckpointType.MIDDLE,
        scheduledTime: new Date(startTime.getTime() + duration / 2),
        status: CheckpointStatus.PENDING
      },
      {
        sessionId,
        checkpointType: CheckpointType.END,
        scheduledTime: endTime,
        status: CheckpointStatus.PENDING
      }
    ];

    const createdCheckpoints = await Promise.all(
      checkpoints.map(cp => prisma.attendanceCheckpoint.create({ data: cp }))
    );

    return createdCheckpoints;
  }

  /**
   * Complete a checkpoint with recognition results
   */
  async completeCheckpoint(
    checkpointId: string,
    deviceId: string,
    recognitionResults: Array<{
      studentId: string;
      recognized: boolean;
      confidence?: number;
      faceQuality?: number;
      recognitionResultId?: string;
    }>,
    tenantId: string
  ): Promise<any> {
    // Verify checkpoint exists and belongs to tenant
    const checkpoint = await prisma.attendanceCheckpoint.findUnique({
      where: { id: checkpointId },
      include: { session: true }
    });

    if (!checkpoint) {
      throw new AppError(404, 'Checkpoint not found');
    }

    if (checkpoint.session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Checkpoint belongs to different tenant');
    }

    if (checkpoint.status === CheckpointStatus.COMPLETED) {
      throw new AppError(400, 'Checkpoint already completed');
    }

    // Create checkpoint records for each recognition result
    const records = await Promise.all(
      recognitionResults.map(result =>
        prisma.checkpointRecord.create({
          data: {
            checkpointId,
            studentId: result.studentId,
            tenantId,
            recognized: result.recognized,
            confidence: result.confidence,
            faceQuality: result.faceQuality,
            recognitionResultId: result.recognitionResultId,
            exceptionReason: !result.recognized ? 'Not recognized' : undefined
          }
        })
      )
    );

    // Update checkpoint statistics
    const recognizedCount = records.filter(r => r.recognized).length;
    const unknownCount = records.filter(r => !r.recognized).length;
    const lowConfidenceCount = records.filter(
      r => r.recognized && r.confidence && r.confidence < CONFIDENCE_THRESHOLDS.MEDIUM
    ).length;

    const updatedCheckpoint = await prisma.attendanceCheckpoint.update({
      where: { id: checkpointId },
      data: {
        status: CheckpointStatus.COMPLETED,
        actualTime: new Date(),
        deviceId,
        totalStudents: records.length,
        recognizedCount,
        unknownCount,
        lowConfidenceCount
      }
    });

    return { checkpoint: updatedCheckpoint, records };
  }

  /**
   * Calculate preliminary attendance for a session based on all checkpoints
   */
  async calculatePreliminaryAttendance(sessionId: string, tenantId: string): Promise<any> {
    // Verify session exists and belongs to tenant
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Session belongs to different tenant');
    }

    // Get enrolled students for the class
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classId: session.classId,
        tenantId,
        isActive: true
      },
      include: {
        student: true
      }
    });

    // Get all checkpoints for the session
    const checkpoints = await prisma.attendanceCheckpoint.findMany({
      where: { sessionId },
      include: {
        checkpointRecords: true
      },
      orderBy: { scheduledTime: 'asc' }
    });

    if (checkpoints.length === 0) {
      throw new AppError(400, 'No checkpoints found for session');
    }

    // Calculate preliminary attendance for each student
    const preliminaryAttendances = await Promise.all(
      enrollments.map(async (enrollment: any) => {
        const studentId = enrollment.student.id;

        // Get recognition status for each checkpoint
        const startCheckpoint = checkpoints.find(cp => cp.checkpointType === CheckpointType.START);
        const middleCheckpoint = checkpoints.find(cp => cp.checkpointType === CheckpointType.MIDDLE);
        const endCheckpoint = checkpoints.find(cp => cp.checkpointType === CheckpointType.END);

        const startRecognized = this.isStudentRecognizedAtCheckpoint(startCheckpoint, studentId);
        const middleRecognized = this.isStudentRecognizedAtCheckpoint(middleCheckpoint, studentId);
        const endRecognized = this.isStudentRecognizedAtCheckpoint(endCheckpoint, studentId);

        // Calculate overall confidence
        const overallConfidence = this.calculateOverallConfidence(
          startCheckpoint,
          middleCheckpoint,
          endCheckpoint,
          studentId
        );

        // Determine preliminary status
        const { status, exceptionReason, needsReview } = this.determinePreliminaryStatus(
          startRecognized,
          middleRecognized,
          endRecognized,
          overallConfidence,
          checkpoints
        );

        // Create or update preliminary attendance record
        const preliminaryAttendance = await prisma.preliminaryAttendance.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId
            }
          },
          update: {
            status,
            startRecognized,
            middleRecognized,
            endRecognized,
            overallConfidence,
            exceptionReason,
            needsReview
          },
          create: {
            sessionId,
            studentId,
            tenantId,
            status,
            startRecognized,
            middleRecognized,
            endRecognized,
            overallConfidence,
            exceptionReason,
            needsReview
          }
        });

        return preliminaryAttendance;
      })
    );

    return preliminaryAttendances;
  }

  /**
   * Check if student was recognized at a specific checkpoint
   */
  private isStudentRecognizedAtCheckpoint(checkpoint: any, studentId: string): boolean {
    if (!checkpoint) return false;

    const record = checkpoint.checkpointRecords.find(
      (r: any) => r.studentId === studentId
    );

    if (!record) return false;

    // Only count as recognized if confidence is above threshold
    if (record.confidence && record.confidence < CONFIDENCE_THRESHOLDS.MEDIUM) {
      return false;
    }

    return record.recognized;
  }

  /**
   * Calculate overall confidence across all checkpoints
   */
  private calculateOverallConfidence(
    startCheckpoint: any,
    middleCheckpoint: any,
    endCheckpoint: any,
    studentId: string
  ): number | null {
    const confidences: number[] = [];

    [startCheckpoint, middleCheckpoint, endCheckpoint].forEach(checkpoint => {
      if (checkpoint) {
        const record = checkpoint.checkpointRecords.find(
          (r: any) => r.studentId === studentId
        );
        if (record && record.confidence) {
          confidences.push(record.confidence);
        }
      }
    });

    if (confidences.length === 0) return null;

    // Average confidence across all recognized checkpoints
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  /**
   * Determine preliminary attendance status based on checkpoint recognition
   */
  private determinePreliminaryStatus(
    startRecognized: boolean,
    middleRecognized: boolean,
    endRecognized: boolean,
    overallConfidence: number | null,
    checkpoints: any[]
  ): { status: PreliminaryAttendanceStatus; exceptionReason?: string; needsReview: boolean } {
    const recognizedCount = [startRecognized, middleRecognized, endRecognized].filter(Boolean).length;
    const totalCheckpoints = checkpoints.length;

    // All three checkpoints recognized with good confidence
    if (recognizedCount === totalCheckpoints && overallConfidence && overallConfidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return {
        status: PreliminaryAttendanceStatus.AI_VERIFIED_PRESENT,
        needsReview: false
      };
    }

    // All three checkpoints recognized but lower confidence
    if (recognizedCount === totalCheckpoints && overallConfidence && overallConfidence < CONFIDENCE_THRESHOLDS.HIGH) {
      return {
        status: PreliminaryAttendanceStatus.NEEDS_REVIEW,
        exceptionReason: 'Low confidence recognition',
        needsReview: true
      };
    }

    // Two out of three checkpoints recognized
    if (recognizedCount >= 2) {
      return {
        status: PreliminaryAttendanceStatus.ATTENDANCE_EXCEPTION,
        exceptionReason: `${recognizedCount}/${totalCheckpoints} checkpoints recognized`,
        needsReview: true
      };
    }

    // One or zero checkpoints recognized
    if (recognizedCount === 1) {
      return {
        status: PreliminaryAttendanceStatus.ATTENDANCE_EXCEPTION,
        exceptionReason: 'Only one checkpoint recognized',
        needsReview: true
      };
    }

    // No checkpoints recognized
    return {
      status: PreliminaryAttendanceStatus.INSUFFICIENT_EVIDENCE,
      exceptionReason: 'No checkpoints recognized',
      needsReview: true
    };
  }

  /**
   * Get checkpoint records for a session
   */
  async getCheckpointRecords(sessionId: string, tenantId: string): Promise<any> {
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Session belongs to different tenant');
    }

    const checkpoints = await prisma.attendanceCheckpoint.findMany({
      where: { sessionId },
      include: {
        checkpointRecords: true
      },
      orderBy: { scheduledTime: 'asc' }
    });

    return checkpoints;
  }

  /**
   * Get preliminary attendance for a session
   */
  async getPreliminaryAttendance(sessionId: string, tenantId: string): Promise<any> {
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Session belongs to different tenant');
    }

    const preliminaryAttendances = await prisma.preliminaryAttendance.findMany({
      where: { sessionId },
      include: {
        student: true
      },
      orderBy: [
        { needsReview: 'desc' },
        { status: 'asc' }
      ]
    });

    return preliminaryAttendances;
  }

  /**
   * Get preliminary attendance for a specific student
   */
  async getPreliminaryAttendanceByStudent(studentId: string, tenantId: string): Promise<any> {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    const preliminaryAttendances = await prisma.preliminaryAttendance.findMany({
      where: { studentId, tenantId },
      include: {
        session: true
      },
      orderBy: { session: { date: 'desc' } }
    });

    return preliminaryAttendances;
  }

  /**
   * Mark preliminary attendance as reviewed
   */
  async markAsReviewed(
    preliminaryAttendanceId: string,
    reviewedBy: string,
    finalStatus: string,
    tenantId: string
  ): Promise<any> {
    const preliminaryAttendance = await prisma.preliminaryAttendance.findUnique({
      where: { id: preliminaryAttendanceId },
      include: { session: true }
    });

    if (!preliminaryAttendance) {
      throw new AppError(404, 'Preliminary attendance not found');
    }

    if (preliminaryAttendance.session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Preliminary attendance belongs to different tenant');
    }

    const updated = await prisma.preliminaryAttendance.update({
      where: { id: preliminaryAttendanceId },
      data: {
        reviewedBy,
        reviewedAt: new Date(),
        finalStatus,
        needsReview: false
      }
    });

    return updated;
  }

  /**
   * Get sessions needing review
   */
  async getSessionsNeedingReview(tenantId: string): Promise<any> {
    const sessionsNeedingReview = await prisma.preliminaryAttendance.findMany({
      where: {
        tenantId,
        needsReview: true
      },
      include: {
        session: true,
        student: true
      },
      orderBy: { session: { date: 'desc' } }
    });

    // Group by session
    const sessionsMap = new Map();
    sessionsNeedingReview.forEach(pa => {
      if (!sessionsMap.has(pa.sessionId)) {
        sessionsMap.set(pa.sessionId, {
          session: pa.session,
          studentsNeedingReview: []
        });
      }
      sessionsMap.get(pa.sessionId).studentsNeedingReview.push(pa.student);
    });

    return Array.from(sessionsMap.values());
  }
}
