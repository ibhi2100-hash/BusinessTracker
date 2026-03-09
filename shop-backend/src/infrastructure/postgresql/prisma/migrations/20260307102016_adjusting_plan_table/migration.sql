/*
  Warnings:

  - Added the required column `maxProduct` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxStaff` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "maxProduct" INTEGER NOT NULL,
ADD COLUMN     "maxStaff" INTEGER NOT NULL;
