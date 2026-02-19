/*
  Warnings:

  - The values [STOCK_IN,STOCK_OUT] on the enum `StockMovementType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `salvageValue` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `disposalAmount` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `currentValue` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `totalCost` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `CapitalExpenditure` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `salary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `outstandingAmount` on the `Liability` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `interestRate` on the `Loan` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `LoanRepayment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `amount` on the `SalaryAccrual` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `remainintQty` on the `StockMovement` table. All the data in the column will be lost.
  - Added the required column `branchId` to the `StockMovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessId` to the `StockMovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StockMovementType_new" AS ENUM ('OPENING', 'PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT');
ALTER TABLE "StockMovement" ALTER COLUMN "type" TYPE "StockMovementType_new" USING ("type"::text::"StockMovementType_new");
ALTER TYPE "StockMovementType" RENAME TO "StockMovementType_old";
ALTER TYPE "StockMovementType_new" RENAME TO "StockMovementType";
DROP TYPE "public"."StockMovementType_old";
COMMIT;

-- DropIndex
DROP INDEX "ExpenseCategory_name_key";

-- AlterTable
ALTER TABLE "Asset" ALTER COLUMN "salvageValue" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "disposalAmount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "currentValue" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "totalCost" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "CapitalExpenditure" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "CashFlow" ADD COLUMN     "balanceAfter" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "salary" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Liability" ALTER COLUMN "outstandingAmount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "LoanRepayment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "reference" TEXT;

-- AlterTable
ALTER TABLE "SalaryAccrual" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "costPrice" DECIMAL(65,30);

-- AlterTable
ALTER TABLE "StockMovement" DROP COLUMN "remainintQty",
ADD COLUMN     "branchId" TEXT NOT NULL,
ADD COLUMN     "businessId" TEXT NOT NULL,
ADD COLUMN     "remainingQty" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
