import { prisma } from "../infrastructure/postgresql/prismaClient.js";

import {
    InvitationDeliveryStatus,
} from "../infrastructure/postgresql/prisma/generated/client.js";

import {
    sendEmployeeInvitationEmail,
} from "../modules/employeeInvitations/emailService/InvitationEmailService.js";

import { decryptInvitationToken } from "../modules/employeeInvitations/security/invitation-token-crypto.js";
import "dotenv/config";


async function claimDelivery(deliveryId: string) {

    const delivery = await prisma.invitationDelivery.findUnique({
        where: { id: deliveryId },
    });

    if (!delivery) return null;

    if (
        delivery.status !== InvitationDeliveryStatus.PENDING ||
        delivery.nextAttemptAt > new Date() ||
        delivery.attempts >= delivery.maxAttempts
    ) {
        return null;
    }

    const claimed = await prisma.invitationDelivery.updateMany({
        where: {
            id: deliveryId,
            status: InvitationDeliveryStatus.PENDING,
            attempts: delivery.attempts,
            nextAttemptAt: { lte: new Date() },
        },
        data: {
            status: InvitationDeliveryStatus.PROCESSING,
            attempts: { increment: 1 },
        },
    });

    if (claimed.count !== 1) return null;

    return prisma.invitationDelivery.findUnique({
        where: { id: deliveryId },
    });
}


async function cancelDelivery(deliveryId: string) {

    await prisma.invitationDelivery.updateMany({
        where: {
            id: deliveryId,
            status: InvitationDeliveryStatus.PROCESSING,
        },
        data: {
            status: InvitationDeliveryStatus.CANCELLED,
        },
    });
}


async function markDeliverySent(deliveryId: string) {

    await prisma.invitationDelivery.updateMany({
        where: {
            id: deliveryId,
            status: InvitationDeliveryStatus.PROCESSING,
        },
        data: {
            status: InvitationDeliveryStatus.SENT,
            sentAt: new Date(),
            lastError: null,
        },
    });
}


async function recordDeliveryFailure(
    deliveryId: string,
    error: unknown,
) {

    const delivery = await prisma.invitationDelivery.findUnique({
        where: { id: deliveryId },
    });

    if (
        !delivery ||
        delivery.status !== InvitationDeliveryStatus.PROCESSING
    ) {
        return;
    }

    const permanentlyFailed =
        delivery.attempts >= delivery.maxAttempts;

    const retryDelay = Math.min(
        60 * 2 ** Math.max(delivery.attempts - 1, 0),
        3600,
    );

    await prisma.invitationDelivery.updateMany({
        where: {
            id: deliveryId,
            status: InvitationDeliveryStatus.PROCESSING,
        },
        data: {
            status: permanentlyFailed
                ? InvitationDeliveryStatus.FAILED
                : InvitationDeliveryStatus.PENDING,

            nextAttemptAt: new Date(
                Date.now() + retryDelay * 1000,
            ),

            failedAt: permanentlyFailed ? new Date() : null,

            lastError:
                error instanceof Error
                    ? error.message
                    : String(error),
        },
    });
}


export async function processInvitationDelivery(
    deliveryId: string,
) {

    const delivery = await claimDelivery(deliveryId);

    if (!delivery) return;

    try {

        if (!delivery.encryptedToken) {
            throw new Error("Invitation delivery has no encrypted token");
        }

        const invitation = await prisma.employeeInvitation.findUnique({
            where: { id: delivery.invitationId },
            include: {
                employee: true,
                business: true,
                branch: true,
            },
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

        if (delivery.channel !== "EMAIL") {
            throw new Error(
                `Unsupported delivery channel: ${delivery.channel}`,
            );
        }
        const rawToken = decryptInvitationToken(delivery.encryptedToken);
        const frontendUrl = process.env.FRONTEND_URL;

        if (!frontendUrl) {
            throw new Error("FRONTEND_URL is missing");
        }

        const signupUrl = new URL(
            "/employee-signup",
            frontendUrl,
        );

        signupUrl.searchParams.set("token", rawToken);

        await sendEmployeeInvitationEmail(
            delivery.recipient,
            {
                employeeName: invitation.employee.fullName,
                businessName: invitation.business.name,
                branchName: invitation.branch?.name ?? null,
                role: invitation.employee.role,
                inviterName: invitation.business.name,
                expiryDate: invitation.expiresAt.toLocaleString(),
                invitationUrl: signupUrl.toString(),
            },
        );

        await markDeliverySent(delivery.id);

    } catch (error) {

        await recordDeliveryFailure(delivery.id, error);

        throw error;
    }
}