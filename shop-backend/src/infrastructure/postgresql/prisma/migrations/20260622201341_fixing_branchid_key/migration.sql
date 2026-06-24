/*
  Warnings:

  - You are about to drop the column `branchBusinessId` on the `Alert` table. All the data in the column will be lost.
  - You are about to drop the column `branchBusinessId` on the `Inventory` table. All the data in the column will be lost.
  - You are about to drop the column `branchBusinessId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `branchBusinessId` on the `ProcessedSyncEvent` table. All the data in the column will be lost.
  - You are about to drop the column `branchBusinessId` on the `Snapshot` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Alert_branchId_branchBusinessId_isResolved_idx";

-- DropIndex
DROP INDEX "Inventory_branchId_branchBusinessId_idx";

-- DropIndex
DROP INDEX "ProcessedSyncEvent_branchId_branchBusinessId_idx";

-- DropIndex
DROP INDEX "Snapshot_branchId_branchBusinessId_version_idx";

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "branchBusinessId";

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "branchBusinessId";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "branchBusinessId";

-- AlterTable
ALTER TABLE "ProcessedSyncEvent" DROP COLUMN "branchBusinessId";

-- AlterTable
ALTER TABLE "Snapshot" DROP COLUMN "branchBusinessId";

-- CreateIndex
CREATE INDEX "Alert_branchId_isResolved_idx" ON "Alert"("branchId", "isResolved");

-- CreateIndex
CREATE INDEX "Inventory_branchId_idx" ON "Inventory"("branchId");

-- CreateIndex
CREATE INDEX "ProcessedSyncEvent_branchId_idx" ON "ProcessedSyncEvent"("branchId");

-- CreateIndex
CREATE INDEX "Snapshot_branchId_version_idx" ON "Snapshot"("branchId", "version");
