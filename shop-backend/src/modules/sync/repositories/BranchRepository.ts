import {
    Branch as PrismaBranch,
    Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
    prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";

import {
    Branch,
} from "@business/shared-types";


export class BranchRepository {

    /*
     * ---------------------------------------------------------
     * UPSERT
     * ---------------------------------------------------------
     */

    async upsert(
        state: Branch,
        tx: Prisma.TransactionClient = prisma
    ): Promise<void> {

        await tx.branch.upsert(
            BranchMapper.toUpsertArgs(
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
    ): Promise<Branch | null> {

        const row =
            await tx.branch.findUnique({

                where: {
                    id,
                },
            });


        if (!row) {
            return null;
        }


        return BranchMapper.fromRow(
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
    ): Promise<Branch[]> {

        const rows =
            await tx.branch.findMany({

                orderBy: {
                    createdAt: "asc",
                },
            });


        return rows.map(
            BranchMapper.fromRow
        );
    }


    /*
     * ---------------------------------------------------------
     * FIND ALL BRANCHES FOR A BUSINESS
     * ---------------------------------------------------------
     */

    async findByBusinessId(
        businessId: string,
        tx: Prisma.TransactionClient = prisma
    ): Promise<Branch[]> {

        const rows =
            await tx.branch.findMany({

                where: {
                    businessId,
                },

                orderBy: {
                    createdAt: "asc",
                },
            });


        return rows.map(
            BranchMapper.fromRow
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

        await tx.branch.delete({

            where: {
                id,
            },
        });
    }


    /*
     * ---------------------------------------------------------
     * ACTIVATE / UPDATE STATUS
     * ---------------------------------------------------------
     */

    async updateStatus(
        state: Branch,
        tx: Prisma.TransactionClient = prisma
    ): Promise<void> {

        await tx.branch.update({

            where: {
                id: state.id,
            },

            data: {

                isActive:
                    state.isActive,
            },
        });
    }
}


/*
 * ============================================================
 * BRANCH MAPPER
 * ============================================================
 */

export class BranchMapper {

    /*
     * ---------------------------------------------------------
     * DOMAIN → PRISMA
     * ---------------------------------------------------------
     */

    static toUpsertArgs(
        branch: Branch
    ): Prisma.BranchUpsertArgs {

        return {

            where: {
                id: branch.id,
            },

            create: {

                id:
                    branch.id,

                businessId:
                    branch.businessId,

                name:
                    branch.name,

                address:
                    branch.address ??
                    null,

                phone:
                    branch.phone ??
                    null,

                isActive:
                    branch.isActive,

                isDefault:
                    branch.isDefault,

                createdAt:
                    new Date(
                        branch.createdAt
                    ),
            },

            update: {

                businessId:
                    branch.businessId,

                name:
                    branch.name,

                address:
                    branch.address ??
                    null,

                phone:
                    branch.phone ??
                    null,

                isActive:
                    branch.isActive,

                isDefault:
                    branch.isDefault,
            },
        };
    }


    /*
     * ---------------------------------------------------------
     * PRISMA → DOMAIN
     * ---------------------------------------------------------
     */

    static fromRow(
        row: PrismaBranch
    ): Branch {

        return {

            id:
                row.id,

            businessId:
                row.businessId,

            name:
                row.name,

            address:
                row.address ??
                undefined,

            phone:
                row.phone ??
                undefined,

            isActive:
                row.isActive,

            isDefault:
                row.isDefault,

            createdAt:
                row.createdAt.getTime(),
        };
    }
}