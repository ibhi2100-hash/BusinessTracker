/*
  Warnings:

  - You are about to drop the `DeviceSyncCursor` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "DeviceSyncCursor";

-- CreateTable
CREATE TABLE "DeviceSyncCheckpoint" (
    "businessId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "lastAcknowledgedPosition" BIGINT NOT NULL DEFAULT 0,
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSyncCheckpoint_pkey" PRIMARY KEY ("businessId","deviceId")
);

-- CreateIndex
CREATE INDEX "DeviceSyncCheckpoint_businessId_lastAcknowledgedPosition_idx" ON "DeviceSyncCheckpoint"("businessId", "lastAcknowledgedPosition");

-- CreateIndex
CREATE INDEX "DeviceSyncCheckpoint_deviceId_idx" ON "DeviceSyncCheckpoint"("deviceId");
