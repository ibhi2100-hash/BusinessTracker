/*
  Warnings:

  - A unique constraint covering the columns `[businessId,branchId,version]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `scope` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Event_businessId_branchId_idx";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "scope" TEXT NOT NULL,
ALTER COLUMN "businessId" DROP NOT NULL,
ALTER COLUMN "branchId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Event_businessId_branchId_version_idx" ON "Event"("businessId", "branchId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "Event_businessId_branchId_version_key" ON "Event"("businessId", "branchId", "version");
