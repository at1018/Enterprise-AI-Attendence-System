import { PrismaClient, PreliminaryAttendanceStatus } from '@prisma/client';
import { AppError } from '../../common/middleware/error.middleware';

const prisma = new PrismaClient();

export class DashboardService {
  /**
   * Get teacher dashboard data for a specific session
   */
  async getTeacherDashboard(sessionId: string, teacherId: string, tenantId: string): Promise<any> {
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

    // Verify teacher is authorized
    if (session.teacherId !== teacherId) {
      throw new AppError(403, 'Teacher not authorized for this session');
    }

    // Get preliminary attendance for the session
    const preliminaryAttendances = await prisma.preliminaryAttendance.findMany({
      where: { sessionId },
      include: {
        student: true
      }
    });

    // Calculate metrics
    const totalStudents = preliminaryAttendances.length;
    const aiVerifiedPresent = preliminaryAttendances.filter((pa: any) => pa.status === 'AI_VERIFIED_PRESENT').length;
    const needsReview = preliminaryAttendances.filter((pa: any) => pa.needsReview).length;
    const attendanceException = preliminaryAttendances.filter((pa: any) => pa.status === 'ATTENDANCE_EXCEPTION').length;
    const insufficientEvidence = preliminaryAttendances.filter((pa: any) => pa.status === 'INSUFFICIENT_EVIDENCE').length;
    const reviewed = preliminaryAttendances.filter((pa: any) => pa.reviewedBy).length;
    const confirmed = preliminaryAttendances.filter((pa: any) => pa.isConfirmed).length;

    // Calculate attendance rate (excluding exceptions and insufficient evidence)
    const presentCount = aiVerifiedPresent + reviewed;
    const attendanceRate = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;

    return {
      session: {
        id: session.id,
        sessionId: session.sessionId,
        date: session.date,
        dayOfWeek: session.dayOfWeek,
        period: session.period,
        subjectId: session.subjectId,
        teacherId: session.teacherId,
        classroomId: session.classroomId
      },
      stats: {
        totalStudents,
        aiVerifiedPresent,
        needsReview,
        attendanceException,
        insufficientEvidence,
        reviewed,
        confirmed,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      },
      students: preliminaryAttendances
    };
  }

  /**
   * Get school admin dashboard metrics
   */
  async getSchoolAdminDashboard(tenantId: string, academicYearId?: string): Promise<any> {
    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    // Get school-wide metrics
    const academicYearFilter = academicYearId ? { academicYearId } : {};

    const totalStudents = await prisma.student.count({
      where: { tenantId, ...academicYearFilter, isActive: true }
    });

    const totalClasses = await prisma.class.count({
      where: { tenantId, ...academicYearFilter }
    });

    const totalTeachers = await prisma.teacher.count({
      where: { tenantId, ...academicYearFilter, isActive: true }
    });

    // Get attendance session stats
    const sessions = await prisma.attendanceSession.findMany({
      where: { tenantId, ...academicYearFilter }
    });

    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.isCompleted).length;

    // Get preliminary attendance stats
    const preliminaryAttendances = await prisma.preliminaryAttendance.findMany({
      where: {
        session: { tenantId, ...academicYearFilter }
      },
      include: {
        session: true
      }
    });

    const aiVerifiedPresent = preliminaryAttendances.filter((pa: any) => pa.status === 'AI_VERIFIED_PRESENT').length;
    const needsReview = preliminaryAttendances.filter((pa: any) => pa.needsReview).length;
    const attendanceException = preliminaryAttendances.filter((pa: any) => pa.status === 'ATTENDANCE_EXCEPTION').length;
    const insufficientEvidence = preliminaryAttendances.filter((pa: any) => pa.status === 'INSUFFICIENT_EVIDENCE').length;
    const totalAttendanceRecords = preliminaryAttendances.length;

    // Calculate percentages
    const aiVerifiedPercent = totalAttendanceRecords > 0 ? (aiVerifiedPresent / totalAttendanceRecords) * 100 : 0;
    const reviewPercent = totalAttendanceRecords > 0 ? (needsReview / totalAttendanceRecords) * 100 : 0;
    const exceptionPercent = totalAttendanceRecords > 0 ? (attendanceException / totalAttendanceRecords) * 100 : 0;

