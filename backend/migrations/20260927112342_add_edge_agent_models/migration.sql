-- CreateEnum
CREATE TYPE "EdgeDeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'DISABLED');

-- CreateTable
CREATE TABLE "edge_devices" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "status" "EdgeDeviceStatus" NOT NULL DEFAULT 'OFFLINE',
    "lastSeen" TIMESTAMP(3),
    "authCredential" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edge_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edge_events" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "synced" BOOLEAN NOT NULL DEFAULT false,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "edge_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "edge_devices_deviceId_key" ON "edge_devices"("deviceId");

-- CreateIndex
CREATE INDEX "edge_devices_tenantId_idx" ON "edge_devices"("tenantId");

-- CreateIndex
CREATE INDEX "edge_devices_deviceId_idx" ON "edge_devices"("deviceId");

-- CreateIndex
CREATE INDEX "edge_devices_status_idx" ON "edge_devices"("status");

-- CreateIndex
CREATE UNIQUE INDEX "edge_events_eventId_key" ON "edge_events"("eventId");

-- CreateIndex
CREATE INDEX "edge_events_tenantId_idx" ON "edge_events"("tenantId");

-- CreateIndex
CREATE INDEX "edge_events_deviceId_idx" ON "edge_events"("deviceId");

-- CreateIndex
CREATE INDEX "edge_events_eventId_idx" ON "edge_events"("eventId");

-- CreateIndex
CREATE INDEX "edge_events_synced_idx" ON "edge_events"("synced");

-- CreateIndex
CREATE INDEX "edge_events_timestamp_idx" ON "edge_events"("timestamp");

-- AddForeignKey
ALTER TABLE "edge_events" ADD CONSTRAINT "edge_events_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "edge_devices"("deviceId") ON DELETE CASCADE ON UPDATE CASCADE;
