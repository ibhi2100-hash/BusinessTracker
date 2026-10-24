-- AlterTable
ALTER TABLE "InvitationDelivery" ADD COLUMN     "encryptedToken" TEXT;

-- AddForeignKey
ALTER TABLE "InvitationDelivery" ADD CONSTRAINT "InvitationDelivery_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "EmployeeInvitation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
