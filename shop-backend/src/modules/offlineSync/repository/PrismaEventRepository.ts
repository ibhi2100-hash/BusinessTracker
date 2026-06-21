import { EventRepository } from "@business/events";
import { CanonicalEvent } from "@business/shared-types";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";


export class PrismaEventRepository implements EventRepository<CanonicalEvent> {
    constructor(
        private readonly tx: Prisma.TransactionClient
    ){}

    async append(event: CanonicalEvent): Promise<void> {
       await this.appendMany([event])
    }

    async appendMany(events: CanonicalEvent[]): Promise<void> {
        if (events.length === 0) return;
         
        await this.tx.event.createMany({
            data: events.map(event => ({
                id: event.id,
                businessId: event.businessId,
                branchId: event.branchId,
                aggregateId: event.aggregateId,
                aggregateType:  event.aggregateType,
                aggregateVersion: event.aggregateVersion,
                type: event.type,
                payload: event.payload,
                mode: event.mode,
                userId: event.userId,
                causationId: event.causationId,
                correlationId: event.correlationId,
                createdAt: event.createdAt
            }))
        });
    }

    async loadAggregate(
        aggregateId: string
    ): Promise<CanonicalEvent[]> {

        return this.tx.event.findMany({

            where: {
                aggregateId
            },

            orderBy: {
                aggregateVersion: "asc"
            }

        }) as Promise<CanonicalEvent[]>;
    }
    async loadSince(
        globalPosition: bigint
    ): Promise<CanonicalEvent[]> {

        return this.tx.event.findMany({

            where: {
                globalPosition: {
                    gt: globalPosition
                }
            },

            orderBy: {
                globalPosition: "asc"
            }

        }) as Promise<CanonicalEvent[]>;
    }

    loadByIds(
        ids: string
    ): Promise<CanonicalEvent>[] {

        if (ids.length === 0)
            return [];

        return [
            this.tx.event.findUnique({
                where: {
                    id: ids
                }
            }).then(event => event as CanonicalEvent)
        ];
    }

    async exists(
        eventId: string
    ): Promise<boolean> {

        const event =
            await this.tx.event.findUnique({

                where: {
                    id: eventId
                },

                select: {
                    id: true
                }

            });

        return event !== null;
    }
}