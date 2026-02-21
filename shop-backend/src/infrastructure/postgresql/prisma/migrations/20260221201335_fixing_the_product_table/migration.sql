/*
  Warnings:

  - Made the column `branchId` on table `CashFlow` required. This step will fail if there are existing NULL values in that column.
  - Made the column `costPrice` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sellingPrice` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CashFlow" DROP CONSTRAINT "CashFlow_branchId_fkey";

-- AlterTable
ALTER TABLE "CashFlow" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "costPrice" SET NOT NULL,
ALTER COLUMN "sellingPrice" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "CashFlow" ADD CONSTRAINT "CashFlow_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
