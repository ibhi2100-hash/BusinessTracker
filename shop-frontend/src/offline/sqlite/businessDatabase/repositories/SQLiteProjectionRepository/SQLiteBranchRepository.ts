import { Branch } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { BranchStatements } from "../../statements/branch/BranchStatements";

export class SQLiteBranchRepository
implements IProjectionEntityRepository<Branch> {

    constructor(
        private readonly statements: BranchStatements
    ) {}

    async upsert(state: Branch): Promise<void> {

        await this.statements.insert.execute(
            BranchMapper.ToInsert(state)
        );

    }

    async findById(id: string) {

        const rows =
            await this.statements.findById.query<Branch>(
                [id]
            );

        return rows[0] ?? null;

    }

    async findAll() {

        return await this.statements.findAll.query<Branch>();

    }

    async delete(id: string) {

        await this.statements.delete.execute(
            [id]
        );

    }

}

export class BranchMapper {

    static ToInsert(
        branch: Branch
    ): unknown[] {

        return [

            branch.id,

            branch.businessId,

            branch.name,

            branch.phone ?? "",

            branch.isActive,

            branch.createdAt,

        ];

    }

}