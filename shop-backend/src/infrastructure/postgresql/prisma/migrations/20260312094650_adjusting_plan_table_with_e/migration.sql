/*
  Warnings:

  - Made the column `branchId` on table `Alert` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_branchId_fkey";

-- AlterTable
ALTER TABLE "Alert" ALTER COLUMN "branchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
