/*
  Warnings:

  - A unique constraint covering the columns `[scope,businessId,branchId,version]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,status]` on the table `ProcessedSyncEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Event_businessId_branchId_version_idx";

-- DropIndex
DROP INDEX "Event_businessId_branchId_version_key";

-- CreateIndex
CREATE INDEX "Event_scope_businessId_branchId_version_idx" ON "Event"("scope", "businessId", "branchId", "version");

-- CreateIndex
CREATE INDEX "Event_deviceId_logicClock_idx" ON "Event"("deviceId", "logicClock");

-- CreateIndex
CREATE UNIQUE INDEX "Event_scope_businessId_branchId_version_key" ON "Event"("scope", "businessId", "branchId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "ProcessedSyncEvent_id_status_key" ON "ProcessedSyncEvent"("id", "status");
