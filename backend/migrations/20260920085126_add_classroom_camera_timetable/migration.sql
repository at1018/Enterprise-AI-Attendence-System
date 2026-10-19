-- CreateTable
CREATE TABLE "classrooms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "capacity" INTEGER,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classrooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cameras" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cameraId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "port" INTEGER,
    "username" TEXT,
    "password" TEXT,
    "rtspUrl" TEXT,
    "resolution" TEXT,
    "fps" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "classroomId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cameras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT,
    "subjectId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "classrooms_tenantId_idx" ON "classrooms"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "cameras_cameraId_key" ON "cameras"("cameraId");

-- CreateIndex
CREATE INDEX "cameras_tenantId_idx" ON "cameras"("tenantId");

-- CreateIndex
CREATE INDEX "cameras_classroomId_idx" ON "cameras"("classroomId");

-- CreateIndex
CREATE INDEX "cameras_cameraId_idx" ON "cameras"("cameraId");

-- CreateIndex
CREATE INDEX "timetable_entries_tenantId_idx" ON "timetable_entries"("tenantId");

-- CreateIndex
CREATE INDEX "timetable_entries_classId_idx" ON "timetable_entries"("classId");

-- CreateIndex
CREATE INDEX "timetable_entries_teacherId_idx" ON "timetable_entries"("teacherId");

-- CreateIndex
CREATE INDEX "timetable_entries_academicYearId_idx" ON "timetable_entries"("academicYearId");

-- CreateIndex
CREATE INDEX "timetable_entries_dayOfWeek_idx" ON "timetable_entries"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "timetable_entries_dayOfWeek_period_classId_sectionId_academ_key" ON "timetable_entries"("dayOfWeek", "period", "classId", "sectionId", "academicYearId");

-- AddForeignKey
ALTER TABLE "cameras" ADD CONSTRAINT "cameras_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "classrooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
