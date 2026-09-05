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
            ProductMapper.toUpsertArgs(
                product
            )
        );

    }


    /*
     * ============================================================
     * FIND BY ID
     *
     * Because Product has a composite primary key:
     *
     * @@id([id, businessId])
     *
     * businessId is required.
     * ============================================================
     */

    async findById(
        id: string,
        businessId: string
    ): Promise<PrismaProduct | null> {

        return await this.db.product.findUnique({

            where: {
                id_businessId: {
                    id,
                    businessId,
                },
            },

        });

    }


    /*
     * ============================================================
     * FIND ALL FOR BUSINESS
     * ============================================================
     */

    async findAll(
        businessId: string
    ): Promise<PrismaProduct[]> {

        return await this.db.product.findMany({

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
     * FIND PRODUCTS FOR BRANCH
     *
     * branchId is nullable because your Product model allows
     * business-level products that are not assigned to a branch.
     * ============================================================
     */

    async findByBranch(
        businessId: string,
        branchId: string
    ): Promise<PrismaProduct[]> {

        return await this.db.product.findMany({

            where: {
                businessId,
                branchId,
            },

            orderBy: {
                name: "asc",
            },

        });

    }


    /*
     * ============================================================
     * FIND ACTIVE PRODUCTS FOR BRANCH
     * ============================================================
     */

    async findActiveByBranch(
        businessId: string,
        branchId: string
    ): Promise<PrismaProduct[]> {

        return await this.db.product.findMany({

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

    }


    /*
     * ============================================================
     * DELETE
     *
     * Since the domain uses soft deletion fields, this method
     * should normally perform a soft delete rather than actually
     * deleting the database row.
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
 */

export class ProductMapper {


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


            create: {

                id:
                    product.id,

                businessId:
                    product.businessId,

                branchId:
                    product.branchId ?? null,

                branchBusinessId:
                    product.branchBusinessId ?? null,

                sku:
                    product.sku ?? null,

                barcode:
                    product.barcode ?? null,

                name:
                    product.name,

                imageUrl:
                    product.imageUrl ?? null,

                description:
                    product.description ?? null,

                category:
                    product.category ?? null,

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

                updatedAt:
                    product.updatedAt
                        ? new Date(
                            product.updatedAt
                        )
                        : undefined,

                deletedAt:
                    product.deletedAt
                        ? new Date(
                            product.deletedAt
                        )
                        : null,
            },


            update: {

                branchId:
                    product.branchId ?? null,

                branchBusinessId:
                    product.branchBusinessId ?? null,

                sku:
                    product.sku ?? null,

                barcode:
                    product.barcode ?? null,

                name:
                    product.name,

                imageUrl:
                    product.imageUrl ?? null,

                description:
                    product.description ?? null,

                category:
                    product.category ?? null,

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
                    product.updatedAt
                        ? new Date(
                            product.updatedAt
                        )
                        : new Date(),

                deletedAt:
                    product.deletedAt
                        ? new Date(
                            product.deletedAt
                        )
                        : null,
            },

        };

    }


    /*
     * ============================================================
     * DATABASE → DOMAIN
     * ============================================================
     *
     * Prisma Decimal is not a JavaScript number.
     *
     * Convert it explicitly when returning a shared domain Product.
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
                row.branchId ?? undefined,

            branchBusinessId:
                row.branchBusinessId ?? undefined,

            sku:
                row.sku ?? undefined,

            barcode:
                row.barcode ?? undefined,

            name:
                row.name,

            imageUrl:
                row.imageUrl ?? undefined,

            description:
                row.description ?? undefined,

            category:
                row.category ?? undefined,

            costPrice:
                Number(row.costPrice),

            price:
                Number(row.price),

            reorderLevel:
                row.reorderLevel != null
                    ? Number(row.reorderLevel)
                    : undefined,

            isActive:
                row.isActive,

            isDeleted:
                row.isDeleted,

            createdAt:
                row.createdAt.getTime(),

            updatedAt:
                row.updatedAt.getTime(),

            deletedAt:
                row.deletedAt
                    ? row.deletedAt.getTime()
                    : undefined,
        };

    }

}