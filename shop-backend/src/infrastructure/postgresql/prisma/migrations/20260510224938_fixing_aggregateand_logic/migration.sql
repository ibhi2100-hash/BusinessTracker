-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "compressed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "eventCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ProcessedSyncEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "businessId" TEXT,
    "branchId" TEXT,
    "branchBusinessId" TEXT,
    "userId" TEXT,
    "version" INTEGER NOT NULL,
    "status" "SyncEventStatus" NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProcessedSyncEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProcessedSyncEvent_businessId_idx" ON "ProcessedSyncEvent"("businessId");

-- CreateIndex
CREATE INDEX "ProcessedSyncEvent_branchId_branchBusinessId_idx" ON "ProcessedSyncEvent"("branchId", "branchBusinessId");
