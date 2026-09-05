import {
    Prisma
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

import {
    AggregateVersionConflictError
} from "../conflict/conflictError.js";


export class AggregateRepository {

    /*
     * ============================================================
     * READ AGGREGATE VERSION
     *
     * Missing aggregate = version 0.
     *
     * This is useful outside transactions, for example when
     * constructing conflict responses.
     * ============================================================
     */
    async getAggregateVersion(
        aggregateId: string,
        aggregateType: string,
    ): Promise<number> {

        const aggregate =
            await prisma.aggregate.findUnique({
                where: {
                    aggregateType_aggregateId: {
                        aggregateId: aggregateId,
                        aggregateType: aggregateType,
                    },
                },
                select: {
                    version: true,
                },
            });

        return aggregate?.version ?? 0;
    }


    /*
     * ============================================================
     * READ AGGREGATE VERSION INSIDE TRANSACTION
     * ============================================================
     */
    async getAggregateVersionTx(
        aggregateId: string,
        aggregateType: string,
        tx: Prisma.TransactionClient,
    ): Promise<number> {

        const aggregate =
            await tx.aggregate.findUnique({
                where: {
                    aggregateType_aggregateId: {
                        aggregateId: aggregateId,
                        aggregateType: aggregateType,
                    },
                },
                select: {
                    version: true,
                },
            });

        return aggregate?.version ?? 0;
    }


    /*
     * ============================================================
     * ADVANCE AGGREGATE VERSION
     *
     * expectedVersion = 0
     *     → aggregate must NOT exist
     *     → create aggregate at version 1
     *
     * expectedVersion > 0
     *     → aggregate must already exist at expectedVersion
     *     → atomically increment
     * ============================================================
     */
    async advanceVersion(
        aggregateId: string,
        aggregateType: string,
        expectedVersion: number,
        tx: Prisma.TransactionClient,
    ): Promise<number> {

        /*
         * --------------------------------------------------------
         * FIRST EVENT OF A NEW AGGREGATE
         * --------------------------------------------------------
         */

        if (expectedVersion === 0) {

            try {

                const aggregate =
                    await tx.aggregate.create({
                        data: {
                            aggregateId,
                            aggregateType,
                            version: 1,
                        },
                    });

                return aggregate.version;

            } catch (error) {

                /*
                 * Another transaction may have created the same
                 * aggregate between our initial check and this
                 * CREATE.
                 *
                 * The UNIQUE constraint is the final concurrency
                 * guard.
                 */

                if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === "P2002"
                ) {

                    throw new AggregateVersionConflictError(
                        aggregateId,
                        aggregateType,
                        expectedVersion,
                    );
                }

                throw error;
            }
        }


        /*
         * --------------------------------------------------------
         * EXISTING AGGREGATE
         *
         * Compare-and-swap:
         *
         * UPDATE Aggregate
         * SET version = version + 1
         * WHERE
         *   aggregateId = ?
         *   aggregateType = ?
         *   version = expectedVersion
         * --------------------------------------------------------
         */

        const result =
            await tx.aggregate.updateMany({
                where: {
                    aggregateId,
                    aggregateType,
                    version: expectedVersion,
                },

                data: {
                    version: {
                        increment: 1,
                    },
                },
            });


        if (result.count !== 1) {

            throw new AggregateVersionConflictError(
                aggregateId,
                aggregateType,
                expectedVersion,
            );
        }


        return expectedVersion + 1;
    }
}