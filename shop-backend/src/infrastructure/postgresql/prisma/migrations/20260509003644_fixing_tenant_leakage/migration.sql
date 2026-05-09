/*
  Warnings:

  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Event` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `quantity` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,6)`.
  - You are about to alter the column `costPrice` on the `Inventory` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,6)`.
  - You are about to alter the column `amount` on the `LedgerEntry` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,6)`.
  - You are about to alter the column `balance` on the `Snapshot` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,6)`.
  - You are about to alter the column `price` on the `SubscriptionPlan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(18,6)`.
  - You are about to drop the `Products` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `passwordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[businessId,name]` on the table `Branch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[aggregateType,aggregateId,version]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,branchId,productId]` on the table `Inventory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[businessId,branchId,account,snapshotType,scope]` on the table `Snapshot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `aggregateId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aggregateType` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Made the column `businessId` on table `Event` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `branchBusinessId` to the `Inventory` table without a default value. This is not possible if the table is not empty.
  - Made the column `businessId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Inventory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `updatedAt` on table `Inventory` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `branchBusinessId` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `Snapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `data` to the `Snapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `Snapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `snapshotType` to the `Snapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `version` to the `Snapshot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_businessId_fkey";

-- DropForeignKey
ALTER TABLE "BusinessSubscription" DROP CONSTRAINT "BusinessSubscription_businessId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Products" DROP CONSTRAINT "Products_businessId_fkey";

-- DropForeignKey
ALTER TABLE "Snapshot" DROP CONSTRAINT "Snapshot_branchId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_branchId_fkey";

-- DropForeignKey
ALTER TABLE "passwordResetToken" DROP CONSTRAINT "passwordResetToken_userId_fkey";

-- DropIndex
DROP INDEX "Alert_branchId_isResolved_idx";

-- DropIndex
DROP INDEX "Alert_branchId_type_isResolved_metadata_key";

-- DropIndex
DROP INDEX "Event_scope_businessId_branchId_version_idx";

-- DropIndex
DROP INDEX "Event_scope_businessId_branchId_version_key";

-- DropIndex
DROP INDEX "ProcessedSyncEvent_branchId_idx";

-- DropIndex
DROP INDEX "ProcessedSyncEvent_id_status_key";

-- DropIndex
DROP INDEX "Snapshot_branchId_account_key";

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "branchBusinessId" TEXT,
ALTER COLUMN "branchId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id", "businessId");

-- AlterTable
ALTER TABLE "Event" DROP CONSTRAINT "Event_pkey",
ADD COLUMN     "aggregateId" TEXT NOT NULL,
ADD COLUMN     "aggregateType" TEXT NOT NULL,
ADD COLUMN     "branchBusinessId" TEXT,
ALTER COLUMN "businessId" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "version" DROP DEFAULT,
ALTER COLUMN "synced" SET DEFAULT false,
ADD CONSTRAINT "Event_pkey" PRIMARY KEY ("id", "businessId");

-- AlterTable
ALTER TABLE "Inventory" ADD COLUMN     "branchBusinessId" TEXT NOT NULL,
ALTER COLUMN "businessId" SET NOT NULL,
ALTER COLUMN "branchId" SET NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "costPrice" SET DATA TYPE DECIMAL(18,6),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN     "branchBusinessId" TEXT NOT NULL,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(18,6);

-- AlterTable
ALTER TABLE "ProcessedSyncEvent" ADD COLUMN     "branchBusinessId" TEXT;

-- AlterTable
ALTER TABLE "Snapshot" ADD COLUMN     "branchBusinessId" TEXT,
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "snapshotType" TEXT NOT NULL,
ADD COLUMN     "version" INTEGER NOT NULL,
ALTER COLUMN "branchId" DROP NOT NULL,
ALTER COLUMN "account" DROP NOT NULL,
ALTER COLUMN "balance" DROP NOT NULL,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,6);

-- AlterTable
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "price" SET DATA TYPE DECIMAL(18,6);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "branchBusinessId" TEXT;

-- DropTable
DROP TABLE "Products";

-- DropTable
DROP TABLE "passwordResetToken";

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT,
    "branchBusinessId" TEXT,
    "sku" TEXT,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "description" TEXT,
    "category" TEXT,
    "costPrice" DECIMAL(18,6) NOT NULL,
    "price" DECIMAL(18,6) NOT NULL,
    "reorderLevel" DECIMAL(18,6),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id","businessId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "Product_businessId_idx" ON "Product"("businessId");

-- CreateIndex
CREATE INDEX "Product_branchId_branchBusinessId_idx" ON "Product"("branchId", "branchBusinessId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_category_idx" ON "Product"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Product_businessId_sku_key" ON "Product"("businessId", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_businessId_barcode_key" ON "Product"("businessId", "barcode");

-- CreateIndex
CREATE INDEX "Alert_branchId_branchBusinessId_isResolved_idx" ON "Alert"("branchId", "branchBusinessId", "isResolved");

-- CreateIndex
CREATE INDEX "Alert_severity_idx" ON "Alert"("severity");

-- CreateIndex
CREATE INDEX "Alert_createdAt_idx" ON "Alert"("createdAt");

-- CreateIndex
CREATE INDEX "Branch_businessId_idx" ON "Branch"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_businessId_name_key" ON "Branch"("businessId", "name");

-- CreateIndex
CREATE INDEX "Business_userId_idx" ON "Business"("userId");

-- CreateIndex
CREATE INDEX "BusinessSubscription_subscriptionId_idx" ON "BusinessSubscription"("subscriptionId");

-- CreateIndex
CREATE INDEX "Event_businessId_idx" ON "Event"("businessId");

-- CreateIndex
CREATE INDEX "Event_branchId_branchBusinessId_idx" ON "Event"("branchId", "branchBusinessId");

-- CreateIndex
CREATE INDEX "Event_aggregateType_aggregateId_idx" ON "Event"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "Event_createdAt_idx" ON "Event"("createdAt");

-- CreateIndex
CREATE INDEX "Event_userId_idx" ON "Event"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_aggregateType_aggregateId_version_key" ON "Event"("aggregateType", "aggregateId", "version");

-- CreateIndex
CREATE INDEX "Inventory_businessId_idx" ON "Inventory"("businessId");

-- CreateIndex
CREATE INDEX "Inventory_branchId_branchBusinessId_idx" ON "Inventory"("branchId", "branchBusinessId");

-- CreateIndex
CREATE INDEX "Inventory_productId_idx" ON "Inventory"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_businessId_branchId_productId_key" ON "Inventory"("businessId", "branchId", "productId");

-- CreateIndex
CREATE INDEX "LedgerEntry_account_idx" ON "LedgerEntry"("account");

-- CreateIndex
CREATE INDEX "LedgerEntry_createdAt_idx" ON "LedgerEntry"("createdAt");

-- CreateIndex
CREATE INDEX "ProcessedSyncEvent_branchId_branchBusinessId_idx" ON "ProcessedSyncEvent"("branchId", "branchBusinessId");

-- CreateIndex
CREATE INDEX "Snapshot_businessId_version_idx" ON "Snapshot"("businessId", "version");

-- CreateIndex
CREATE INDEX "Snapshot_branchId_branchBusinessId_version_idx" ON "Snapshot"("branchId", "branchBusinessId", "version");

-- CreateIndex
CREATE INDEX "Snapshot_snapshotType_idx" ON "Snapshot"("snapshotType");

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_businessId_branchId_account_snapshotType_scope_key" ON "Snapshot"("businessId", "branchId", "account", "snapshotType", "scope");

-- CreateIndex
CREATE INDEX "User_branchId_branchBusinessId_idx" ON "User"("branchId", "branchBusinessId");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessSubscription" ADD CONSTRAINT "BusinessSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_businessId_fkey" FOREIGN KEY ("productId", "businessId") REFERENCES "Product"("id", "businessId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_eventId_businessId_fkey" FOREIGN KEY ("eventId", "businessId") REFERENCES "Event"("id", "businessId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_branchId_branchBusinessId_fkey" FOREIGN KEY ("branchId", "branchBusinessId") REFERENCES "Branch"("id", "businessId") ON DELETE SET NULL ON UPDATE CASCADE;
