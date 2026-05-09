/*
  Warnings:

  - Added the required column `direction` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LedgerDirection" AS ENUM ('DEBIT', 'CREDIT');

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN     "direction" "LedgerDirection" NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;
