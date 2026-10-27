/*
  Warnings:

  - A unique constraint covering the columns `[businessId,businessPosition]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `businessPosition` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "businessPosition" BIGINT NOT NULL;

-- CreateTable
CREATE TABLE "BusinessEventStream" (
    "businessId" TEXT NOT NULL,
    "lastPosition" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "BusinessEventStream_pkey" PRIMARY KEY ("businessId")
);

-- CreateTable
CREATE TABLE "DeviceSyncCursor" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "lastPosition" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceSyncCursor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeviceSyncCursor_businessId_idx" ON "DeviceSyncCursor"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "DeviceSyncCursor_deviceId_businessId_key" ON "DeviceSyncCursor"("deviceId", "businessId");

-- CreateIndex
CREATE INDEX "Event_businessId_businessPosition_idx" ON "Event"("businessId", "businessPosition");

-- CreateIndex
CREATE UNIQUE INDEX "Event_businessId_businessPosition_key" ON "Event"("businessId", "businessPosition");
