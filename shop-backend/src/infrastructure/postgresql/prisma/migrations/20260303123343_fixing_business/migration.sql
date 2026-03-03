-- CreateEnum
CREATE TYPE "ProductStockMode" AS ENUM ('OPENING', 'LIVE');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "stockMode" "ProductStockMode" NOT NULL DEFAULT 'OPENING';
