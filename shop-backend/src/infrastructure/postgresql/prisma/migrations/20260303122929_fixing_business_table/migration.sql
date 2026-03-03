/*
  Warnings:

  - The values [INFLOW,OUTFLOW] on the enum `CashFlowType` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `direction` to the `CashFlow` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CashFlowDirection" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "BusinessStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'SUSPENDED');

-- AlterEnum
BEGIN;
CREATE TYPE "CashFlowType_new" AS ENUM ('OPENING', 'SALE_INCOME', 'PURCHASE_EXPENSE', 'ASSET_PURCHASE', 'LIABILITY_PAYMENT', 'EXPENSE');
ALTER TABLE "CashFlow" ALTER COLUMN "type" TYPE "CashFlowType_new" USING ("type"::text::"CashFlowType_new");
ALTER TYPE "CashFlowType" RENAME TO "CashFlowType_old";
ALTER TYPE "CashFlowType_new" RENAME TO "CashFlowType";
DROP TYPE "public"."CashFlowType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "status" "BusinessStatus" NOT NULL DEFAULT 'ONBOARDING';

-- AlterTable
ALTER TABLE "CashFlow" ADD COLUMN     "direction" "CashFlowDirection" NOT NULL;

-- AlterTable
ALTER TABLE "Liability" ADD COLUMN     "isOpening" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "StockMovement" ADD COLUMN     "isOpening" BOOLEAN NOT NULL DEFAULT true;
