import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { AppendEventResult } from "./eventRepository.js";

export interface PendingOutboxEvent {
    eventId: string;
    aggregateId: string;
    aggregateType: string;
    aggregateVersion: number;
    globalPosition: bigint;
    status: "PENDING";
    attempts: number;
    createdAt: Date;
}

export class OutboxRepository {

    async append(
        event: AppendEventResult,
        tx: Prisma.TransactionClient
    ): Promise<void> {

        await tx.outbox.create({
            data: {
                eventId:
                    event.eventId,

                aggregateId:
                    event.aggregateId,

                aggregateType:
                    event.aggregateType,

                aggregateVersion:
                    event.aggregateVersion,

                globalPosition:
                    BigInt(event.globalPosition),

                status:
                    "PENDING",

                attempts:
                    0,

                createdAt:
                    new Date(),
            },
        });
    }


    async getPending(
        limit: number = 100
    ): Promise<PendingOutboxEvent[]> {

        const rows =
            await prisma.outbox.findMany({
                where: {
                    status: "PENDING",
                },

                orderBy: {
                    globalPosition: "asc",
                },

                take: limit,
            });

        return rows.map(row => ({
            eventId:
                row.eventId,

            aggregateId:
                row.aggregateId,

            aggregateType:
                row.aggregateType,

            aggregateVersion:
                row.aggregateVersion,

            globalPosition:
                row.globalPosition,

            status:
                "PENDING",

            attempts:
                row.attempts,

            createdAt:
                row.createdAt,
        }));
    }


    async markProcessed(
        eventId: string
    ): Promise<void> {

        await prisma.outbox.update({
            where: {
                eventId,
            },

            data: {
                status: "PROCESSED",
                processedAt: new Date(),
            },
        });
    }


    async markFailed(
        eventId: string,
        error: string
    ): Promise<void> {

        await prisma.outbox.update({
            where: {
                eventId,
            },

            data: {
                status: "FAILED",

                attempts: {
                    increment: 1,
                },

                failedAt:
                    new Date(),

                lastError:
                    error,
            },
        });
    }
}