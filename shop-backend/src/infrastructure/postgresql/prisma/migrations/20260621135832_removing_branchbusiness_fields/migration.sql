/*
  Warnings:

  - The primary key for the `Branch` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `branchBusinessId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `branchBusinessId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_branchId_branchBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_branchId_branchBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_branchId_branchBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_branchId_branchBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_branchId_branchBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "Snapshot" DROP CONSTRAINT "Snapshot_branchId_branchBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_branchId_branchBusinessId_fkey";

-- DropIndex
DROP INDEX "Event_branchId_branchBusinessId_idx";

-- DropIndex
DROP INDEX "User_branchId_branchBusinessId_idx";

-- AlterTable
ALTER TABLE "Branch" DROP CONSTRAINT "Branch_pkey",
ADD CONSTRAINT "Branch_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "branchBusinessId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "branchBusinessId";

-- CreateIndex
CREATE INDEX "Event_branchId_idx" ON "Event"("branchId");

-- CreateIndex
CREATE INDEX "User_branchId_businessId_idx" ON "User"("branchId", "businessId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
