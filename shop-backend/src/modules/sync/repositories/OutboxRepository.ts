import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { AppendEventResult } from "./eventRepository.js";

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
                    event.globalPosition,

                status:
                    "PENDING",

                attempts:
                    0,

                createdAt:
                    new Date(),
            },
        });
    }
}