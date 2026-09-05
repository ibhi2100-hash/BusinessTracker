import { Inventory } from "@business/shared-types";

import {
    Inventory as PrismaInventory,
    Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


export class InventoryRepository {

    constructor(
        private readonly db = prisma
    ) {}


    /*
     * ============================================================
     * UPSERT
     * ============================================================
     *
     * Inventory is uniquely identified by:
     *
     * businessId + branchId + productId
     *
     * ============================================================
     */

    async upsert(
        inventory: Inventory,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        console.log(
            "Inventory received by backend:",
            inventory
        );

        await tx.inventory.upsert(
            InventoryMapper.toUpsertArgs(
                inventory
            )
        );

    }


    /*
     * ============================================================
     * FIND BY ID
     * ============================================================
     */

    async findById(
        id: string
    ): Promise<PrismaInventory | null> {

        return await this.db.inventory.findUnique({

            where: {
                id,
            },

        });

    }


    /*
     * ============================================================
     * FIND BY PRODUCT
     *
     * Because the same product can exist in multiple branches,
     * productId alone is NOT enough to uniquely identify inventory.
     *
     * We therefore require:
     *
     * businessId
     * branchId
     * productId
     * ============================================================
     */

    async findByProductId(
        businessId: string,
        branchId: string,
        productId: string
    ): Promise<PrismaInventory | null> {

        return await this.db.inventory.findUnique({

            where: {

                businessId_branchId_productId: {

                    businessId,

                    branchId,

                    productId,

                },

            },

        });

    }


    /*
     * ============================================================
     * FIND ALL INVENTORY FOR A BUSINESS
     * ============================================================
     */

    async findAll(
        businessId: string
    ): Promise<PrismaInventory[]> {

        return await this.db.inventory.findMany({

            where: {
                businessId,
            },

            orderBy: {
                createdAt: "asc",
            },

        });

    }


    /*
     * ============================================================
     * FIND ALL INVENTORY FOR A BRANCH
     * ============================================================
     */

    async findByBranch(
        businessId: string,
        branchId: string
    ): Promise<PrismaInventory[]> {

        return await this.db.inventory.findMany({

            where: {

                businessId,

                branchId,

            },

            orderBy: {

                createdAt: "asc",

            },

        });

    }


    /*
     * ============================================================
     * FIND ALL INVENTORY FOR A PRODUCT ACROSS BRANCHES
     * ============================================================
     */

    async findByProduct(
        businessId: string,
        productId: string
    ): Promise<PrismaInventory[]> {

        return await this.db.inventory.findMany({

            where: {

                businessId,

                productId,

            },

            orderBy: {

                branchId: "asc",

            },

        });

    }


    /*
     * ============================================================
     * DELETE
     * ============================================================
     *
     * Inventory has no soft-delete fields.
     *
     * Therefore delete is a real database delete.
     *
     * However, in your event-sourced architecture this should
     * normally be reached as a consequence of an Inventory
     * deletion event rather than arbitrary application code.
     *
     * ============================================================
     */

    async delete(
        id: string
    ): Promise<void> {

        await this.db.inventory.delete({

            where: {
                id,
            },

        });

    }

}


/*
 * ================================================================
 * INVENTORY MAPPER
 * ================================================================
 */

export class InventoryMapper {


    /*
     * ------------------------------------------------------------
     * DOMAIN → PRISMA UPSERT
     * ------------------------------------------------------------
     */

    static toUpsertArgs(
        inventory: Inventory
    ): Prisma.InventoryUpsertArgs {

        return {

            where: {

                businessId_branchId_productId: {

                    businessId:
                        inventory.businessId,

                    branchId:
                        inventory.branchId,

                    productId:
                        inventory.productId,

                },

            },


            create: {

                id:
                    inventory.id,

                businessId:
                    inventory.businessId,

                branchId:
                    inventory.branchId,

                productId:
                    inventory.productId,

                quantity:
                    new Prisma.Decimal(
                        inventory.quantity
                    ),

                costPrice:
                    new Prisma.Decimal(
                        inventory.costPrice
                    ),

                createdAt:
                    new Date(
                        inventory.createdAt
                    ),

                updatedAt:
                    inventory.updatedAt
                        ? new Date(
                            inventory.updatedAt
                        )
                        : undefined,

            },


            update: {

                quantity:
                    new Prisma.Decimal(
                        inventory.quantity
                    ),

                costPrice:
                    new Prisma.Decimal(
                        inventory.costPrice
                    ),

                updatedAt:
                    inventory.updatedAt
                        ? new Date(
                            inventory.updatedAt
                        )
                        : new Date(),

            },

        };

    }


    /*
     * ------------------------------------------------------------
     * PRISMA → DOMAIN
     * ------------------------------------------------------------
     */

    static fromRow(
        row: PrismaInventory
    ): Inventory {

        return {

            id:
                row.id,

            businessId:
                row.businessId,

            branchId:
                row.branchId,

            productId:
                row.productId,

            quantity:
                Number(
                    row.quantity
                ),

            costPrice:
                Number(
                    row.costPrice
                ),

            createdAt:
                row.createdAt.getTime(),

            updatedAt:
                row.updatedAt.getTime(),

        };

    }

}