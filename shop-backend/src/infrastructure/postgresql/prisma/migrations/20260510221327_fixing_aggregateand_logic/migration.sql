/*
  Warnings:

  - You are about to drop the `ProcessedSyncEvent` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[snapshotKey]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `snapshotKey` to the `Snapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Snapshot_businessId_branchId_aggregateId_aggregateType_acco_key";

-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "snapshotKey" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProcessedSyncEvent";

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_snapshotKey_key" ON "Snapshot"("snapshotKey");
