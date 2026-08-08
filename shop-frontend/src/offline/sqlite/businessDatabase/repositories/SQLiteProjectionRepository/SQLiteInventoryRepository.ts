import { Inventory } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { InventoryStatements } from "../../statements/inventory/InventoryStatements";

export class SQLiteInventoryRepository
implements IProjectionEntityRepository<Inventory> {

    constructor(
        private readonly statements: InventoryStatements
    ) {}

    async upsert(state: Inventory): Promise<void> {

        await this.statements.upsert.execute(
            InventoryMapper.ToInsert(state)
        );

    }

    async findById(id: string) {

        const rows =
            await this.statements.findById.query<Inventory>(
                [id]
            );

        return rows[0] ?? null;

    }

    async findAll(): Promise<Inventory[]> {
        return await this.statements.update.query();
    }

    async delete(id: string) {

        await this.statements.delete.execute(
            [id]
        );

    }

}

export class InventoryMapper {

    static ToInsert(
        inventory: Inventory
    ): unknown[] {

        return [

            inventory.id,

            inventory.productId,

            inventory.branchId ?? "",

            inventory.businessId ?? "",

            inventory.quantity,

            inventory.costPrice,

            inventory.createdAt,

            inventory.updatedAt ?? ""

        ];

    }

}