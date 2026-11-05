import {
    InvitationDeliveryStatus,
    Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


export class InvitationDeliveryRepository {

    /**
     * Atomically claims a delivery.
     * Only one worker can claim a pending delivery.
     */
    static async claimDelivery(deliveryId: string) {

        const now = new Date();

        const result = await prisma.invitationDelivery.updateMany({
            where: {
                id: deliveryId,
                status: InvitationDeliveryStatus.PENDING,
                nextAttemptAt: {
                    lte: now,
                },
                attempts: {
                    lt: 5,
                },
            },
            data: {
                status: InvitationDeliveryStatus.PROCESSING,
                attempts: {
                    increment: 1,
                },
            },
        });

        if (result.count !== 1) {
            return null;
        }

        return prisma.invitationDelivery.findUnique({
            where: {
                id: deliveryId,
            },
        });
    }


    /**
     * Cancels a delivery when its invitation is no longer valid.
     */
    static async cancelDelivery(deliveryId: string) {

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


    /**
     * Marks delivery as sent after provider acceptance.
     */
    static async markDeliverySent(deliveryId: string) {

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
}