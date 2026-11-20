-- CreateEnum
CREATE TYPE "PlatformUserStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "SupportTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'ESCALATED', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SupportPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "SupportMessageVisibility" AS ENUM ('CUSTOMER', 'INTERNAL');

-- CreateEnum
CREATE TYPE "SupportAccessStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DENIED', 'ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "SupportAccessMode" AS ENUM ('READ_ONLY', 'ASSISTED');

-- CreateEnum
CREATE TYPE "PlatformIncidentStatus" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PlatformIncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateTable
CREATE TABLE "PlatformUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "status" "PlatformUserStatus" NOT NULL DEFAULT 'INVITED',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformRole" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformPermission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "module" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformUserRole" (
    "id" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "platformRoleId" TEXT NOT NULL,
    "assignedBy" TEXT,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "PlatformUserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformRolePermission" (
    "id" TEXT NOT NULL,
    "platformRoleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSession" (
    "id" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceName" TEXT,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "tokenHash" TEXT NOT NULL,
    "invitedByPlatformUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAuditLog" (
    "id" TEXT NOT NULL,
    "actorPlatformUserId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "targetBusinessId" TEXT,
    "reason" TEXT,
    "beforeData" JSONB,
    "afterData" JSONB,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "correlationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "createdByTenantUserId" TEXT,
    "assignedPlatformUserId" TEXT,
    "ticketNumber" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "SupportPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "SupportTicketStatus" NOT NULL DEFAULT 'OPEN',
    "firstResponseAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportMessage" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "platformUserId" TEXT,
    "tenantUserId" TEXT,
    "visibility" "SupportMessageVisibility" NOT NULL DEFAULT 'CUSTOMER',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAttachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "messageId" TEXT,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" BIGINT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicketEvent" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "actorPlatformUserId" TEXT,
    "eventType" TEXT NOT NULL,
    "previousStatus" "SupportTicketStatus",
    "newStatus" "SupportTicketStatus",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportTicketEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportAccessGrant" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "requestedByPlatformUserId" TEXT NOT NULL,
    "approvedByPlatformUserId" TEXT,
    "status" "SupportAccessStatus" NOT NULL DEFAULT 'REQUESTED',
    "mode" "SupportAccessMode" NOT NULL DEFAULT 'READ_ONLY',
    "reason" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupportAccessGrant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformTenantProjection" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "businessStatus" "BusinessStatus" NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL,
    "activatedAt" TIMESTAMP(3),
    "totalBranches" INTEGER NOT NULL DEFAULT 0,
    "activeBranches" INTEGER NOT NULL DEFAULT 0,
    "totalEmployees" INTEGER NOT NULL DEFAULT 0,
    "activeEmployees" INTEGER NOT NULL DEFAULT 0,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "totalSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "activeSubscriptions" INTEGER NOT NULL DEFAULT 0,
    "currentPlanId" TEXT,
    "currentPlanVersion" INTEGER,
    "currentSubscriptionStatus" "BillingSubscriptionStatus",
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "recurringAmountMinor" BIGINT NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "lastSyncAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformTenantProjection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformDailyMetric" (
    "id" TEXT NOT NULL,
    "metricDate" DATE NOT NULL,
    "metricKey" TEXT NOT NULL,
    "dimensionKey" TEXT NOT NULL DEFAULT 'ALL',
    "dimensionValue" TEXT NOT NULL DEFAULT 'ALL',
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "value" DECIMAL(24,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformDailyMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformRevenueDaily" (
    "id" TEXT NOT NULL,
    "metricDate" DATE NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "grossCollectedMinor" BIGINT NOT NULL DEFAULT 0,
    "refundsMinor" BIGINT NOT NULL DEFAULT 0,
    "netCollectedMinor" BIGINT NOT NULL DEFAULT 0,
    "providerFeesMinor" BIGINT NOT NULL DEFAULT 0,
    "invoicesIssuedMinor" BIGINT NOT NULL DEFAULT 0,
    "outstandingMinor" BIGINT NOT NULL DEFAULT 0,
    "recurringRevenueMinor" BIGINT NOT NULL DEFAULT 0,
    "successfulPayments" INTEGER NOT NULL DEFAULT 0,
    "failedPayments" INTEGER NOT NULL DEFAULT 0,
    "payingBusinesses" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformRevenueDaily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformProjectionCheckpoint" (
    "id" TEXT NOT NULL,
    "consumerName" TEXT NOT NULL,
    "lastProcessedPosition" BIGINT NOT NULL DEFAULT 0,
    "lastProcessedEventId" TEXT,
    "lastProcessedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformProjectionCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformProcessedEvent" (
    "id" TEXT NOT NULL,
    "consumerName" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformProcessedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingEntitlementDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "valueType" TEXT NOT NULL,
    "defaultValue" JSONB,
    "validationSchema" JSONB,
    "isLimit" BOOLEAN NOT NULL DEFAULT false,
    "isFeature" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingEntitlementDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "description" TEXT,
    "updatedByPlatformUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformFeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
    "createdByPlatformUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformFeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformFeatureFlagOverride" (
    "id" TEXT NOT NULL,
    "featureFlagId" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformFeatureFlagOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformIncident" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "PlatformIncidentSeverity" NOT NULL,
    "status" "PlatformIncidentStatus" NOT NULL DEFAULT 'INVESTIGATING',
    "affectedService" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "identifiedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdByPlatformUserId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformIncident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformJobExecution" (
    "id" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "executionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "durationMs" INTEGER,
    "attempts" INTEGER NOT NULL DEFAULT 1,
    "error" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformJobExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformMfaCredential" (
    "id" TEXT NOT NULL,
    "platformUserId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "secretEncrypted" TEXT,
    "enabledAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformMfaCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformLoginAttempt" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "successful" BOOLEAN NOT NULL,
    "failureReason" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformLoginAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformUser_email_key" ON "PlatformUser"("email");

-- CreateIndex
CREATE INDEX "PlatformUser_status_idx" ON "PlatformUser"("status");

-- CreateIndex
CREATE INDEX "PlatformUser_createdAt_idx" ON "PlatformUser"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRole_code_key" ON "PlatformRole"("code");

-- CreateIndex
CREATE INDEX "PlatformRole_isActive_idx" ON "PlatformRole"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformPermission_code_key" ON "PlatformPermission"("code");

-- CreateIndex
CREATE INDEX "PlatformPermission_module_idx" ON "PlatformPermission"("module");

-- CreateIndex
CREATE INDEX "PlatformUserRole_platformRoleId_idx" ON "PlatformUserRole"("platformRoleId");

-- CreateIndex
CREATE INDEX "PlatformUserRole_expiresAt_idx" ON "PlatformUserRole"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformUserRole_platformUserId_platformRoleId_key" ON "PlatformUserRole"("platformUserId", "platformRoleId");

-- CreateIndex
CREATE INDEX "PlatformRolePermission_permissionId_idx" ON "PlatformRolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRolePermission_platformRoleId_permissionId_key" ON "PlatformRolePermission"("platformRoleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSession_refreshTokenHash_key" ON "PlatformSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "PlatformSession_platformUserId_idx" ON "PlatformSession"("platformUserId");

-- CreateIndex
CREATE INDEX "PlatformSession_expiresAt_idx" ON "PlatformSession"("expiresAt");

-- CreateIndex
CREATE INDEX "PlatformSession_revokedAt_idx" ON "PlatformSession"("revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformInvitation_tokenHash_key" ON "PlatformInvitation"("tokenHash");

-- CreateIndex
CREATE INDEX "PlatformInvitation_email_idx" ON "PlatformInvitation"("email");

-- CreateIndex
CREATE INDEX "PlatformInvitation_expiresAt_idx" ON "PlatformInvitation"("expiresAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_actorPlatformUserId_createdAt_idx" ON "PlatformAuditLog"("actorPlatformUserId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_targetBusinessId_createdAt_idx" ON "PlatformAuditLog"("targetBusinessId", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_resourceType_resourceId_idx" ON "PlatformAuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_action_createdAt_idx" ON "PlatformAuditLog"("action", "createdAt");

-- CreateIndex
CREATE INDEX "PlatformAuditLog_correlationId_idx" ON "PlatformAuditLog"("correlationId");

-- CreateIndex
CREATE INDEX "SupportTicket_businessId_status_idx" ON "SupportTicket"("businessId", "status");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedPlatformUserId_status_idx" ON "SupportTicket"("assignedPlatformUserId", "status");

-- CreateIndex
CREATE INDEX "SupportTicket_priority_status_idx" ON "SupportTicket"("priority", "status");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_businessId_ticketNumber_key" ON "SupportTicket"("businessId", "ticketNumber");

-- CreateIndex
CREATE INDEX "SupportMessage_ticketId_createdAt_idx" ON "SupportMessage"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportMessage_platformUserId_idx" ON "SupportMessage"("platformUserId");

-- CreateIndex
CREATE INDEX "SupportAttachment_ticketId_idx" ON "SupportAttachment"("ticketId");

-- CreateIndex
CREATE INDEX "SupportAttachment_messageId_idx" ON "SupportAttachment"("messageId");

-- CreateIndex
CREATE INDEX "SupportTicketEvent_ticketId_createdAt_idx" ON "SupportTicketEvent"("ticketId", "createdAt");

-- CreateIndex
CREATE INDEX "SupportTicketEvent_actorPlatformUserId_idx" ON "SupportTicketEvent"("actorPlatformUserId");

-- CreateIndex
CREATE INDEX "SupportAccessGrant_businessId_status_idx" ON "SupportAccessGrant"("businessId", "status");

-- CreateIndex
CREATE INDEX "SupportAccessGrant_expiresAt_idx" ON "SupportAccessGrant"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformTenantProjection_businessId_key" ON "PlatformTenantProjection"("businessId");

-- CreateIndex
CREATE INDEX "PlatformTenantProjection_businessStatus_registeredAt_idx" ON "PlatformTenantProjection"("businessStatus", "registeredAt");

-- CreateIndex
CREATE INDEX "PlatformTenantProjection_currentSubscriptionStatus_idx" ON "PlatformTenantProjection"("currentSubscriptionStatus");

-- CreateIndex
CREATE INDEX "PlatformTenantProjection_registeredAt_idx" ON "PlatformTenantProjection"("registeredAt");

-- CreateIndex
CREATE INDEX "PlatformTenantProjection_recurringAmountMinor_idx" ON "PlatformTenantProjection"("recurringAmountMinor");

-- CreateIndex
CREATE INDEX "PlatformDailyMetric_metricKey_metricDate_idx" ON "PlatformDailyMetric"("metricKey", "metricDate");

-- CreateIndex
CREATE INDEX "PlatformDailyMetric_dimensionKey_dimensionValue_metricDate_idx" ON "PlatformDailyMetric"("dimensionKey", "dimensionValue", "metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformDailyMetric_metricDate_metricKey_dimensionKey_dimen_key" ON "PlatformDailyMetric"("metricDate", "metricKey", "dimensionKey", "dimensionValue", "currency");

-- CreateIndex
CREATE INDEX "PlatformRevenueDaily_currency_metricDate_idx" ON "PlatformRevenueDaily"("currency", "metricDate");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRevenueDaily_metricDate_currency_key" ON "PlatformRevenueDaily"("metricDate", "currency");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformProjectionCheckpoint_consumerName_key" ON "PlatformProjectionCheckpoint"("consumerName");

-- CreateIndex
CREATE INDEX "PlatformProcessedEvent_processedAt_idx" ON "PlatformProcessedEvent"("processedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformProcessedEvent_consumerName_eventId_key" ON "PlatformProcessedEvent"("consumerName", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "BillingEntitlementDefinition_key_key" ON "BillingEntitlementDefinition"("key");

-- CreateIndex
CREATE INDEX "BillingEntitlementDefinition_category_isActive_idx" ON "BillingEntitlementDefinition"("category", "isActive");

-- CreateIndex
CREATE INDEX "BillingEntitlementDefinition_displayOrder_idx" ON "BillingEntitlementDefinition"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformSetting_key_key" ON "PlatformSetting"("key");

-- CreateIndex
CREATE INDEX "PlatformSetting_updatedAt_idx" ON "PlatformSetting"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformFeatureFlag_key_key" ON "PlatformFeatureFlag"("key");

-- CreateIndex
CREATE INDEX "PlatformFeatureFlagOverride_businessId_idx" ON "PlatformFeatureFlagOverride"("businessId");

-- CreateIndex
CREATE INDEX "PlatformFeatureFlagOverride_expiresAt_idx" ON "PlatformFeatureFlagOverride"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformFeatureFlagOverride_featureFlagId_businessId_key" ON "PlatformFeatureFlagOverride"("featureFlagId", "businessId");

-- CreateIndex
CREATE INDEX "PlatformIncident_status_severity_idx" ON "PlatformIncident"("status", "severity");

-- CreateIndex
CREATE INDEX "PlatformIncident_startedAt_idx" ON "PlatformIncident"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformJobExecution_executionId_key" ON "PlatformJobExecution"("executionId");

-- CreateIndex
CREATE INDEX "PlatformJobExecution_jobName_startedAt_idx" ON "PlatformJobExecution"("jobName", "startedAt");

-- CreateIndex
CREATE INDEX "PlatformJobExecution_status_startedAt_idx" ON "PlatformJobExecution"("status", "startedAt");

-- CreateIndex
CREATE INDEX "PlatformMfaCredential_platformUserId_idx" ON "PlatformMfaCredential"("platformUserId");

-- CreateIndex
CREATE INDEX "PlatformLoginAttempt_email_attemptedAt_idx" ON "PlatformLoginAttempt"("email", "attemptedAt");

-- CreateIndex
CREATE INDEX "PlatformLoginAttempt_ipAddress_attemptedAt_idx" ON "PlatformLoginAttempt"("ipAddress", "attemptedAt");

-- CreateIndex
CREATE INDEX "PlatformLoginAttempt_successful_attemptedAt_idx" ON "PlatformLoginAttempt"("successful", "attemptedAt");

-- AddForeignKey
ALTER TABLE "PlatformUserRole" ADD CONSTRAINT "PlatformUserRole_platformUserId_fkey" FOREIGN KEY ("platformUserId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformUserRole" ADD CONSTRAINT "PlatformUserRole_platformRoleId_fkey" FOREIGN KEY ("platformRoleId") REFERENCES "PlatformRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformRolePermission" ADD CONSTRAINT "PlatformRolePermission_platformRoleId_fkey" FOREIGN KEY ("platformRoleId") REFERENCES "PlatformRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformRolePermission" ADD CONSTRAINT "PlatformRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "PlatformPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSession" ADD CONSTRAINT "PlatformSession_platformUserId_fkey" FOREIGN KEY ("platformUserId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformInvitation" ADD CONSTRAINT "PlatformInvitation_invitedByPlatformUserId_fkey" FOREIGN KEY ("invitedByPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformAuditLog" ADD CONSTRAINT "PlatformAuditLog_actorPlatformUserId_fkey" FOREIGN KEY ("actorPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedPlatformUserId_fkey" FOREIGN KEY ("assignedPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportMessage" ADD CONSTRAINT "SupportMessage_platformUserId_fkey" FOREIGN KEY ("platformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAttachment" ADD CONSTRAINT "SupportAttachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketEvent" ADD CONSTRAINT "SupportTicketEvent_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "SupportTicket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicketEvent" ADD CONSTRAINT "SupportTicketEvent_actorPlatformUserId_fkey" FOREIGN KEY ("actorPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAccessGrant" ADD CONSTRAINT "SupportAccessGrant_requestedByPlatformUserId_fkey" FOREIGN KEY ("requestedByPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportAccessGrant" ADD CONSTRAINT "SupportAccessGrant_approvedByPlatformUserId_fkey" FOREIGN KEY ("approvedByPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformTenantProjection" ADD CONSTRAINT "PlatformTenantProjection_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSetting" ADD CONSTRAINT "PlatformSetting_updatedByPlatformUserId_fkey" FOREIGN KEY ("updatedByPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformFeatureFlag" ADD CONSTRAINT "PlatformFeatureFlag_createdByPlatformUserId_fkey" FOREIGN KEY ("createdByPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformFeatureFlagOverride" ADD CONSTRAINT "PlatformFeatureFlagOverride_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "PlatformFeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformIncident" ADD CONSTRAINT "PlatformIncident_createdByPlatformUserId_fkey" FOREIGN KEY ("createdByPlatformUserId") REFERENCES "PlatformUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformMfaCredential" ADD CONSTRAINT "PlatformMfaCredential_platformUserId_fkey" FOREIGN KEY ("platformUserId") REFERENCES "PlatformUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
