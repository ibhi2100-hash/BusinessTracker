/*
  Warnings:

  - You are about to drop the column `balanceAfter` on the `CashFlow` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `CashFlow` table. All the data in the column will be lost.
  - You are about to drop the column `isLocked` on the `CashFlow` table. All the data in the column will be lost.
  - You are about to drop the column `isOpening` on the `CashFlow` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `CashFlow` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the `LedgerAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `account` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventId` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LedgerAccount" DROP CONSTRAINT "LedgerAccount_businessId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_accountId_fkey";

-- DropIndex
DROP INDEX "CashFlow_businessId_idx";

-- DropIndex
DROP INDEX "CashFlow_createdAt_idx";

-- AlterTable
ALTER TABLE "CashFlow" DROP COLUMN "balanceAfter",
DROP COLUMN "description",
DROP COLUMN "isLocked",
DROP COLUMN "isOpening",
DROP COLUMN "source";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "accountId",
DROP COLUMN "type",
ADD COLUMN     "account" TEXT NOT NULL,
ADD COLUMN     "branchId" TEXT NOT NULL,
ADD COLUMN     "eventId" TEXT NOT NULL;

-- DropTable
DROP TABLE "LedgerAccount";

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceId" TEXT,
    "sequence" INTEGER,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchSnapshot" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "lastEventId" TEXT,
    "cashBalance" DECIMAL(65,30) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventorySnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventorySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_businessId_branchId_idx" ON "Event"("businessId", "branchId");

-- CreateIndex
CREATE UNIQUE INDEX "InventorySnapshot_productId_branchId_key" ON "InventorySnapshot"("productId", "branchId");

-- CreateIndex
CREATE INDEX "CashFlow_businessId_branchId_idx" ON "CashFlow"("businessId", "branchId");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchSnapshot" ADD CONSTRAINT "BranchSnapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySnapshot" ADD CONSTRAINT "InventorySnapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventorySnapshot" ADD CONSTRAINT "InventorySnapshot_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
