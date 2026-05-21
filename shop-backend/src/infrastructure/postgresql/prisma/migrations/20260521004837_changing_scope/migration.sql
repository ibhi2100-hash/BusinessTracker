/*
  Warnings:

  - The values [USER] on the enum `Scope` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Scope_new" AS ENUM ('GLOBAL', 'BUSINESS', 'BRANCH');
ALTER TABLE "Event" ALTER COLUMN "scope" TYPE "Scope_new" USING ("scope"::text::"Scope_new");
ALTER TYPE "Scope" RENAME TO "Scope_old";
ALTER TYPE "Scope_new" RENAME TO "Scope";
DROP TYPE "public"."Scope_old";
COMMIT;
