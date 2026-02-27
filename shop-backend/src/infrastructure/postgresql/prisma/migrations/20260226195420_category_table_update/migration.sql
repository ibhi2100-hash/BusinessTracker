/*
  Warnings:

  - A unique constraint covering the columns `[name,categoryId]` on the table `Brand` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,businessId,branchId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Brand_name_businessId_key";

-- DropIndex
DROP INDEX "Category_name_businessId_key";

-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "categoryId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_categoryId_key" ON "Brand"("name", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_businessId_branchId_key" ON "Category"("name", "businessId", "branchId");

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
