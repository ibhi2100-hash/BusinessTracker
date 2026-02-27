/*
  Warnings:

  - A unique constraint covering the columns `[name,categoryId,branchId]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Brand_name_categoryId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_categoryId_branchId_key" ON "Brand"("name", "categoryId", "branchId");
