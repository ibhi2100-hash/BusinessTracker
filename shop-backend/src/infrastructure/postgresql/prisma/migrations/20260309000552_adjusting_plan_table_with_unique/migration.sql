/*
  Warnings:

  - A unique constraint covering the columns `[businessId]` on the table `BusinessSubscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `billingCycle` to the `SubscriptionPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SubscriptionPlan" ADD COLUMN     "billingCycle" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BusinessSubscription_businessId_key" ON "BusinessSubscription"("businessId");
