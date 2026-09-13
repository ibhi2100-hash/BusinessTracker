import { Product } from "@business/shared-types";

import {
    Prisma,
    Product as PrismaProduct,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";


export class ProductRepository {

    constructor(
        private readonly db = prisma
    ) {}


    /*
     * ============================================================
     * UPSERT
     * ============================================================
     */

    async upsert(
        product: Product,
        tx: Prisma.TransactionClient = this.db
    ): Promise<void> {

        await tx.product.upsert(
            ProductMapper.toUpsertArgs(product)
        );

    }


    /*
     * ============================================================
     * FIND BY ID
     *
     * Product has a composite primary key:
     *
     * @@id([id, businessId])
     *
     * Therefore businessId is required.
     *
     * DATABASE → DOMAIN
     * ============================================================
     */

    async findById(
        id: string,
        businessId: string
    ): Promise<Product | null> {

        const row = await this.db.product.findUnique({

            where: {
                id_businessId: {
                    id,
                    businessId,
                },
            },

        });

        return row
            ? ProductMapper.fromRow(row)
            : null;

    }


    /*
     * ============================================================
     * FIND ALL FOR BUSINESS
     *
     * DATABASE → DOMAIN
     * ============================================================
     */

    async findAll(
        businessId: string
    ): Promise<Product[]> {

        const rows = await this.db.product.findMany({

            where: {
                businessId,
            },

            orderBy: {
                createdAt: "asc",
            },

        });

        return rows.map(
            ProductMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND PRODUCTS FOR BRANCH
     *
     * branchId is nullable in the Prisma model, but this method
     * specifically asks for products assigned to a branch.
     *
     * DATABASE → DOMAIN
     * ============================================================
     */

    async findByBranch(
        businessId: string,
        branchId: string
    ): Promise<Product[]> {

        const rows = await this.db.product.findMany({

            where: {
                businessId,
                branchId,
            },

            orderBy: {
                name: "asc",
            },

        });

        return rows.map(
            ProductMapper.fromRow
        );

    }


    /*
     * ============================================================
     * FIND ACTIVE PRODUCTS FOR BRANCH
     *
     * DATABASE → DOMAIN
     * ============================================================
     */

    async findActiveByBranch(
        businessId: string,
        branchId: string
    ): Promise<Product[]> {

        const rows = await this.db.product.findMany({

            where: {
                businessId,

                branchId,

                isActive: true,

                isDeleted: false,
            },

            orderBy: {
                name: "asc",
            },

        });

        return rows.map(
            ProductMapper.fromRow
        );

    }


    /*
     * ============================================================
     * DELETE
     *
     * Product uses soft deletion.
     *
     * This therefore does NOT physically remove the row.
     * ============================================================
     */

    async delete(
        id: string,
        businessId: string
    ): Promise<void> {

        await this.db.product.update({

            where: {
                id_businessId: {
                    id,
                    businessId,
                },
            },

            data: {
                isDeleted: true,

                isActive: false,

                deletedAt: new Date(),
            },

        });

    }


    /*
     * ============================================================
     * RESTORE
     * ============================================================
     */

    async restore(
        id: string,
        businessId: string
    ): Promise<void> {

        await this.db.product.update({

            where: {
                id_businessId: {
                    id,
                    businessId,
                },
            },

            data: {
                isDeleted: false,

                isActive: true,

                deletedAt: null,
            },

        });

    }

}


/*
 * ================================================================
 * PRODUCT MAPPER
 * ================================================================
 *
 * DOMAIN
 *
 * Product
 *   number
 *   number
 *   number timestamps
 *
 *          ↕
 *
 * DATABASE
 *
 * PrismaProduct
 *   Decimal
 *   Decimal
 *   Date
 *
 * ================================================================
 */

export class ProductMapper {


    /*
     * ============================================================
     * DOMAIN → PRISMA
     * ============================================================
     */

    static toUpsertArgs(
        product: Product
    ): Prisma.ProductUpsertArgs {

        return {

            where: {
                id_businessId: {
                    id:
                        product.id,

                    businessId:
                        product.businessId,
                },
            },


            /*
             * ----------------------------------------------------
             * CREATE
             * ----------------------------------------------------
             */

            create: {

                id:
                    product.id,

                businessId:
                    product.businessId,

                branchId:
                    product.branchId,

                sku:
                    product.sku,

                barcode:
                    product.barcode,

                name:
                    product.name,

                imageUrl:
                    product.imageUrl,

                description:
                    product.description,

                category:
                    product.category,

                costPrice:
                    new Prisma.Decimal(
                        product.costPrice
                    ),

                price:
                    new Prisma.Decimal(
                        product.price
                    ),

                reorderLevel:
                    product.reorderLevel != null
                        ? new Prisma.Decimal(
                            product.reorderLevel
                        )
                        : null,

                isActive:
                    product.isActive,

                isDeleted:
                    product.isDeleted,

                createdAt:
                    new Date(
                        product.createdAt
                    ),

                deletedAt:
                    product.deletedAt != null
                        ? new Date(
                            product.deletedAt
                        )
                        : null,

            },


            /*
             * ----------------------------------------------------
             * UPDATE
             * ----------------------------------------------------
             */

            update: {

                branchId:
                    product.branchId,

                sku:
                    product.sku,

                barcode:
                    product.barcode,

                name:
                    product.name,

                imageUrl:
                    product.imageUrl,

                description:
                    product.description,

                category:
                    product.category,

                costPrice:
                    new Prisma.Decimal(
                        product.costPrice
                    ),

                price:
                    new Prisma.Decimal(
                        product.price
                    ),

                reorderLevel:
                    product.reorderLevel != null
                        ? new Prisma.Decimal(
                            product.reorderLevel
                        )
                        : null,

                isActive:
                    product.isActive,

                isDeleted:
                    product.isDeleted,

                updatedAt:
                    product.updatedAt != null
                        ? new Date(
                            product.updatedAt
                        )
                        : new Date(),

                deletedAt:
                    product.deletedAt != null
                        ? new Date(
                            product.deletedAt
                        )
                        : null,

            },

        };

    }


    /*
     * ============================================================
     * PRISMA → DOMAIN
     * ============================================================
     *
     * Decimal → number
     * Date    → Unix milliseconds
     * ============================================================
     */

    static fromRow(
        row: PrismaProduct
    ): Product {

        return {

            id:
                row.id,

            businessId:
                row.businessId,

            branchId:
                row.branchId,

            name:
                row.name,

            imageUrl:
                row.imageUrl,

            description:
                row.description,

            costPrice:
                Number(
                    row.costPrice
                ),

            price:
                Number(
                    row.price
                ),

            category:
                row.category,

            sku:
                row.sku,

            barcode:
                row.barcode,

            reorderLevel:
                row.reorderLevel != null
                    ? Number(
                        row.reorderLevel
                    )
                    : null,

            isActive:
                row.isActive,

            isDeleted:
                row.isDeleted,

            createdAt:
                row.createdAt.getTime(),

            updatedAt:
                row.updatedAt != null
                    ? row.updatedAt.getTime()
                    : null,

            deletedAt:
                row.deletedAt != null
                    ? row.deletedAt.getTime()
                    : null,

        };

    }

}