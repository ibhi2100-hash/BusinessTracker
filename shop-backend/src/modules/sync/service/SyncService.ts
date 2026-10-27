import { BackendEvent, DomainEvent } from "@business/shared-types";

import { RepositoryRegistry } from "../repositories/RepositoryRegistry.js";
import { EventValidator } from "./EventValidator.js";

import {
    PushEventsResponse,
    AcceptedEventResult,
    ConflictEventResult,
    RejectedEventResult,
} from "./SyncProtocol.js";
import { EventMapper } from "../repositories/eventRepository.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import {
    AggregateVersionConflictError,
} from "../conflict/conflictError.js";

const DEFAULT_PULL_LIMIT = 100;
const MAX_PULL_LIMIT = 500;
const ZERO_CURSOR = "0";


export interface BootstrapSnapshot {
    business: unknown;
    branches: unknown[];
    products: unknown[];
    inventories: unknown[];
    sales: unknown[];
    expenses: unknown[];
    ledgerEntries: unknown[];

    /**
     * Global event position represented by this snapshot.
     *
     * The client must treat this as the starting point for
     * subsequent event synchronization.
     */
    snapshotPosition: bigint;
}

export interface PullInput {
  businessId: string;
  cursor: string;
  limit?: number;
}
export interface SyncPullResult {
  businessId: string;
  events: BackendEvent[];
  cursor: string;
  hasMore: boolean;
  limit: number;
}

