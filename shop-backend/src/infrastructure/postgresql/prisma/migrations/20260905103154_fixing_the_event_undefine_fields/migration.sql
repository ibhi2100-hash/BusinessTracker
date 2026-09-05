/*
  Warnings:

  - Made the column `businessId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `causationId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `correlationId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Made the column `checksum` on table `Event` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "businessId" SET NOT NULL,
ALTER COLUMN "branchId" SET NOT NULL,
ALTER COLUMN "causationId" SET NOT NULL,
ALTER COLUMN "correlationId" SET NOT NULL,
ALTER COLUMN "checksum" SET NOT NULL;
