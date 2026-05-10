/*
  Warnings:

  - You are about to drop the column `version` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `lastVersion` on the `Snapshot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[aggregateType,aggregateId,aggregateVersion]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,branchId,aggregateId,aggregateType,account,snapshotType,scope]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aggregateVersion` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastGlobalPosition` to the `Snapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Event_aggregateType_aggregateId_version_key";

-- DropIndex
DROP INDEX "Snapshot_businessId_branchId_account_snapshotType_scope_key";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "version",
ADD COLUMN     "aggregateVersion" INTEGER NOT NULL,
ADD COLUMN     "globalPosition" BIGSERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Snapshot" DROP COLUMN "lastVersion",
ADD COLUMN     "aggregateId" TEXT,
ADD COLUMN     "aggregateType" TEXT,
ADD COLUMN     "lastGlobalPosition" BIGINT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_aggregateType_aggregateId_aggregateVersion_key" ON "Event"("aggregateType", "aggregateId", "aggregateVersion");

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_businessId_branchId_aggregateId_aggregateType_acco_key" ON "Snapshot"("businessId", "branchId", "aggregateId", "aggregateType", "account", "snapshotType", "scope");
