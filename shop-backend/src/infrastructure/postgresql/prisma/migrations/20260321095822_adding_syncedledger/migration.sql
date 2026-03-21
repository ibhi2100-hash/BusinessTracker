/*
  Warnings:

  - You are about to drop the column `referenceId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the `BranchSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CashFlow` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[eventId,index]` on the table `LedgerEntry` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `index` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `account` on the `LedgerEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Account" AS ENUM ('CASH', 'INVENTORY', 'REVENUE', 'COGS', 'EXPENSES', 'ASSETS', 'LIABILITIES', 'OWNER_CAPITAL', 'OWNER_DRAWINGS', 'INTER_BRANCH');

-- DropForeignKey
ALTER TABLE "BranchSnapshot" DROP CONSTRAINT "BranchSnapshot_branchId_fkey";

-- DropForeignKey
ALTER TABLE "CashFlow" DROP CONSTRAINT "CashFlow_branchId_fkey";

-- DropForeignKey
ALTER TABLE "CashFlow" DROP CONSTRAINT "CashFlow_businessId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_branchId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_businessId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "ledgerVersion" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "referenceId",
ADD COLUMN     "index" INTEGER NOT NULL,
DROP COLUMN "account",
ADD COLUMN     "account" "Account" NOT NULL;

-- DropTable
DROP TABLE "BranchSnapshot";

-- DropTable
DROP TABLE "CashFlow";

-- CreateTable
CREATE TABLE "AccountSnapshot" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "account" TEXT NOT NULL,
    "balance" DECIMAL(65,30) NOT NULL,
    "lastEventId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountSnapshot_branchId_account_key" ON "AccountSnapshot"("branchId", "account");

-- CreateIndex
CREATE INDEX "LedgerEntry_businessId_branchId_idx" ON "LedgerEntry"("businessId", "branchId");

-- CreateIndex
CREATE INDEX "LedgerEntry_account_idx" ON "LedgerEntry"("account");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerEntry_eventId_index_key" ON "LedgerEntry"("eventId", "index");

-- AddForeignKey
ALTER TABLE "AccountSnapshot" ADD CONSTRAINT "AccountSnapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
