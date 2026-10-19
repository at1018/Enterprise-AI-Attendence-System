-- CreateEnum
CREATE TYPE "BiometricDataStatus" AS ENUM ('ACTIVE', 'PENDING_DELETION', 'DELETED', 'EXPIRED');

-- CreateTable
CREATE TABLE "face_enrollments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "faceEmbedding" TEXT NOT NULL,
    "faceThumbnail" TEXT,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retentionUntil" TIMESTAMP(3) NOT NULL,
    "qualityScore" DOUBLE PRECISION NOT NULL,
    "deviceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,

    CONSTRAINT "face_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_consents" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "consentGiven" BOOLEAN NOT NULL,
    "consentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "consentedBy" TEXT NOT NULL,
    "consentMethod" TEXT NOT NULL,
    "withdrawnAt" TIMESTAMP(3),
    "withdrawnBy" TEXT,
    "notes" TEXT,

    CONSTRAINT "biometric_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "face_recognition_results" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "sessionId" TEXT,
    "deviceId" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "recognizedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "faceQuality" DOUBLE PRECISION NOT NULL,
    "thumbnail" TEXT,
    "metadata" JSONB,

    CONSTRAINT "face_recognition_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_deletion_audits" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "deletedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletionReason" TEXT NOT NULL,
    "authorizationLevel" TEXT NOT NULL,
    "ipAddress" TEXT,
    "deviceId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodEnds" TIMESTAMP(3),
    "permanentlyDeleted" TIMESTAMP(3),

    CONSTRAINT "biometric_deletion_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "face_enrollments_tenantId_idx" ON "face_enrollments"("tenantId");

-- CreateIndex
CREATE INDEX "face_enrollments_studentId_idx" ON "face_enrollments"("studentId");

-- CreateIndex
CREATE INDEX "face_enrollments_isActive_idx" ON "face_enrollments"("isActive");

-- CreateIndex
CREATE INDEX "face_enrollments_retentionUntil_idx" ON "face_enrollments"("retentionUntil");

-- CreateIndex
CREATE UNIQUE INDEX "face_enrollments_studentId_tenantId_key" ON "face_enrollments"("studentId", "tenantId");

-- CreateIndex
CREATE INDEX "biometric_consents_tenantId_idx" ON "biometric_consents"("tenantId");

-- CreateIndex
CREATE INDEX "biometric_consents_studentId_idx" ON "biometric_consents"("studentId");

-- CreateIndex
CREATE INDEX "biometric_consents_consentGiven_idx" ON "biometric_consents"("consentGiven");

-- CreateIndex
CREATE UNIQUE INDEX "biometric_consents_studentId_tenantId_key" ON "biometric_consents"("studentId", "tenantId");

-- CreateIndex
CREATE INDEX "face_recognition_results_tenantId_idx" ON "face_recognition_results"("tenantId");

-- CreateIndex
CREATE INDEX "face_recognition_results_enrollmentId_idx" ON "face_recognition_results"("enrollmentId");

-- CreateIndex
CREATE INDEX "face_recognition_results_sessionId_idx" ON "face_recognition_results"("sessionId");

-- CreateIndex
CREATE INDEX "face_recognition_results_deviceId_idx" ON "face_recognition_results"("deviceId");

-- CreateIndex
CREATE INDEX "face_recognition_results_recognizedAt_idx" ON "face_recognition_results"("recognizedAt");

-- CreateIndex
CREATE INDEX "biometric_deletion_audits_tenantId_idx" ON "biometric_deletion_audits"("tenantId");

-- CreateIndex
CREATE INDEX "biometric_deletion_audits_studentId_idx" ON "biometric_deletion_audits"("studentId");

-- CreateIndex
CREATE INDEX "biometric_deletion_audits_deletedAt_idx" ON "biometric_deletion_audits"("deletedAt");

-- AddForeignKey
ALTER TABLE "face_recognition_results" ADD CONSTRAINT "face_recognition_results_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "face_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
