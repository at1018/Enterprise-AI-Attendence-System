-- CreateEnum
CREATE TYPE "CheckpointType" AS ENUM ('START', 'MIDDLE', 'END');

-- CreateEnum
CREATE TYPE "CheckpointStatus" AS ENUM ('PENDING', 'COMPLETED', 'SKIPPED', 'FAILED');

-- CreateEnum
CREATE TYPE "PreliminaryAttendanceStatus" AS ENUM ('AI_VERIFIED_PRESENT', 'ATTENDANCE_EXCEPTION', 'NEEDS_REVIEW', 'INSUFFICIENT_EVIDENCE');

-- CreateTable
CREATE TABLE "attendance_checkpoints" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "checkpointType" "CheckpointType" NOT NULL,
    "scheduledTime" TIMESTAMP(3) NOT NULL,
    "actualTime" TIMESTAMP(3),
    "status" "CheckpointStatus" NOT NULL DEFAULT 'PENDING',
    "deviceId" TEXT,
    "totalStudents" INTEGER NOT NULL DEFAULT 0,
    "recognizedCount" INTEGER NOT NULL DEFAULT 0,
    "unknownCount" INTEGER NOT NULL DEFAULT 0,
    "lowConfidenceCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,

    CONSTRAINT "attendance_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkpoint_records" (
    "id" TEXT NOT NULL,
    "checkpointId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "recognized" BOOLEAN NOT NULL DEFAULT false,
    "confidence" DOUBLE PRECISION,
    "faceQuality" DOUBLE PRECISION,
    "recognitionResultId" TEXT,
    "exceptionReason" TEXT,
    "metadata" JSONB,

    CONSTRAINT "checkpoint_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preliminary_attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "PreliminaryAttendanceStatus" NOT NULL,
    "startRecognized" BOOLEAN NOT NULL DEFAULT false,
    "middleRecognized" BOOLEAN NOT NULL DEFAULT false,
    "endRecognized" BOOLEAN NOT NULL DEFAULT false,
    "overallConfidence" DOUBLE PRECISION,
    "exceptionReason" TEXT,
    "needsReview" BOOLEAN NOT NULL DEFAULT false,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "finalStatus" TEXT,
    "metadata" JSONB,

    CONSTRAINT "preliminary_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attendance_checkpoints_sessionId_idx" ON "attendance_checkpoints"("sessionId");

-- CreateIndex
CREATE INDEX "attendance_checkpoints_checkpointType_idx" ON "attendance_checkpoints"("checkpointType");

-- CreateIndex
CREATE INDEX "attendance_checkpoints_status_idx" ON "attendance_checkpoints"("status");

-- CreateIndex
CREATE INDEX "attendance_checkpoints_scheduledTime_idx" ON "attendance_checkpoints"("scheduledTime");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_checkpoints_sessionId_checkpointType_key" ON "attendance_checkpoints"("sessionId", "checkpointType");

-- CreateIndex
CREATE INDEX "checkpoint_records_tenantId_idx" ON "checkpoint_records"("tenantId");

-- CreateIndex
CREATE INDEX "checkpoint_records_studentId_idx" ON "checkpoint_records"("studentId");

-- CreateIndex
CREATE INDEX "checkpoint_records_checkpointId_idx" ON "checkpoint_records"("checkpointId");

-- CreateIndex
CREATE UNIQUE INDEX "checkpoint_records_checkpointId_studentId_key" ON "checkpoint_records"("checkpointId", "studentId");

-- CreateIndex
CREATE INDEX "preliminary_attendance_tenantId_idx" ON "preliminary_attendance"("tenantId");

-- CreateIndex
CREATE INDEX "preliminary_attendance_studentId_idx" ON "preliminary_attendance"("studentId");

-- CreateIndex
CREATE INDEX "preliminary_attendance_status_idx" ON "preliminary_attendance"("status");

-- CreateIndex
CREATE INDEX "preliminary_attendance_needsReview_idx" ON "preliminary_attendance"("needsReview");

-- CreateIndex
CREATE UNIQUE INDEX "preliminary_attendance_sessionId_studentId_key" ON "preliminary_attendance"("sessionId", "studentId");

-- AddForeignKey
ALTER TABLE "attendance_checkpoints" ADD CONSTRAINT "attendance_checkpoints_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkpoint_records" ADD CONSTRAINT "checkpoint_records_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "attendance_checkpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preliminary_attendance" ADD CONSTRAINT "preliminary_attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "attendance_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preliminary_attendance" ADD CONSTRAINT "preliminary_attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
