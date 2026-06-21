/*
  Warnings:

  - You are about to drop the column `deviceId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `isCreationEvent` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `logicClock` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `scope` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `synced` on the `Event` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Event_deviceId_logicClock_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "deviceId",
DROP COLUMN "isCreationEvent",
DROP COLUMN "logicClock",
DROP COLUMN "scope",
DROP COLUMN "status",
DROP COLUMN "synced";
