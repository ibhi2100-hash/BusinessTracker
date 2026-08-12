import { Product } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { ProductStatements } from "../../statements/products/ProductStatements";
export interface LiveProduct {
  id: string;
  name: string;
  price: number;
  costPrice: number;
  quantity: number;
  category: string | null;
  imageUrl: string | null;
  isActive: number;
  branchId: string | null;
}

export class SQLiteProductRepository
implements IProjectionEntityRepository<Product> {

    constructor(
        private readonly statements: ProductStatements
    ) {}

    async upsert(state: Product): Promise<void> {
        await this.statements.upsert.execute(
            ProductMapper.ToInsert(state)
        );
    }

    async findById(id: string) {

        const rows =
            await this.statements.findById.query<Product>(
                [id]
            );

        return rows[0] ?? null;
    }

    async findAll(): Promise<Product[]> {
        return await this.statements.update.query();
    }

    async delete(id: string) {
        await this.statements.delete.execute(
            [id]
        );
    }

    async products(branchId): Promise<LiveProduct[]> {
        const products =  await this.statements.products.query<LiveProduct>([branchId])

        return products
    }

}

export class ProductMapper {

    static ToInsert(
        product: Product
    ): unknown[] {

        return [

            product.id,

            product.businessId ?? "",

            product.branchId ?? "",

            product.name,

            product.imageUrl ?? "",

            product.description ?? "",

            product.costPrice,

            product.price,

            product.category ?? "",

            product.reorderLevel,

            product.isActive,

            product.isDeleted,

            product.createdAt,

            product.updatedAt ?? "",

            product.deletedAt ?? ""

        ];

    }

}