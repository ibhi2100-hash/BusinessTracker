-- CreateEnum
CREATE TYPE "InvitationDeliveryChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "InvitationDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "InvitationDelivery" (
    "id" TEXT NOT NULL,
    "invitationId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "channel" "InvitationDeliveryChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" "InvitationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "provider" TEXT,
    "providerMessageId" TEXT,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "InvitationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InvitationDelivery_status_nextAttemptAt_idx" ON "InvitationDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "InvitationDelivery_invitationId_idx" ON "InvitationDelivery"("invitationId");

-- CreateIndex
CREATE INDEX "InvitationDelivery_businessId_createdAt_idx" ON "InvitationDelivery"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "InvitationDelivery_providerMessageId_idx" ON "InvitationDelivery"("providerMessageId");
