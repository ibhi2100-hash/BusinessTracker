/*
  Warnings:

  - Added the required column `expiresAt` to the `BusinessSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BusinessSubscription" ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL;
