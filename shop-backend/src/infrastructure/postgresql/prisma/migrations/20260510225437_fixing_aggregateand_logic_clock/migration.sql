-- AlterTable
ALTER TABLE "ProcessedSyncEvent" ALTER COLUMN "version" DROP NOT NULL,
ALTER COLUMN "version" SET DATA TYPE BIGINT;
