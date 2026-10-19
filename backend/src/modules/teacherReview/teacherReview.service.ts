import { PrismaClient } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

const prisma = new PrismaClient();

export class TeacherReviewService {
  /**
   * Review and accept AI-generated preliminary attendance
   */
  async acceptAttendance(
    preliminaryAttendanceId: string,
    teacherId: string,
    tenantId: string,
    notes?: string
  ): Promise<any> {
    // Verify preliminary attendance exists and belongs to tenant
    const preliminaryAttendance = await prisma.preliminaryAttendance.findUnique({
      where: { id: preliminaryAttendanceId },
      include: { session: true }
    });

    if (!preliminaryAttendance) {
      throw new AppError(404, 'Preliminary attendance not found');
    }

    if (preliminaryAttendance.session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance belongs to different tenant');
    }

    // Check if teacher is authorized for this session
    if (!this.isTeacherAuthorized(teacherId, preliminaryAttendance.session)) {
      throw new AppError(403, 'Teacher not authorized to review this attendance');
    }

    // Check if already confirmed
    if (preliminaryAttendance.isConfirmed) {
      throw new AppError(400, 'Attendance already confirmed');
    }

    // Create audit trail
    await prisma.attendanceAuditTrail.create({
      data: {
        preliminaryAttendanceId,
        studentId: preliminaryAttendance.studentId,
        tenantId,
        previousStatus: preliminaryAttendance.status,
        newStatus: preliminaryAttendance.status, // Accepting means keeping the AI status
        changeReason: 'Teacher accepted AI result',
        changedBy: teacherId,
        changeSource: 'TEACHER_REVIEW',
        notes
      }
    });

    // Update preliminary attendance
    const updated = await prisma.preliminaryAttendance.update({
      where: { id: preliminaryAttendanceId },
      data: {
        reviewedBy: teacherId,
        reviewedAt: new Date(),
        finalStatus: preliminaryAttendance.status,
        notes,
        needsReview: false
      }
    });

    return updated;
  }

  /**
   * Override AI-generated preliminary attendance
   */
  async overrideAttendance(
    preliminaryAttendanceId: string,
    teacherId: string,
    newStatus: string,
    reason: string,
    tenantId: string,
    notes?: string
  ): Promise<any> {
    // Verify preliminary attendance exists and belongs to tenant
    const preliminaryAttendance = await prisma.preliminaryAttendance.findUnique({
      where: { id: preliminaryAttendanceId },
      include: { session: true }
    });

    if (!preliminaryAttendance) {
      throw new AppError(404, 'Preliminary attendance not found');
    }

    if (preliminaryAttendance.session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Attendance belongs to different tenant');
    }

    // Check if teacher is authorized for this session
    if (!this.isTeacherAuthorized(teacherId, preliminaryAttendance.session)) {
      throw new AppError(403, 'Teacher not authorized to review this attendance');
    }

    // Check if already confirmed
    if (preliminaryAttendance.isConfirmed) {
      throw new AppError(400, 'Attendance already confirmed - cannot override without proper authorization');
    }

    // Mandatory reason validation
    if (!reason || reason.trim().length === 0) {
      throw new AppError(400, 'Override reason is required');
    }

    // Create audit trail
    await prisma.attendanceAuditTrail.create({
      data: {
        preliminaryAttendanceId,
        studentId: preliminaryAttendance.studentId,
        tenantId,
        previousStatus: preliminaryAttendance.status,
        newStatus,
        changeReason: reason,
        changedBy: teacherId,
        changeSource: 'TEACHER_OVERRIDE',
        notes
      }
    });

    // Update preliminary attendance
    const updated = await prisma.preliminaryAttendance.update({
      where: { id: preliminaryAttendanceId },
      data: {
        reviewedBy: teacherId,
        reviewedAt: new Date(),
        finalStatus: newStatus,
        notes,
        needsReview: false
      }
    });

    return updated;
  }

