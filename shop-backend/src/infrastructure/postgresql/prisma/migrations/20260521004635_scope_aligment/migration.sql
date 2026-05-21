/*
  Warnings:

  - Changed the type of `scope` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Scope" AS ENUM ('BUSINESS', 'BRANCH', 'USER');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "scope",
ADD COLUMN     "scope" "Scope" NOT NULL;
