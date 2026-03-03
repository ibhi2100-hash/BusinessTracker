-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CashFlowType" ADD VALUE 'SALE_INCOME';
ALTER TYPE "CashFlowType" ADD VALUE 'PURCHASE_EXPENSE';
ALTER TYPE "CashFlowType" ADD VALUE 'ASSET_PURCHASE';
ALTER TYPE "CashFlowType" ADD VALUE 'LIABILITY_PAYMENT';
ALTER TYPE "CashFlowType" ADD VALUE 'EXPENSE';
