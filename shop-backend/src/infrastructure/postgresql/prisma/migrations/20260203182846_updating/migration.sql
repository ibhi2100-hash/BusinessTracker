/*
  Warnings:

  - You are about to drop the column `createdById` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `CapitalExpenditure` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `Liability` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_createdById_fkey";

-- DropForeignKey
ALTER TABLE "CapitalExpenditure" DROP CONSTRAINT "CapitalExpenditure_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Expense" DROP CONSTRAINT "Expense_userId_fkey";

-- DropForeignKey
ALTER TABLE "Liability" DROP CONSTRAINT "Liability_createdById_fkey";

-- DropIndex
DROP INDEX "Expense_userId_idx";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "CapitalExpenditure" DROP COLUMN "createdById";

-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "Liability" DROP COLUMN "createdById";
