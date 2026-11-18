/*
  Warnings:

  - You are about to drop the `BusinessSubscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SubscriptionPlan` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BillingPlanStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'RETIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'QUARTERLY', 'YEARLY', 'LIFETIME');

-- CreateEnum
CREATE TYPE "BillingSubscriptionStatus" AS ENUM ('PENDING', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'GRACE_PERIOD', 'SUSPENDED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingRequestType" AS ENUM ('NEW', 'UPGRADE', 'DOWNGRADE', 'RENEWAL');

-- CreateEnum
CREATE TYPE "BillingRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingEntitlementSource" AS ENUM ('PLAN', 'OVERRIDE');

-- CreateEnum
CREATE TYPE "BillingRecordStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BillingInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'VOIDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingPaymentStatus" AS ENUM ('INITIATED', 'PENDING', 'CONFIRMED', 'FAILED', 'REVERSED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "BillingPaymentAttemptStatus" AS ENUM ('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "BillingPaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'USSD', 'BANK', 'MOBILE_MONEY', 'OTHER');

-- CreateEnum
CREATE TYPE "BillingRefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "BillingProvider" AS ENUM ('PAYSTACK', 'FLUTTERWAVE', 'MANUAL');

-- CreateEnum
CREATE TYPE "BillingProviderOperationStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'REQUIRES_RECONCILIATION');

-- CreateEnum
CREATE TYPE "BillingWebhookStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'PROCESSED', 'FAILED', 'IGNORED');

-- CreateEnum
CREATE TYPE "BillingEventStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "BillingCommandStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "BillingLeaseStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "BillingAuditAction" AS ENUM ('CREATED', 'UPDATED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVATED', 'CANCELLED', 'REVOKED', 'REFUNDED', 'OVERRIDE_GRANTED', 'OVERRIDE_REVOKED', 'MANUAL_ADJUSTMENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EmployeeRole" ADD VALUE 'CEO';
ALTER TYPE "EmployeeRole" ADD VALUE 'SALES_REPS';
ALTER TYPE "EmployeeRole" ADD VALUE 'CLEANER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'CEO';
ALTER TYPE "Role" ADD VALUE 'MANAGER';
ALTER TYPE "Role" ADD VALUE 'SALES_REPS';
ALTER TYPE "Role" ADD VALUE 'CLEANER';

-- DropForeignKey
ALTER TABLE "BusinessSubscription" DROP CONSTRAINT "BusinessSubscription_businessId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessSubscription" DROP CONSTRAINT "BusinessSubscription_subscriptionId_fkey";

-- DropTable
DROP TABLE "BusinessSubscription";

-- DropTable
DROP TABLE "SubscriptionPlan";

-- CreateTable
CREATE TABLE "BillingPlan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "BillingPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPlanVersion" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planVersion" INTEGER NOT NULL,
    "priceMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "billingCycle" "BillingCycle" NOT NULL,
    "intervalCount" INTEGER NOT NULL DEFAULT 1,
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "maxStaff" INTEGER NOT NULL,
    "maxBranch" INTEGER NOT NULL,
    "maxProduct" INTEGER NOT NULL,
    "features" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingPlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planVersion" INTEGER NOT NULL,
    "status" "BillingSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "billingCycle" "BillingCycle" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "priceMinor" BIGINT NOT NULL,
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "gracePeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "activatedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSubscriptionRequest" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "requestedPlanId" TEXT NOT NULL,
    "requestedPlanVersion" INTEGER NOT NULL,
    "requestType" "BillingRequestType" NOT NULL,
    "status" "BillingRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "effectiveAt" TIMESTAMP(3),
    "subscriptionId" TEXT,
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSubscriptionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEntitlement" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "entitlementKey" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "source" "BillingEntitlementSource" NOT NULL DEFAULT 'PLAN',
    "status" "BillingRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validUntil" TIMESTAMP(3),
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEntitlementOverride" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "entitlementKey" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "status" "BillingRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingEntitlementOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoice" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "invoiceNumber" TEXT NOT NULL,
    "status" "BillingInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "subtotalMinor" BIGINT NOT NULL,
    "taxMinor" BIGINT NOT NULL DEFAULT 0,
    "discountMinor" BIGINT NOT NULL DEFAULT 0,
    "totalMinor" BIGINT NOT NULL,
    "amountPaidMinor" BIGINT NOT NULL DEFAULT 0,
    "amountDueMinor" BIGINT NOT NULL,
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "issuedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingInvoiceItem" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(18,6) NOT NULL,
    "unitPriceMinor" BIGINT NOT NULL,
    "lineTotalMinor" BIGINT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingInvoiceItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPayment" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "invoiceId" TEXT,
    "provider" "BillingProvider" NOT NULL,
    "providerReference" TEXT,
    "method" "BillingPaymentMethod",
    "status" "BillingPaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "amountMinor" BIGINT NOT NULL,
    "providerFeeMinor" BIGINT NOT NULL DEFAULT 0,
    "netAmountMinor" BIGINT,
    "refundedMinor" BIGINT NOT NULL DEFAULT 0,
    "initiatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "reversedAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPaymentAttempt" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "providerReference" TEXT,
    "attemptNumber" INTEGER NOT NULL,
    "status" "BillingPaymentAttemptStatus" NOT NULL DEFAULT 'INITIATED',
    "failureReason" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingPaymentAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingPaymentAllocation" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amountMinor" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingPaymentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingRefund" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "providerRefundReference" TEXT,
    "amountMinor" BIGINT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "BillingRefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProviderAccount" (
    "id" TEXT NOT NULL,
    "provider" "BillingProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "environment" TEXT NOT NULL DEFAULT 'LIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "credentialsRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProviderCustomer" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerCustomerId" TEXT NOT NULL,
    "email" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingProviderCustomer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProviderSubscription" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "providerCustomerId" TEXT,
    "providerPlanCode" TEXT,
    "status" TEXT NOT NULL,
    "authorizationCodeRef" TEXT,
    "nextPaymentDate" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingProviderSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProviderWebhookEvent" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "provider" "BillingProvider" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "BillingWebhookStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "processingAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,

    CONSTRAINT "BillingProviderWebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingProviderOperation" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "paymentId" TEXT,
    "attemptId" TEXT,
    "provider" "BillingProvider" NOT NULL,
    "operationType" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "providerReference" TEXT,
    "status" "BillingProviderOperationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextAttemptAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingProviderOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEvent" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "aggregateType" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "aggregateVersion" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingOutbox" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "destination" TEXT NOT NULL DEFAULT 'BILLING_SYNC',
    "status" "BillingEventStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingCommandIdempotency" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "commandType" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "status" "BillingCommandStatus" NOT NULL DEFAULT 'PROCESSING',
    "resultReference" TEXT,
    "response" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BillingCommandIdempotency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingSubscriptionLease" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "branchId" TEXT,
    "deviceId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "gracePeriodEnd" TIMESTAMP(3),
    "status" "BillingLeaseStatus" NOT NULL DEFAULT 'ACTIVE',
    "entitlementSnapshot" JSONB NOT NULL,
    "signedToken" TEXT NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "aggregateVersion" INTEGER NOT NULL DEFAULT 1,
    "lastEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingSubscriptionLease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAuditLog" (
    "id" TEXT NOT NULL,
    "businessId" TEXT,
    "actorUserId" TEXT,
    "action" "BillingAuditAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reason" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlan_code_key" ON "BillingPlan"("code");

-- CreateIndex
CREATE INDEX "BillingPlan_status_displayOrder_idx" ON "BillingPlan"("status", "displayOrder");

-- CreateIndex
CREATE INDEX "BillingPlanVersion_planId_idx" ON "BillingPlanVersion"("planId");

-- CreateIndex
CREATE INDEX "BillingPlanVersion_publishedAt_idx" ON "BillingPlanVersion"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPlanVersion_planId_planVersion_key" ON "BillingPlanVersion"("planId", "planVersion");

-- CreateIndex
CREATE INDEX "BillingSubscription_businessId_idx" ON "BillingSubscription"("businessId");

-- CreateIndex
CREATE INDEX "BillingSubscription_businessId_status_idx" ON "BillingSubscription"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingSubscription_businessId_currentPeriodEnd_idx" ON "BillingSubscription"("businessId", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "BillingSubscription_planId_planVersion_idx" ON "BillingSubscription"("planId", "planVersion");

-- CreateIndex
CREATE INDEX "BillingSubscription_status_currentPeriodEnd_idx" ON "BillingSubscription"("status", "currentPeriodEnd");

-- CreateIndex
CREATE INDEX "BillingSubscriptionRequest_businessId_status_idx" ON "BillingSubscriptionRequest"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingSubscriptionRequest_businessId_createdAt_idx" ON "BillingSubscriptionRequest"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingSubscriptionRequest_requestedPlanId_requestedPlanVer_idx" ON "BillingSubscriptionRequest"("requestedPlanId", "requestedPlanVersion");

-- CreateIndex
CREATE INDEX "BillingSubscriptionRequest_subscriptionId_idx" ON "BillingSubscriptionRequest"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingEntitlement_businessId_status_idx" ON "BillingEntitlement"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingEntitlement_subscriptionId_idx" ON "BillingEntitlement"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingEntitlement_validUntil_idx" ON "BillingEntitlement"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntitlement_businessId_entitlementKey_key" ON "BillingEntitlement"("businessId", "entitlementKey");

-- CreateIndex
CREATE INDEX "BillingEntitlementOverride_businessId_entitlementKey_idx" ON "BillingEntitlementOverride"("businessId", "entitlementKey");

-- CreateIndex
CREATE INDEX "BillingEntitlementOverride_businessId_status_idx" ON "BillingEntitlementOverride"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingEntitlementOverride_subscriptionId_idx" ON "BillingEntitlementOverride"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingEntitlementOverride_expiresAt_idx" ON "BillingEntitlementOverride"("expiresAt");

-- CreateIndex
CREATE INDEX "BillingInvoice_businessId_createdAt_idx" ON "BillingInvoice"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingInvoice_businessId_status_idx" ON "BillingInvoice"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingInvoice_subscriptionId_idx" ON "BillingInvoice"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingInvoice_status_dueAt_idx" ON "BillingInvoice"("status", "dueAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingInvoice_businessId_invoiceNumber_key" ON "BillingInvoice"("businessId", "invoiceNumber");

-- CreateIndex
CREATE INDEX "BillingInvoiceItem_invoiceId_idx" ON "BillingInvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingPayment_businessId_createdAt_idx" ON "BillingPayment"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingPayment_businessId_status_idx" ON "BillingPayment"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingPayment_subscriptionId_idx" ON "BillingPayment"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingPayment_invoiceId_idx" ON "BillingPayment"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingPayment_provider_providerReference_idx" ON "BillingPayment"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "BillingPaymentAttempt_paymentId_idx" ON "BillingPaymentAttempt"("paymentId");

-- CreateIndex
CREATE INDEX "BillingPaymentAttempt_provider_providerReference_idx" ON "BillingPaymentAttempt"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "BillingPaymentAttempt_status_idx" ON "BillingPaymentAttempt"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPaymentAttempt_paymentId_attemptNumber_key" ON "BillingPaymentAttempt"("paymentId", "attemptNumber");

-- CreateIndex
CREATE INDEX "BillingPaymentAllocation_invoiceId_idx" ON "BillingPaymentAllocation"("invoiceId");

-- CreateIndex
CREATE INDEX "BillingPaymentAllocation_paymentId_idx" ON "BillingPaymentAllocation"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingPaymentAllocation_paymentId_invoiceId_key" ON "BillingPaymentAllocation"("paymentId", "invoiceId");

-- CreateIndex
CREATE INDEX "BillingRefund_paymentId_idx" ON "BillingRefund"("paymentId");

-- CreateIndex
CREATE INDEX "BillingRefund_status_idx" ON "BillingRefund"("status");

-- CreateIndex
CREATE INDEX "BillingRefund_providerRefundReference_idx" ON "BillingRefund"("providerRefundReference");

-- CreateIndex
CREATE INDEX "BillingProviderAccount_provider_isActive_idx" ON "BillingProviderAccount"("provider", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderAccount_provider_name_environment_key" ON "BillingProviderAccount"("provider", "name", "environment");

-- CreateIndex
CREATE INDEX "BillingProviderCustomer_businessId_idx" ON "BillingProviderCustomer"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderCustomer_accountId_providerCustomerId_key" ON "BillingProviderCustomer"("accountId", "providerCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderCustomer_businessId_accountId_key" ON "BillingProviderCustomer"("businessId", "accountId");

-- CreateIndex
CREATE INDEX "BillingProviderSubscription_subscriptionId_idx" ON "BillingProviderSubscription"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingProviderSubscription_providerCustomerId_idx" ON "BillingProviderSubscription"("providerCustomerId");

-- CreateIndex
CREATE INDEX "BillingProviderSubscription_status_idx" ON "BillingProviderSubscription"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderSubscription_accountId_providerSubscriptionI_key" ON "BillingProviderSubscription"("accountId", "providerSubscriptionId");

-- CreateIndex
CREATE INDEX "BillingProviderWebhookEvent_status_receivedAt_idx" ON "BillingProviderWebhookEvent"("status", "receivedAt");

-- CreateIndex
CREATE INDEX "BillingProviderWebhookEvent_provider_eventType_idx" ON "BillingProviderWebhookEvent"("provider", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderWebhookEvent_provider_providerEventId_key" ON "BillingProviderWebhookEvent"("provider", "providerEventId");

-- CreateIndex
CREATE INDEX "BillingProviderOperation_status_nextAttemptAt_idx" ON "BillingProviderOperation"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "BillingProviderOperation_paymentId_idx" ON "BillingProviderOperation"("paymentId");

-- CreateIndex
CREATE INDEX "BillingProviderOperation_attemptId_idx" ON "BillingProviderOperation"("attemptId");

-- CreateIndex
CREATE INDEX "BillingProviderOperation_provider_providerReference_idx" ON "BillingProviderOperation"("provider", "providerReference");

-- CreateIndex
CREATE UNIQUE INDEX "BillingProviderOperation_accountId_idempotencyKey_key" ON "BillingProviderOperation"("accountId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "BillingEvent_businessId_occurredAt_idx" ON "BillingEvent"("businessId", "occurredAt");

-- CreateIndex
CREATE INDEX "BillingEvent_aggregateType_aggregateId_idx" ON "BillingEvent"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "BillingEvent_eventType_occurredAt_idx" ON "BillingEvent"("eventType", "occurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEvent_aggregateType_aggregateId_aggregateVersion_key" ON "BillingEvent"("aggregateType", "aggregateId", "aggregateVersion");

-- CreateIndex
CREATE INDEX "BillingOutbox_status_nextAttemptAt_idx" ON "BillingOutbox"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "BillingOutbox_status_createdAt_idx" ON "BillingOutbox"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingOutbox_eventId_destination_key" ON "BillingOutbox"("eventId", "destination");

-- CreateIndex
CREATE INDEX "BillingCommandIdempotency_status_createdAt_idx" ON "BillingCommandIdempotency"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BillingCommandIdempotency_scope_idempotencyKey_key" ON "BillingCommandIdempotency"("scope", "idempotencyKey");

-- CreateIndex
CREATE INDEX "BillingSubscriptionLease_businessId_status_idx" ON "BillingSubscriptionLease"("businessId", "status");

-- CreateIndex
CREATE INDEX "BillingSubscriptionLease_businessId_branchId_deviceId_idx" ON "BillingSubscriptionLease"("businessId", "branchId", "deviceId");

-- CreateIndex
CREATE INDEX "BillingSubscriptionLease_subscriptionId_idx" ON "BillingSubscriptionLease"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingSubscriptionLease_deviceId_idx" ON "BillingSubscriptionLease"("deviceId");

-- CreateIndex
CREATE INDEX "BillingSubscriptionLease_expiresAt_idx" ON "BillingSubscriptionLease"("expiresAt");

-- CreateIndex
CREATE INDEX "BillingAuditLog_businessId_createdAt_idx" ON "BillingAuditLog"("businessId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingAuditLog_actorUserId_createdAt_idx" ON "BillingAuditLog"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "BillingAuditLog_entityType_entityId_idx" ON "BillingAuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "BillingAuditLog_action_createdAt_idx" ON "BillingAuditLog"("action", "createdAt");

-- AddForeignKey
ALTER TABLE "BillingPlanVersion" ADD CONSTRAINT "BillingPlanVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "BillingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_planId_planVersion_fkey" FOREIGN KEY ("planId", "planVersion") REFERENCES "BillingPlanVersion"("planId", "planVersion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscriptionRequest" ADD CONSTRAINT "BillingSubscriptionRequest_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscriptionRequest" ADD CONSTRAINT "BillingSubscriptionRequest_requestedPlanId_requestedPlanVe_fkey" FOREIGN KEY ("requestedPlanId", "requestedPlanVersion") REFERENCES "BillingPlanVersion"("planId", "planVersion") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscriptionRequest" ADD CONSTRAINT "BillingSubscriptionRequest_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntitlement" ADD CONSTRAINT "BillingEntitlement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntitlement" ADD CONSTRAINT "BillingEntitlement_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntitlementOverride" ADD CONSTRAINT "BillingEntitlementOverride_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEntitlementOverride" ADD CONSTRAINT "BillingEntitlementOverride_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingInvoiceItem" ADD CONSTRAINT "BillingInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPayment" ADD CONSTRAINT "BillingPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPaymentAttempt" ADD CONSTRAINT "BillingPaymentAttempt_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPaymentAttempt" ADD CONSTRAINT "BillingPaymentAttempt_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillingPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPaymentAllocation" ADD CONSTRAINT "BillingPaymentAllocation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillingPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPaymentAllocation" ADD CONSTRAINT "BillingPaymentAllocation_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingPaymentAllocation" ADD CONSTRAINT "BillingPaymentAllocation_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingRefund" ADD CONSTRAINT "BillingRefund_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingRefund" ADD CONSTRAINT "BillingRefund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillingPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderCustomer" ADD CONSTRAINT "BillingProviderCustomer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderCustomer" ADD CONSTRAINT "BillingProviderCustomer_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingProviderAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderSubscription" ADD CONSTRAINT "BillingProviderSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderSubscription" ADD CONSTRAINT "BillingProviderSubscription_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingProviderAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderWebhookEvent" ADD CONSTRAINT "BillingProviderWebhookEvent_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingProviderAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderOperation" ADD CONSTRAINT "BillingProviderOperation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "BillingProviderAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderOperation" ADD CONSTRAINT "BillingProviderOperation_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "BillingPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingProviderOperation" ADD CONSTRAINT "BillingProviderOperation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "BillingPaymentAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingEvent" ADD CONSTRAINT "BillingEvent_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingOutbox" ADD CONSTRAINT "BillingOutbox_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "BillingEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscriptionLease" ADD CONSTRAINT "BillingSubscriptionLease_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscriptionLease" ADD CONSTRAINT "BillingSubscriptionLease_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscriptionLease" ADD CONSTRAINT "BillingSubscriptionLease_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingAuditLog" ADD CONSTRAINT "BillingAuditLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;
