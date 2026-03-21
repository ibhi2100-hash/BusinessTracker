-- DropForeignKey
ALTER TABLE "ProcessedSyncEvent" DROP CONSTRAINT "ProcessedSyncEvent_branchId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessedSyncEvent" DROP CONSTRAINT "ProcessedSyncEvent_businessId_fkey";

-- DropForeignKey
ALTER TABLE "ProcessedSyncEvent" DROP CONSTRAINT "ProcessedSyncEvent_userId_fkey";

-- AlterTable
ALTER TABLE "ProcessedSyncEvent" ALTER COLUMN "businessId" DROP NOT NULL,
ALTER COLUMN "branchId" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;
