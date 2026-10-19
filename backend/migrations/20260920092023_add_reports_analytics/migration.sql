-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('STUDENT_ATTENDANCE', 'CLASS_ATTENDANCE', 'TEACHER_ATTENDANCE', 'DAILY_SUMMARY', 'MONTHLY_SUMMARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "attendance_reports" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "reportType" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "generatedBy" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "filters" JSONB,
    "parameters" JSONB,
    "fileUrl" TEXT,
    "fileSize" INTEGER,
    "status" "ReportStatus" NOT NULL DEFAULT 'COMPLETED',
    "errorMessage" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_attendance_summaries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "classId" TEXT,
    "sectionId" TEXT,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "presentCount" INTEGER NOT NULL DEFAULT 0,
    "absentCount" INTEGER NOT NULL DEFAULT 0,
    "lateCount" INTEGER NOT NULL DEFAULT 0,
    "excusedCount" INTEGER NOT NULL DEFAULT 0,
    "attendancePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "student_attendance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_attendance_analytics" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT,
    "academicYearId" TEXT NOT NULL,
    "subjectId" TEXT,
    "teacherId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "presentCount" INTEGER NOT NULL DEFAULT 0,
    "absentCount" INTEGER NOT NULL DEFAULT 0,
    "lateCount" INTEGER NOT NULL DEFAULT 0,
    "excusedCount" INTEGER NOT NULL DEFAULT 0,
    "attendancePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "class_attendance_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendance_reports_reportId_key" ON "attendance_reports"("reportId");

-- CreateIndex
CREATE INDEX "attendance_reports_tenantId_idx" ON "attendance_reports"("tenantId");

-- CreateIndex
CREATE INDEX "attendance_reports_reportId_idx" ON "attendance_reports"("reportId");

-- CreateIndex
CREATE INDEX "attendance_reports_reportType_idx" ON "attendance_reports"("reportType");

-- CreateIndex
CREATE INDEX "attendance_reports_generatedBy_idx" ON "attendance_reports"("generatedBy");

-- CreateIndex
CREATE INDEX "student_attendance_summaries_tenantId_idx" ON "student_attendance_summaries"("tenantId");

-- CreateIndex
CREATE INDEX "student_attendance_summaries_studentId_idx" ON "student_attendance_summaries"("studentId");

-- CreateIndex
CREATE INDEX "student_attendance_summaries_academicYearId_idx" ON "student_attendance_summaries"("academicYearId");

-- CreateIndex
CREATE INDEX "student_attendance_summaries_classId_idx" ON "student_attendance_summaries"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "student_attendance_summaries_studentId_academicYearId_class_key" ON "student_attendance_summaries"("studentId", "academicYearId", "classId", "sectionId");

-- CreateIndex
CREATE INDEX "class_attendance_analytics_tenantId_idx" ON "class_attendance_analytics"("tenantId");

-- CreateIndex
CREATE INDEX "class_attendance_analytics_classId_idx" ON "class_attendance_analytics"("classId");

-- CreateIndex
CREATE INDEX "class_attendance_analytics_academicYearId_idx" ON "class_attendance_analytics"("academicYearId");

-- CreateIndex
CREATE INDEX "class_attendance_analytics_date_idx" ON "class_attendance_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "class_attendance_analytics_classId_sectionId_subjectId_teac_key" ON "class_attendance_analytics"("classId", "sectionId", "subjectId", "teacherId", "date");

-- AddForeignKey
ALTER TABLE "student_attendance_summaries" ADD CONSTRAINT "student_attendance_summaries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
