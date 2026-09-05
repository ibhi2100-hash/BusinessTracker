/*
  Warnings:

  - You are about to drop the column `branchBusinessId` on the `Product` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Product_branchId_branchBusinessId_idx";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "branchBusinessId";
