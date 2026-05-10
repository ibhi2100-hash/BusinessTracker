-- CreateTable
CREATE TABLE "DeviceClock" (
    "deviceId" TEXT NOT NULL,
    "lastClock" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceClock_pkey" PRIMARY KEY ("deviceId")
);
