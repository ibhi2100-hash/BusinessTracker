/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `EmployeeInvitation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tokenHash` to the `EmployeeInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeInvitation" ADD COLUMN     "tokenHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeInvitation_tokenHash_key" ON "EmployeeInvitation"("tokenHash");