    // Get manual attendance count (no AI evidence)
    const manualAttendance = preliminaryAttendances.filter((pa: any) => 
      pa.status === 'INSUFFICIENT_EVIDENCE' && pa.reviewedBy
    ).length;
    const manualAttendancePercent = totalAttendanceRecords > 0 ? (manualAttendance / totalAttendanceRecords) * 100 : 0;

    // Calculate overall attendance rate
    const presentCount = aiVerifiedPresent + preliminaryAttendances.filter(pa => pa.finalStatus === 'PRESENT').length;
    const attendanceRate = totalAttendanceRecords > 0 ? (presentCount / totalAttendanceRecords) * 100 : 0;

    return {
      stats: {
        totalStudents,
        totalClasses,
        totalTeachers,
        totalSessions,
        completedSessions,
        totalAttendanceRecords,
        aiVerifiedPresent,
        needsReview,
        attendanceException,
        insufficientEvidence,
        aiVerifiedPercent: Math.round(aiVerifiedPercent * 100) / 100,
        reviewPercent: Math.round(reviewPercent * 100) / 100,
        exceptionPercent: Math.round(exceptionPercent * 100) / 100,
        manualAttendance,
        manualAttendancePercent: Math.round(manualAttendancePercent * 100) / 100,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      }
    };
  }

  /**
   * Get principal dashboard with high-level views
   */
  async getPrincipalDashboard(tenantId: string, academicYearId?: string): Promise<any> {
    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId }
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    const academicYearFilter = academicYearId ? { academicYearId } : {};

    // Get class-wise attendance
    const classes = await prisma.class.findMany({
      where: { tenantId, ...academicYearFilter }
    });

    const classAttendance = await Promise.all(
      classes.map(async (cls) => {
        const enrollments = await prisma.studentEnrollment.findMany({
          where: { classId: cls.id, tenantId },
          include: {
            student: {
              include: {
                preliminaryAttendances: {
                  include: {
                    session: true
                  }
                }
              }
            }
          }
        });

        const allAttendances = enrollments.flatMap((e: any) => 
          e.student.preliminaryAttendances
        );

        const total = allAttendances.length;
        const present = allAttendances.filter((pa: any) => pa.finalStatus === 'PRESENT' || pa.status === 'AI_VERIFIED_PRESENT').length;
        const rate = total > 0 ? (present / total) * 100 : 0;

        return {
          classId: cls.id,
          className: cls.name,
          grade: cls.grade,
          totalStudents: enrollments.length,
          present,
          absent: total - present,
          attendanceRate: Math.round(rate * 100) / 100
        };
      })
    );

    // Get section-wise attendance
    const sections = await prisma.section.findMany({
      where: { tenantId }
    });

    const sectionAttendance = await Promise.all(
      sections.map(async (section) => {
        const enrollments = await prisma.studentEnrollment.findMany({
          where: { sectionId: section.id, tenantId },
          include: {
            student: {
              include: {
                preliminaryAttendances: {
                  include: {
                    session: true
                  }
                }
              }
            }
          }
        });

        const allAttendances = enrollments.flatMap((e: any) => 
          e.student.preliminaryAttendances
        );

        const total = allAttendances.length;
        const present = allAttendances.filter((pa: any) => pa.finalStatus === 'PRESENT' || pa.status === 'AI_VERIFIED_PRESENT').length;
        const rate = total > 0 ? (present / total) * 100 : 0;

        return {
          sectionId: section.id,
          sectionName: section.name,
          classId: section.classId,
          totalStudents: enrollments.length,
          present,
          absent: total - present,
          attendanceRate: Math.round(rate * 100) / 100
        };
      })
    );

    // Get subject-wise attendance
    const subjects = await prisma.subject.findMany({
      where: { tenantId }
    });

    const subjectAttendance = await Promise.all(
      subjects.map(async (subject) => {
        const sessions = await prisma.attendanceSession.findMany({
          where: { subjectId: subject.id, tenantId, ...academicYearFilter }
        });

        const sessionIds = sessions.map(s => s.id);
        const attendances = await prisma.preliminaryAttendance.findMany({
          where: { sessionId: { in: sessionIds } }
        });

        const total = attendances.length;
        const present = attendances.filter((pa: any) => pa.finalStatus === 'PRESENT' || pa.status === 'AI_VERIFIED_PRESENT').length;
        const rate = total > 0 ? (present / total) * 100 : 0;

        return {
          subjectId: subject.id,
          subjectName: subject.name,
          subjectCode: subject.code,
          totalSessions: sessions.length,
          totalAttendanceRecords: total,
          present,
          absent: total - present,
          attendanceRate: Math.round(rate * 100) / 100
        };
      })
    );

    // Get teacher review rates
    const teachers = await prisma.teacher.findMany({
      where: { tenantId, ...academicYearFilter }
    });

    const teacherReviewStats = await Promise.all(
      teachers.map(async (teacher) => {
        const sessions = await prisma.attendanceSession.findMany({
          where: { teacherId: teacher.id, tenantId, ...academicYearFilter }
        });

        const sessionIds = sessions.map(s => s.id);
        const attendances = await prisma.preliminaryAttendance.findMany({
          where: { sessionId: { in: sessionIds } }
        });

        const total = attendances.length;
        const reviewed = attendances.filter((pa: any) => pa.reviewedBy).length;
        const reviewRate = total > 0 ? (reviewed / total) * 100 : 0;

        return {
          teacherId: teacher.id,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          totalSessions: sessions.length,
          totalAttendanceRecords: total,
          reviewed,
          reviewRate: Math.round(reviewRate * 100) / 100
        };
      })
    );

    // Get attendance exceptions
    const exceptions = await prisma.preliminaryAttendance.findMany({
      where: {
        status: { in: ['ATTENDANCE_EXCEPTION', 'INSUFFICIENT_EVIDENCE'] },
        session: { tenantId, ...academicYearFilter }
      },
      include: {
        student: true,
        session: true
      },
      orderBy: { session: { date: 'desc' } }
    });

    return {
      classAttendance,
      sectionAttendance,
      subjectAttendance,
      teacherReviewStats,
      exceptions: exceptions.slice(0, 50) // Return top 50 exceptions
    };
  }

  /**
   * Get student attendance history
   */
  async getStudentAttendanceHistory(
    studentId: string,
    tenantId: string,
    academicYearId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<any> {
    // Verify student exists and belongs to tenant
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new AppError(404, 'Student not found');
    }

    if (student.tenantId !== tenantId) {
      throw new AppError(403, 'Access denied: Student belongs to different tenant');
    }

    // Build date filter
    const dateFilter: any = {};
    if (dateFrom || dateTo) {
      dateFilter.date = {};
      if (dateFrom) dateFilter.date.gte = dateFrom;
      if (dateTo) dateFilter.date.lte = dateTo;
    }

    // Get student enrollments
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        studentId,
        tenantId
      },
      include: {
        class: true
      }
    });

    // Get attendance sessions for enrolled classes
    const sessionIds = await prisma.attendanceSession.findMany({
      where: {
        classId: { in: enrollments.map(e => e.classId) },
        tenantId,
        ...(academicYearId ? { academicYearId } : {}),
        ...dateFilter
      }
    }).then(sessions => sessions.map(s => s.id));

    // Get preliminary attendance for these sessions
    const attendanceHistory = await prisma.preliminaryAttendance.findMany({
      where: {
        studentId,
        sessionId: { in: sessionIds }
      },
      include: {
        session: true
      },
      orderBy: { session: { date: 'desc' } }
    });

    // Get subjects and classes for reference
    const subjectIds = attendanceHistory.map(h => h.session.subjectId);
    const classIds = attendanceHistory.map(h => h.session.classId);
    const subjects = await prisma.subject.findMany({
      where: { id: { in: subjectIds } }
    });
    const classes = await prisma.class.findMany({
      where: { id: { in: classIds } }
    });

    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
    const classMap = new Map(classes.map(c => [c.id, { name: c.name, grade: c.grade }]));

    return attendanceHistory.map(record => ({
      date: record.session.date,
      dayOfWeek: record.session.dayOfWeek,
      period: record.session.period,
      subject: subjectMap.get(record.session.subjectId),
      class: classMap.get(record.session.classId)?.name,
      grade: classMap.get(record.session.classId)?.grade,
      aiStatus: record.status,
      finalStatus: record.finalStatus,
      startRecognized: record.startRecognized,
      middleRecognized: record.middleRecognized,
      endRecognized: record.endRecognized,
      overallConfidence: record.overallConfidence,
      needsReview: record.needsReview,
      reviewedBy: record.reviewedBy,
      reviewedAt: record.reviewedAt,
      isConfirmed: record.isConfirmed,
      notes: record.notes
    }));
  }

  /**
   * Export attendance data as CSV
   */
  async exportAttendanceAsCSV(
    sessionId: string,
    tenantId: string,
    teacherId?: string
  ): Promise<string> {
    const dashboard = await this.getTeacherDashboard(sessionId, teacherId || 'system', tenantId);

    // Generate CSV header
    const headers = ['Student ID', 'Student Name', 'AI Status', 'Final Status', 'Start Recognized', 'Middle Recognized', 'End Recognized', 'Confidence', 'Needs Review', 'Reviewed By', 'Notes'];
    
    // Generate CSV rows
    const rows = dashboard.students.map((student: any) => [
      student.student.studentId,
      `${student.student.firstName} ${student.student.lastName}`,
      student.status,
      student.finalStatus || 'PENDING',
      student.startRecognized ? 'Yes' : 'No',
      student.middleRecognized ? 'Yes' : 'No',
      student.endRecognized ? 'Yes' : 'No',
      student.overallConfidence?.toFixed(2) || 'N/A',
      student.needsReview ? 'Yes' : 'No',
      student.reviewedBy || 'No',
      student.notes || ''
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Get filtered attendance records
   */
  async getFilteredAttendance(
    tenantId: string,
    filters: {
      classId?: string;
      subjectId?: string;
      teacherId?: string;
      dateFrom?: Date;
      dateTo?: Date;
      status?: string;
    }
  ): Promise<any> {
    const whereClause: any = { tenantId };

    if (filters.classId) whereClause.classId = filters.classId;
    if (filters.subjectId) whereClause.subjectId = filters.subjectId;
    if (filters.teacherId) whereClause.teacherId = filters.teacherId;
    if (filters.dateFrom || filters.dateTo) {
      whereClause.date = {};
      if (filters.dateFrom) whereClause.date.gte = filters.dateFrom;
      if (filters.dateTo) whereClause.date.lte = filters.dateTo;
    }

    const sessions = await prisma.attendanceSession.findMany({
      where: whereClause
    });

    const sessionIds = sessions.map(s => s.id);

    const attendances = await prisma.preliminaryAttendance.findMany({
      where: {
        sessionId: { in: sessionIds },
        ...(filters.status ? { status: filters.status as PreliminaryAttendanceStatus } : {})
      },
      include: {
        student: true,
        session: true
      },
      orderBy: { session: { date: 'desc' } }
    });

    // Get related data for enrichment
    const subjectIds = attendances.map(a => a.session.subjectId);
    const classIds = attendances.map(a => a.session.classId);
    const teacherIds = attendances.map(a => a.session.teacherId);

    const [subjects, classes, teachers] = await Promise.all([
      prisma.subject.findMany({ where: { id: { in: subjectIds } } }),
      prisma.class.findMany({ where: { id: { in: classIds } } }),
      prisma.teacher.findMany({ where: { id: { in: teacherIds } } })
    ]);

    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const classMap = new Map(classes.map(c => [c.id, c]));
    const teacherMap = new Map(teachers.map(t => [t.id, t]));

    // Enrich attendance data
    return attendances.map(attendance => ({
      ...attendance,
      session: {
        ...attendance.session,
        subject: subjectMap.get(attendance.session.subjectId),
        class: classMap.get(attendance.session.classId),
        teacher: teacherMap.get(attendance.session.teacherId)
      }
    }));
  }
}
