import { Sales } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { SalesStatement } from "../../statements/sales/salesStatements";
export class SQLiteSalesRepository
implements IProjectionEntityRepository<Sales> {

    constructor(
        private readonly statements: SalesStatement
    ) {}

    async upsert(state: Sales): Promise<void> {

        await this.statements.upsert.execute(
            SalesMapper.ToInsert(state)
        );

    }

    async findById(id: string) {

        const rows =
            await this.statements.findById.query<Sales>(
                [id]
            );

        return rows[0] ?? null;

    }

    async findAll(): Promise<Sales[]> {
        return await this.statements.update.query();
    }

    async delete(id: string) {

        await this.statements.delete.execute(
            [id]
        );

    }

}

export class SalesMapper {

    static ToInsert(
        sale: Sales
    ): unknown[] {

        return [

            sale.id,

            sale.businessId ?? "",

            sale.branchId ?? "",

            sale.productId,

            sale.quantity,

            sale.price,

            sale.costPrice,

            sale.total,

            sale.createdAt,

            sale.updatedAt ?? ""

        ];

    }

}