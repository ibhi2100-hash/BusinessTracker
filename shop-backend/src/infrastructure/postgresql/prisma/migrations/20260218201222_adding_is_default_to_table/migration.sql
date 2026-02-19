-- AlterEnum
ALTER TYPE "CashFlowType" ADD VALUE 'OPENING';

-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false;
