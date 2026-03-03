/*
  Warnings:

  - Added the required column `assetType` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Made the column `branchId` on table `Asset` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('OPENING', 'PURCHASE', 'SALE');

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_branchId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "assetType" "AssetType" NOT NULL,
ALTER COLUMN "branchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
