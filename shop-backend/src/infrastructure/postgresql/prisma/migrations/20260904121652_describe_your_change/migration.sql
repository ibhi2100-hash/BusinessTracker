/*
  Warnings:

  - You are about to drop the column `lastSnaphotVersion` on the `Aggregate` table. All the data in the column will be lost.
  - You are about to alter the column `lastLogicClock` on the `Aggregate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - A unique constraint covering the columns `[aggregateType,aggregateId]` on the table `Aggregate` will be added. If there are existing duplicate values, this will fail.
  - Made the column `updatedAt` on table `Aggregate` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `deviceId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `logicClock` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Aggregate" DROP CONSTRAINT "Aggregate_businessId_fkey";

-- DropIndex
DROP INDEX "Event_userId_idx";

-- AlterTable
ALTER TABLE "Aggregate" DROP COLUMN "lastSnaphotVersion",
ADD COLUMN     "lastSnapshotVersion" INTEGER,
ALTER COLUMN "lastLogicClock" SET DATA TYPE BIGINT,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updatedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "deviceId" TEXT NOT NULL,
ADD COLUMN     "logicClock" BIGINT NOT NULL,
ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Aggregate_businessId_idx" ON "Aggregate"("businessId");

-- CreateIndex
CREATE INDEX "Aggregate_branchId_idx" ON "Aggregate"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "Aggregate_aggregateType_aggregateId_key" ON "Aggregate"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "Event_globalPosition_idx" ON "Event"("globalPosition");
