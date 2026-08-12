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
  static ToInsert(branch: Branch): unknown[] {
    return [
      branch.id,
      branch.businessId,
      branch.name,
      branch.address ?? null,          // 4 – address
      branch.phone ?? null,            // 5 – phone
      branch.isActive ? 1 : 0,         // 6 – isActive (prefer 0/1 for SQLite)
      branch.createdAt,                // 7 – createdAt (must be a number)
      branch.isDefault ? 1 : 0,        // 8 – isDefault
    ];
  }
}