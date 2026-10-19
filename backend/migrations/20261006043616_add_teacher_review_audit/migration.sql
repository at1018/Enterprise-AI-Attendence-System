-- AlterTable
ALTER TABLE "preliminary_attendance" ADD COLUMN     "confirmedAt" TIMESTAMP(3),
ADD COLUMN     "confirmedBy" TEXT,
ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notes" TEXT;

-- CreateTable
CREATE TABLE "attendance_audit_trails" (
    "id" TEXT NOT NULL,
    "preliminaryAttendanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "previousStatus" TEXT NOT NULL,
    "newStatus" TEXT NOT NULL,
    "changeReason" TEXT NOT NULL,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeSource" TEXT NOT NULL,
    "notes" TEXT,
    "metadata" JSONB,

    CONSTRAINT "attendance_audit_trails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_audit_trails_tenantId_idx" ON "attendance_audit_trails"("tenantId");

-- CreateIndex
CREATE INDEX "attendance_audit_trails_studentId_idx" ON "attendance_audit_trails"("studentId");

-- CreateIndex
CREATE INDEX "attendance_audit_trails_preliminaryAttendanceId_idx" ON "attendance_audit_trails"("preliminaryAttendanceId");

-- CreateIndex
CREATE INDEX "attendance_audit_trails_changedBy_idx" ON "attendance_audit_trails"("changedBy");

-- CreateIndex
CREATE INDEX "attendance_audit_trails_changedAt_idx" ON "attendance_audit_trails"("changedAt");

-- CreateIndex
CREATE INDEX "preliminary_attendance_isConfirmed_idx" ON "preliminary_attendance"("isConfirmed");

-- AddForeignKey
ALTER TABLE "attendance_audit_trails" ADD CONSTRAINT "attendance_audit_trails_preliminaryAttendanceId_fkey" FOREIGN KEY ("preliminaryAttendanceId") REFERENCES "preliminary_attendance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
