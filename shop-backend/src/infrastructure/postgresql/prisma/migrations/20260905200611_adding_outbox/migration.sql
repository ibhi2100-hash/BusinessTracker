-- CreateTable
CREATE TABLE "Outbox" (
    "eventId" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateType" TEXT NOT NULL,
    "aggregateVersion" TEXT NOT NULL,
    "globalPosition" BIGINT NOT NULL,
    "status" TEXT NOT NULL,
    "attempts" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outbox_pkey" PRIMARY KEY ("eventId")
);
