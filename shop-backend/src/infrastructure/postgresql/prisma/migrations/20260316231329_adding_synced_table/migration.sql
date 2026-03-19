-- CreateEnum
CREATE TYPE "SyncEventStatus" AS ENUM ('PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "ProcessedSyncEvent" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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
CREATE INDEX "ProcessedSyncEvent_branchId_idx" ON "ProcessedSyncEvent"("branchId");

-- AddForeignKey
ALTER TABLE "ProcessedSyncEvent" ADD CONSTRAINT "ProcessedSyncEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedSyncEvent" ADD CONSTRAINT "ProcessedSyncEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessedSyncEvent" ADD CONSTRAINT "ProcessedSyncEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