  /**
   * Confirm final attendance for a session
   */
  async confirmSessionAttendance(
    sessionId: string,
    teacherId: string,
    tenantId: string
  ): Promise<any> {
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

    // Check if teacher is authorized for this session
    if (!this.isTeacherAuthorized(teacherId, session)) {
      throw new AppError(403, 'Teacher not authorized to confirm this session');
    }

    // Get all preliminary attendance for the session
    const preliminaryAttendances = await prisma.preliminaryAttendance.findMany({
      where: { sessionId }
    });

    // Check if all are reviewed
    const unreviewed = preliminaryAttendances.filter(pa => pa.needsReview);
    if (unreviewed.length > 0) {
      throw new AppError(400, `Cannot confirm session: ${unreviewed.length} students still need review`);
    }

    // Confirm all preliminary attendances
    const confirmed = await Promise.all(
      preliminaryAttendances.map((pa: any) =>
        prisma.preliminaryAttendance.update({
          where: { id: pa.id },
          data: {
            isConfirmed: true,
            confirmedAt: new Date(),
            confirmedBy: teacherId
          }
        })
      )
    );

    return confirmed;
  }

  /**
   * Get audit trail for a student
   */
  async getAuditTrailForStudent(studentId: string, tenantId: string): Promise<any> {
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    const auditTrails = await prisma.attendanceAuditTrail.findMany({
      where: { studentId, tenantId },
      include: {
        preliminaryAttendance: {
          include: {
            session: true
          }
        }
      },
      orderBy: { changedAt: 'desc' }
    });

    return auditTrails;
  }

  /**
   * Get audit trail for a session
   */
  async getAuditTrailForSession(sessionId: string, tenantId: string): Promise<any> {
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AppError(404, 'Attendance session not found');
    }

    if (session.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Session belongs to different tenant');
    }

    const auditTrails = await prisma.attendanceAuditTrail.findMany({
      where: {
        preliminaryAttendance: {
          sessionId
        },
        tenantId
      },
      include: {
        preliminaryAttendance: {
          include: {
            student: true
          }
        }
      },
      orderBy: { changedAt: 'desc' }
    });

    return auditTrails;
  }

  /**
   * Get review dashboard data for a session
   */
  async getReviewDashboard(sessionId: string, tenantId: string): Promise<any> {
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
      }
    });

    const stats = {
      totalStudents: preliminaryAttendances.length,
      aiVerifiedPresent: preliminaryAttendances.filter(pa => pa.status === 'AI_VERIFIED_PRESENT').length,
      needsReview: preliminaryAttendances.filter(pa => pa.needsReview).length,
      attendanceException: preliminaryAttendances.filter(pa => pa.status === 'ATTENDANCE_EXCEPTION').length,
      insufficientEvidence: preliminaryAttendances.filter(pa => pa.status === 'INSUFFICIENT_EVIDENCE').length,
      reviewed: preliminaryAttendances.filter(pa => pa.reviewedBy).length,
      confirmed: preliminaryAttendances.filter(pa => pa.isConfirmed).length
    };

    return {
      session,
      stats,
      students: preliminaryAttendances
    };
  }

  /**
   * Check if teacher is authorized for a session
   */
  private isTeacherAuthorized(teacherId: string, session: any): boolean {
    // Teacher is authorized if they are the session teacher
    if (session.teacherId === teacherId) {
      return true;
    }

    // TODO: Add additional authorization logic based on school policy
    // For example: class teachers, principals, school admins might also be authorized

    return false;
  }

  /**
   * Bulk accept attendance for a session
   */
  async bulkAcceptAttendance(
    sessionId: string,
    teacherId: string,
    tenantId: string,
    notes?: string
  ): Promise<any> {
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

    // Check if teacher is authorized
    if (!this.isTeacherAuthorized(teacherId, session)) {
      throw new AppError(403, 'Teacher not authorized to review this session');
    }

    // Get all preliminary attendance for the session
    const preliminaryAttendances = await prisma.preliminaryAttendance.findMany({
      where: { sessionId }
    });

    // Bulk accept all
    const results = await Promise.all(
      preliminaryAttendances.map(pa =>
        this.acceptAttendance(pa.id, teacherId, tenantId, notes)
      )
    );

    return results;
  }
}
