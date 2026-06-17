-- CreateTable
CREATE TABLE "Aggregate" (
    "id" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "businessId" TEXT,
    "branchId" TEXT,
    "version" INTEGER NOT NULL,
    "lastEventId" TEXT,
    "lastLogicClock" DECIMAL(65,30),
    "lastGlobalPosition" BIGINT,
    "lastSnaphotVersion" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Aggregate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aggregate" ADD CONSTRAINT "Aggregate_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;
