/*
  Warnings:

  - A unique constraint covering the columns `[branchId,type,isResolved,metadata]` on the table `Alert` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE INDEX "Alert_branchId_isResolved_idx" ON "Alert"("branchId", "isResolved");

-- CreateIndex
CREATE INDEX "Alert_businessId_isResolved_idx" ON "Alert"("businessId", "isResolved");

-- CreateIndex
CREATE INDEX "Alert_type_idx" ON "Alert"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Alert_branchId_type_isResolved_metadata_key" ON "Alert"("branchId", "type", "isResolved", "metadata");
