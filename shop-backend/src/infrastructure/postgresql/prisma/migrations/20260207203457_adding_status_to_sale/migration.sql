-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "status" "SaleStatus" NOT NULL DEFAULT 'COMPLETED';
