/*
  Warnings:

  - Added the required column `aggregateVersion` to the `OutboxEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OutboxEvent" ADD COLUMN     "aggregateVersion" INTEGER NOT NULL,
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;
