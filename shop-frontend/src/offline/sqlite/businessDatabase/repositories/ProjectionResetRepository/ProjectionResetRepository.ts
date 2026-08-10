import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner";
import { ProjectionResetRepository } from "./ProjectionResetRepositoryContract";
import { ProjectionName } from "./ProjectionResetRepositoryContract";
export class SQLiteProjectionResetRepository
    implements ProjectionResetRepository {

    constructor(
        private readonly queryRunner: QueryRunner
    ) {}

    async reset(name: ProjectionName): Promise<void> {

        switch (name) {

            case "businesses":
                await this.queryRunner.execute(
                    `DELETE FROM businesses`
                );
                break;

            case "branches":
                await this.queryRunner.execute(
                    `DELETE FROM branches`
                );
                break;

            case "products":
                await this.queryRunner.execute(
                    `DELETE FROM products`
                );
                break;

            case "inventories":
                await this.queryRunner.execute(
                    `DELETE FROM inventories`
                );
                break;

            case "sales":
                await this.queryRunner.execute(
                    `DELETE FROM sales`
                );
                break;
        }
    }

    async resetAll(): Promise<void> {

        await this.reset("businesses");
        await this.reset("branches");
        await this.reset("products");
        await this.reset("inventories");
        await this.reset("sales");
    }
}