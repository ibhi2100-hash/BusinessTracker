import { DomainEvent } from "@business/shared-types";
import { RepositoryRegistry } from "../repositories/RepositoryRegistry.js";
import { EventValidator } from "./EventValidator.js";
import {
    PushEventsResponse,
    AcceptedEventResult,
    ConflictEventResult,
    RejectedEventResult,
} from "./SyncProtocol.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { AggregateVersionConflictError } from "../conflict/conflictError.js";


export class OfflineSyncService {

    constructor(
        private readonly repositories: RepositoryRegistry,
        private readonly eventValidator: EventValidator
    ) {}


    async push(
        events: DomainEvent[]
    ): Promise<PushEventsResponse> {

        const accepted:
            AcceptedEventResult[] = [];

        const conflicts:
            ConflictEventResult[] = [];

        const rejected:
            RejectedEventResult[] = [];


        /*
         * ---------------------------------------------------------
         * EMPTY BATCH
         * ---------------------------------------------------------
         */

        if (events.length === 0) {

            return {
                accepted: [],
                conflicts: [],
                rejected: [],

                summary: {
                    total: 0,
                    accepted: 0,
                    alreadyAccepted: 0,
                    conflicts: 0,
                    rejected: 0,
                },
            };
        }


        /*
         * ---------------------------------------------------------
         * PROCESS EVENTS SEQUENTIALLY
         *
         * This is intentional.
         *
         * Events from the same aggregate may depend on the
         * immediately preceding event.
         * ---------------------------------------------------------
         */

        for (const event of events) {

            /*
             * =====================================================
             * 1. VALIDATE EVENT ENVELOPE
             * =====================================================
             */

            try {

                await this.eventValidator.validate(
                    event
                );

            } catch (error) {

                rejected.push({
                    eventId:
                        event.id,

                    aggregateId:
                        event.aggregateId,

                    aggregateType:
                        event.aggregateType,

                    status:
                        "REJECTED",

                    reason:
                        error instanceof Error
                            ? error.message
                            : String(error),
                });

                continue;
            }


            /*
             * =====================================================
             * 2. IDEMPOTENCY CHECK
             *
             * Has this exact event already been accepted?
             * =====================================================
             */

            const existing =
                await this.repositories.events.findById(
                    event.id
                );


            if (existing) {

                accepted.push({

                    eventId:
                        existing.id,

                    aggregateId:
                        existing.aggregateId,

                    aggregateType:
                        existing.aggregateType,

                    aggregateVersion:
                        existing.aggregateVersion,

                    globalPosition:
                        existing.globalPosition,

                    status:
                        "ALREADY_ACCEPTED",
                });

                continue;
            }


            /*
             * =====================================================
             * 3. ATOMIC PERSISTENCE
             * =====================================================
             */

            try {
                
                const saved =
                    await prisma.$transaction(
                        async (tx) => {

                            /*
                            * =====================================================
                            * ADVANCE / CREATE AGGREGATE STREAM HEAD
                            *
                            * expectedVersion = 0:
                            *     creates aggregate at version 1
                            *
                            * expectedVersion > 0:
                            *     atomically increments existing aggregate
                            *
                            * Any mismatch throws AggregateVersionConflictError.
                            * =====================================================
                            */

                            const aggregateVersion =
                                await this.repositories
                                    .aggregates
                                    .advanceVersion(
                                        event.aggregateId,
                                        event.aggregateType,
                                        event.expectedAggregateVersion,
                                        tx,
                                    );


                            /*
                            * =====================================================
                            * APPEND EVENT
                            * =====================================================
                            */

                            const savedEvent =
                                await this.repositories
                                    .events
                                    .append(
                                        event,
                                        aggregateVersion,
                                        tx,
                                    );


                            /*
                            * =====================================================
                            * APPEND OUTBOX
                            * =====================================================
                            */

                            await this.repositories
                                .outbox
                                .append(
                                    savedEvent,
                                    tx,
                                );


                            return savedEvent;
                        }
                    );

                /*
                 * ================================================
                 * TRANSACTION SUCCESS
                 * ================================================
                 */

                accepted.push({

                    eventId:
                        saved.eventId,

                    aggregateId:
                        saved.aggregateId,

                    aggregateType:
                        saved.aggregateType,

                    aggregateVersion:
                        saved.aggregateVersion,

                    globalPosition:
                        saved.globalPosition,

                    status:
                        "ACCEPTED",
                });


            } catch (error) {


                /*
                 * =================================================
                 * 4. CONFLICT
                 * =================================================
                 */

                if (
                    error
                    instanceof AggregateVersionConflictError
                ) {

                    /*
                     * The transaction rolled back.
                     *
                     * Now read the authoritative server state
                     * outside the transaction.
                     */

                    const serverVersion =
                        await this.repositories
                            .aggregates
                            .getAggregateVersion(
                                event.aggregateId,
                                event.aggregateType,
                            );


                    const serverEvents =
                        await this.repositories
                            .events
                            .loadAggregateTail(
                                event.aggregateId,
                                event.aggregateType,
                                event.expectedAggregateVersion
                            );


                    conflicts.push({

                        eventId:
                            event.id,

                        aggregateId:
                            event.aggregateId,

                        aggregateType:
                            event.aggregateType,

                        expectedAggregateVersion:
                            event.expectedAggregateVersion,

                        serverAggregateVersion:
                            serverVersion!,

                        serverEvents,

                        status:
                            "CONFLICT",
                    });


                    continue;
                }


                /*
                 * =================================================
                 * 5. OTHER FAILURE
                 * =================================================
                 */

                rejected.push({

                    eventId:
                        event.id,

                    aggregateId:
                        event.aggregateId,

                    aggregateType:
                        event.aggregateType,

                    status:
                        "REJECTED",

                    reason:
                        error instanceof Error
                            ? error.message
                            : String(error),
                });
            }
        }


        /*
         * =========================================================
         * FINAL RESPONSE
         * =========================================================
         */

        return {

            accepted,

            conflicts,

            rejected,

            summary: {

                total:
                    events.length,

                accepted:
                    accepted.filter(
                        event =>
                            event.status === "ACCEPTED"
                    ).length,

                alreadyAccepted:
                    accepted.filter(
                        event =>
                            event.status ===
                            "ALREADY_ACCEPTED"
                    ).length,

                conflicts:
                    conflicts.length,

                rejected:
                    rejected.length,
            },
        };
    }
}