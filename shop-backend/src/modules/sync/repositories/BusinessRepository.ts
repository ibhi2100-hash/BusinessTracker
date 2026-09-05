import {
    Business as PrismaBusiness,
    Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
    prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";

import {
    Business,
} from "@business/shared-types";


export class BusinessRepository {

    /*
     * ---------------------------------------------------------
     * UPSERT
     * ---------------------------------------------------------
     */

    async upsert(
        state: Business,
        tx: Prisma.TransactionClient = prisma
    ): Promise<void> {

        await tx.business.upsert(
            BusinessMapper.toUpsertArgs(
                state
            )
        );
    }


    /*
     * ---------------------------------------------------------
     * FIND BY ID
     * ---------------------------------------------------------
     */

    async findById(
        id: string,
        tx: Prisma.TransactionClient = prisma
    ): Promise<Business | null> {

        console.log(
            "Looking for business:",
            id
        );


        const row =
            await tx.business.findUnique({

                where: {
                    id,
                },
            });


        if (!row) {
            return null;
        }


        return BusinessMapper.fromRow(
            row
        );
    }


    /*
     * ---------------------------------------------------------
     * FIND ALL
     * ---------------------------------------------------------
     */

    async findAll(
        tx: Prisma.TransactionClient = prisma
    ): Promise<Business[]> {

        const rows =
            await tx.business.findMany({

                orderBy: {
                    createdAt: "asc",
                },
            });


        return rows.map(
            BusinessMapper.fromRow
        );
    }


    /*
     * ---------------------------------------------------------
     * DELETE
     * ---------------------------------------------------------
     */

    async delete(
        id: string,
        tx: Prisma.TransactionClient = prisma
    ): Promise<void> {

        await tx.business.delete({

            where: {
                id,
            },
        });
    }


    /*
     * ---------------------------------------------------------
     * ACTIVATE BUSINESS
     * ---------------------------------------------------------
     */

    async activateBusiness(
        state: Business,
        tx: Prisma.TransactionClient = prisma
    ): Promise<void> {

        await tx.business.update({

            where: {
                id: state.id,
            },

            data:
                BusinessMapper.toActivation(
                    state
                ),
        });
    }
}


/*
 * ============================================================
 * BUSINESS MAPPER
 * ============================================================
 */

export class BusinessMapper {

    /*
     * ---------------------------------------------------------
     * DOMAIN → PRISMA UPSERT
     * ---------------------------------------------------------
     */

    static toUpsertArgs(
        business: Business
    ): Prisma.BusinessUpsertArgs {

        return {

            where: {
                id: business.id,
            },

            create: {

                id:
                    business.id,

                name:
                    business.name,

                userId:
                    business.userId ??
                    null,

                address:
                    business.address ??
                    null,

                isOnboarding:
                    business.isOnboarding,

                onboardingCompleted:
                    business.onboardingCompleted,

                status:
                    business.status,

                createdAt:
                    new Date(
                        business.createdAt
                    ),

                activatedAt:
                    business.activatedAt
                        ? new Date(
                            business.activatedAt
                        )
                        : null,
            },

            update: {

                name:
                    business.name,

                userId:
                    business.userId ??
                    null,

                address:
                    business.address ??
                    null,

                isOnboarding:
                    business.isOnboarding,

                onboardingCompleted:
                    business.onboardingCompleted,

                status:
                    business.status,

                activatedAt:
                    business.activatedAt
                        ? new Date(
                            business.activatedAt
                        )
                        : null,
            },
        };
    }


    /*
     * ---------------------------------------------------------
     * PRISMA → DOMAIN
     * ---------------------------------------------------------
     */

    static fromRow(
        row: PrismaBusiness
    ): Business {

        return {

            id:
                row.id,

            name:
                row.name,

            userId:
                row.userId ??
                undefined,

            address:
                row.address ??
                undefined,

            isOnboarding:
                row.isOnboarding,

            onboardingCompleted:
                row.onboardingCompleted,

            status:
                row.status,

            createdAt:
                row.createdAt.getTime(),

            activatedAt:
                row.activatedAt
                    ? row.activatedAt.getTime()
                    : undefined,
        };
    }


    /*
     * ---------------------------------------------------------
     * ACTIVATION
     * ---------------------------------------------------------
     */

    static toActivation(
        business: Business
    ): Prisma.BusinessUpdateInput {

        return {

            activatedAt:
                business.activatedAt
                    ? new Date(
                        business.activatedAt
                    )
                    : null,

            status:
                business.status,

            isOnboarding:
                business.isOnboarding,

            onboardingCompleted:
                business.onboardingCompleted,
        };
    }
}