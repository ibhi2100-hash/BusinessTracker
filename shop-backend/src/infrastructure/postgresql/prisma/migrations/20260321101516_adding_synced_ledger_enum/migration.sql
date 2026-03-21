/*
  Warnings:

  - The values [ASSETS] on the enum `Account` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Account_new" AS ENUM ('CASH', 'INVENTORY', 'REVENUE', 'COGS', 'EXPENSES', 'FIXED_ASSETS', 'LIABILITIES', 'OWNER_CAPITAL', 'OWNER_DRAWINGS', 'INTER_BRANCH');
ALTER TABLE "LedgerEntry" ALTER COLUMN "account" TYPE "Account_new" USING ("account"::text::"Account_new");
ALTER TYPE "Account" RENAME TO "Account_old";
ALTER TYPE "Account_new" RENAME TO "Account";
DROP TYPE "public"."Account_old";
COMMIT;
