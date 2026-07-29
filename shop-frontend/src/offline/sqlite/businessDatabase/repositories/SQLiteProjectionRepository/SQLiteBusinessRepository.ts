// SQLiteBusinessRepository.ts

import { Business } from "@business/shared-types";
import { StorageBusCreator } from "../../../bus/StorageBusCreator";
import { IProjectionEntityRepository } from "./repositoryContract";
import { DatabaseTarget } from "../../../protocol/DatabaseTarget";
import { EventStatements } from "../../statements/events/EventStatements";
import { BusinessStatements } from "../../statements/business/BusinessStatements";

export class SQLiteBusinessRepository
  implements IProjectionEntityRepository<Business> {
  constructor(
          private readonly statements: BusinessStatements
      ) {}
  async findById(id: string) {
    const storage = StorageBusCreator()

    const rows =
      await storage.query<Business>(
        DatabaseTarget.BUSINESS,
        `
        SELECT *
        FROM businesses
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    return rows[0] ?? null;
  }

  async findAll() {
    const storage = StorageBusCreator()

    return storage.query<Business>(
      DatabaseTarget.BUSINESS,
      `
      SELECT *
      FROM businesses
      `
    );
  }

  async upsert(
    id: string,
    state: Business
  ) {
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      INSERT INTO businesses (
        id,
        userId,
        name,
        address,
        createdAt,
        activatedAt,
        isOnboarding,
        onboardingCompleted,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)

      ON CONFLICT(id)
      DO UPDATE SET
        name = excluded.name,
        address = excluded.address
      `,
      [
        id === state.id ?
        id : state.id,
        state.userId,
        state.name,
        state.address ?? "",
        state.createdAt,
        state.activatedAt ?? "",
        state.isOnboarding,
        state.onboardingCompleted,
        state.status
      ]
    );
  }

  async delete(id: string) {
    const storage = StorageBusCreator()

    await storage.query(
      DatabaseTarget.BUSINESS,
      `
      DELETE FROM businesses
      WHERE id = ?
      `,
      [id]
    );
  }
}