export class SyncInputError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = "SyncInputError";
  }
}
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

                            try {
                                /*
                                 * =================================================
                                 * 1. ADVANCE / CREATE AGGREGATE
                                 * =================================================
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
                                 * =================================================
                                 * 2. APPEND EVENT
                                 * =================================================
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
                                 * =================================================
                                 * 3. APPEND OUTBOX
                                 * =================================================
                                 */

                                await this.repositories
                                    .outbox
                                    .append(
                                        savedEvent,
                                        tx,
                                    );


                                return savedEvent;


                            } catch (error) {

                                console.error(
                                    "[TX] ERROR INSIDE TRANSACTION",
                                    {
                                        eventId:
                                            event.id,

                                        aggregateId:
                                            event.aggregateId,

                                        aggregateType:
                                            event.aggregateType,

                                        error,
                                    }
                                );

                                throw error;
                            }
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
                     * The transaction has already rolled back.
                     *
                     * Read authoritative server state outside
                     * the failed transaction.
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


    /*
     * =========================================================
     * PULL
     * =========================================================
     */

   async pull(input: PullInput): Promise<SyncPullResult> {
    const businessId = this.validateBusinessId(input.businessId);
    const cursor = this.parseCursor(input.cursor);
    const limit = this.parseLimit(input.limit);

    return prisma.$transaction(
        async (tx) => {
        // Capture the business stream boundary and event page in one snapshot.
        const checkpoint =
            await this.repositories.events.getBusinessPosition(
            tx,
            businessId,
            );

        if (cursor > checkpoint) {
            throw new SyncInputError(
            "Cursor is ahead of the business stream. Bootstrap or resynchronize this device.",
            409,
            );
        }

        const rows = await this.repositories.events.getEventsAfter(
            tx,
            businessId,
            cursor,
            limit,
            checkpoint,
        );

        const hasMore = rows.length > limit;
        const page = hasMore ? rows.slice(0, limit) : rows;

        // Advance only as far as the last returned event when more remain.
        // Otherwise, advance to the checkpoint captured in this transaction.
        const nextCursor = hasMore
            ? page[page.length - 1]?.businessPosition
            : checkpoint;

        return {
            businessId,
            events: page.map((row) => EventMapper.fromRow(row)),
            cursor: nextCursor?.toString() ?? "",
            hasMore,
            limit,
        };
        },
        {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        },
    );
    }

    private validateBusinessId(value: unknown): string {
    if (typeof value !== "string" || value.trim().length === 0) {
        throw new SyncInputError("businessId is required.");
    }

    const businessId = value.trim();

    if (businessId.length > 128) {
        throw new SyncInputError("businessId is invalid.");
    }

    return businessId;
    }

    private parseCursor(value: unknown): bigint {
    if (
        typeof value !== "string" ||
        !/^(0|[1-9]\d*)$/.test(value)
    ) {
        throw new SyncInputError(
        "cursor must be a non-negative decimal integer string.",
        );
    }

    return BigInt(value);
    }

    private parseLimit(value: unknown): number {
    if (value === undefined || value === null) {
        return DEFAULT_PULL_LIMIT;
    }

    const limit =
        typeof value === "number"
        ? value
        : typeof value === "string" && /^\d+$/.test(value)
            ? Number(value)
            : Number.NaN;

    if (
        !Number.isSafeInteger(limit) ||
        limit < 1 ||
        limit > MAX_PULL_LIMIT
    ) {
        throw new SyncInputError(
        `limit must be an integer between 1 and ${MAX_PULL_LIMIT}.`,
        );
    }

    return limit;
    }

    /*
     * =========================================================
     * BOOTSTRAP
     * =========================================================
     *
     * Creates the initial read-model snapshot for a new device.
     *
     * The snapshot is scoped to one business + branch context.
     *
     * Business-wide projections are loaded by businessId.
     * Branch-operational projections are loaded by
     * businessId + branchId.
     * =========================================================
     */

    async bootstrap(
        businessId: string,
        branchId: string
    ): Promise<BootstrapSnapshot> {

        return prisma.$transaction(
            async (tx) => {

                /*
                * ---------------------------------------------------------
                * LOAD BUSINESS
                * ---------------------------------------------------------
                */

                const business =
                    await this.repositories
                        .business
                        .findByBusinessId(
                            businessId,
                            tx
                        );


                if (!business) {

                    throw new Error(
                        `Business not found: ${businessId}`
                    );
                }


                /*
                * ---------------------------------------------------------
                * LOAD + VALIDATE BRANCHES
                * ---------------------------------------------------------
                *
                * The branch must belong to the requested business.
                * ---------------------------------------------------------
                */

                const branches =
                    await this.repositories
                        .branch
                        .findByBusinessId(
                            businessId,
                            tx
                        );


                const branch =
                    branches.find(
                        item =>
                            item.id === branchId
                    );


                if (!branch) {

                    throw new Error(
                        `Branch ${branchId} does not belong to business ${businessId}`
                    );
                }


                /*
                * ---------------------------------------------------------
                * CAPTURE SNAPSHOT POSITION
                * ---------------------------------------------------------
                *
                * IMPORTANT:
                *
                * This MUST use the same transaction.
                *
                * The position becomes the synchronization boundary
                * represented by the snapshot.
                *
                * The client will subsequently pull:
                *
                *     globalPosition > snapshotPosition
                * ---------------------------------------------------------
                */

                const snapshotPosition =
                    await this.repositories.events.getBusinessPosition(
                        tx,
                        businessId,
                    );

                /*
                * ---------------------------------------------------------
                * LOAD PROJECTIONS
                * ---------------------------------------------------------
                *
                * All reads use the same transaction.
                * ---------------------------------------------------------
                */

                const [
                    products,
                    inventories,
                    sales,
                    expenses,
                    ledgerEntries,
                ] = await Promise.all([

                    /*
                    * Product is business-scoped.
                    *
                    * branchId may be nullable, therefore we must not
                    * restrict products to the selected branch.
                    */
                    this.repositories
                        .products
                        .findByBusinessId(
                            businessId,
                            tx
                        ),


                    /*
                    * Inventory is business + branch scoped.
                    */
                    this.repositories
                        .inventory
                        .findByBusinessAndBranch(
                            businessId,
                            branchId,
                            tx
                        ),


                    /*
                    * Sales are business + branch scoped.
                    */
                    this.repositories
                        .sales
                        .findByBusinessIdAndBranchId(
                            businessId,
                            branchId,
                            tx
                        ),


                    /*
                    * Expenses are business + branch scoped.
                    */
                    this.repositories
                        .expense
                        .findByBusinessIdAndBranchId(
                            businessId,
                            branchId,
                            tx
                        ),


                    /*
                    * Ledger is business + branch scoped.
                    */
                    this.repositories
                        .ledger
                        .getByBusinessAndBranch(
                            businessId,
                            branchId,
                            tx
                        ),
                ]);


                /*
                * ---------------------------------------------------------
                * RETURN SNAPSHOT
                * ---------------------------------------------------------
                */

                return {

                    businessId,

                    branchId,

                    business,

                    branches,

                    products,

                    inventories,

                    sales,

                    expenses,

                    ledgerEntries,

                    snapshotPosition,
                };
            }
        );
    }
}