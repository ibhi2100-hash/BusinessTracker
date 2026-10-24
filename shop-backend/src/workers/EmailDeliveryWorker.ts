// Conceptual worker flow; adapt to your existing worker framework.
import { prisma } from "../infrastructure/postgresql/prismaClient.js";
import { sendEmployeeInvitationEmail } from "../modules/employeeInvitations/emailService/InvitationEmailService.js";
import "dotenv/config";

export async function processInvitationDelivery(deliveryId: string) {

   const recipient = process.env.TEST_EMAIL;
   
       if (!recipient) {
           throw new Error("TEST_EMAIL is missing");
       }
    
  // 1. Atomically claim the delivery job.
  // Use a transaction/conditional update and a recoverable lease.
  const delivery = await claimDelivery(deliveryId);

  if (!delivery) return;

  // 2. Check the authoritative invitation state.
  const invitation = await prisma.employeeInvitation.findUnique({
    where: { id: delivery.invitationId },
    include: { employee: true, business: true, branch: true },
  });

  if (
    !invitation ||
    invitation.status !== "PENDING" ||
    !invitation.expiresAt ||
    invitation.expiresAt <= new Date() ||
    invitation.employee.employmentStatus !== "INVITED"
  ) {
    await cancelDelivery(delivery.id);
    return;
  }

  // 3. Decrypt only inside the protected delivery workflow.
  const rawToken = decryptInvitationToken(delivery.encryptedToken!);

  const signupUrl = new URL(
    "/employee-signup",
    process.env.FRONTEND_URL,
  );
  signupUrl.searchParams.set("token", rawToken);

  // 4. Send using your existing Resend provider integration.
  // Record SENT only after the provider accepts the request.
  await sendEmployeeInvitationEmail(
    recipient,
    {
    employeeName: invitation.employee.fullName,
    businessName: invitation.business.name,
    branchName: invitation.branch?.name ?? null,
    role: invitation.employee.role,
    inviterName: invitation.business.name,
    expiryDate: invitation.expiresAt.toLocaleString(),
    invitationUrl: signupUrl.toString(),
  });

  await markDeliverySent(delivery.id);
}