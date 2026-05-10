-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "causationId" TEXT,
ADD COLUMN     "correlationId" TEXT,
ADD COLUMN     "isCreationEvent" BOOLEAN NOT NULL DEFAULT false;
