/*
  Warnings:

  - Changed the type of `aggregateVersion` on the `Outbox` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Outbox" DROP COLUMN "aggregateVersion",
ADD COLUMN     "aggregateVersion" DECIMAL(65,30) NOT NULL;
