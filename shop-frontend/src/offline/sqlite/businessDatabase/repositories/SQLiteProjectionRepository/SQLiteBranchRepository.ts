// SQLiteBranchRepository.ts

import { Branch } from "@business/shared-types";
import { DatabaseTarget } from "../../../protocol/DatabaseTarget";
import { IProjectionEntityRepository } from "./repositoryContract";
import { EventStatements } from "../../statements/events/EventStatements";
import { BranchStatements } from "../../statements/branch/BranchStatements";
import { QueryRunner } from "@/src/storage/queryRunner/QueryRunner"

export class SQLiteBranchRepository
implements IProjectionEntityRepository<Branch> {
  constructor(
          private queryRunner: QueryRunner,
          private readonly statements: BranchStatements
      ) {}
  async findById(id: string) {

    const rows =
      await this.queryRunner.query<Branch>(

        `
        SELECT *
        FROM branches
        WHERE id = 
        LIMIT 1
        `,
      )

    return rows[0] ?? null;
  }

  async findAll() {
   

    return this.queryRunner.query<Branch>(
      `
      SELECT *
      FROM branches
      `
    );
  }

  async upsert(
    id: string,
    state: Branch
  ) {
   
    await this.queryRunner.query(
      `
      INSERT INTO branches (
        id,
        businessId,
        name,
        phone
        isActive
        createdAt
      )
      VALUES (?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        phone = excluded.phone
      `,
    );
  }

  async delete(id: string) {

    await this.queryRunner.query(
      `
      DELETE FROM branches
      WHERE id = ?
      `,
    );
  }
}