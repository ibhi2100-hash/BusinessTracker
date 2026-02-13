-- CreateTable
CREATE TABLE "LiabilityPayment" (
    "id" TEXT NOT NULL,
    "liabilityId" TEXT NOT NULL,

    CONSTRAINT "LiabilityPayment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LiabilityPayment" ADD CONSTRAINT "LiabilityPayment_liabilityId_fkey" FOREIGN KEY ("liabilityId") REFERENCES "Liability"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
