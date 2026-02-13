/*
  Warnings:

  - You are about to drop the column `amount` on the `Liability` table. All the data in the column will be lost.
  - Added the required column `outstandingAmount` to the `Liability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `principalAmount` to the `Liability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Liability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Liability` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Liability` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LiabilityStatus" AS ENUM ('ACTIVE', 'SETTLED');

-- AlterTable
ALTER TABLE "Liability" DROP COLUMN "amount",
ADD COLUMN     "outstandingAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "principalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "LiabilityStatus" NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ALTER COLUMN "interestRate" DROP NOT NULL;
