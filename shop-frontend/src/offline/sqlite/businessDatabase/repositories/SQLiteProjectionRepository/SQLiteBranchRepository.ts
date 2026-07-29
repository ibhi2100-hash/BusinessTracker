// SQLiteBranchRepository.ts

import { Branch } from "@business/shared-types";
import { StorageBusCreator } from "../../../bus/StorageBusCreator";
import { DatabaseTarget } from "../../../protocol/DatabaseTarget";
import { IProjectionEntityRepository } from "./repositoryContract";
import { EventStatements } from "../../statements/events/EventStatements";
import { BranchStatements } from "../../statements/branch/BranchStatements";

export class SQLiteBranchRepository
implements IProjectionEntityRepository<Branch> {
  constructor(
          private readonly statements: BranchStatements
      ) {}
  async findById(id: string) {
    const storage = StorageBusCreator()

    const rows =
      await storage.query<Branch>(
        DatabaseTarget.BUSINESS,
        `
        SELECT *
        FROM branches
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
   const storage = StorageBusCreator()

    return storage.query<Branch>(
      DatabaseTarget.BUSINESS,
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
   const storage = StorageBusCreator()
    await storage.query(
      DatabaseTarget.BUSINESS,
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
      [
        id,
        state.businessId,
        state.name,
        state.phone ?? "",
        state.isActive,
        state.createdAt 
      ]
    );
  }

  async delete(id: string) {
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      DELETE FROM branches
      WHERE id = ?
      `,
      [id]
    );
  }
}