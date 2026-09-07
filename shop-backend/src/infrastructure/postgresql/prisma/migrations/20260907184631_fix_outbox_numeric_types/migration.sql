/*
  Warnings:

  - You are about to alter the column `attempts` on the `Outbox` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.
  - You are about to alter the column `aggregateVersion` on the `Outbox` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Outbox" ALTER COLUMN "attempts" SET DEFAULT 0,
ALTER COLUMN "attempts" SET DATA TYPE INTEGER,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "aggregateVersion" SET DATA TYPE INTEGER;
