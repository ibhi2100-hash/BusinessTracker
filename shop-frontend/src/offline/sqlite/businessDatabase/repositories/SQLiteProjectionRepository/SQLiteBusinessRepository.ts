// SQLiteBusinessRepository.ts

import { Business } from "@business/shared-types";
import { IProjectionEntityRepository } from "./repositoryContract";
import { BusinessStatements } from "../../statements/business/BusinessStatements";

export class SQLiteBusinessRepository
  implements IProjectionEntityRepository<Business> {
  constructor(
          private readonly statements: BusinessStatements
      ) {}
  async upsert(state: Business): Promise<void> {
    await this.statements.upsert.execute(
      BusinessMapper.ToInsert(state)
    )
  }
  async findById(id: string) {
    
    const rows =
      await this.statements.findById.query<Business>(
        [id]
      )

    return rows[0] ?? null;
  }

  async findAll() {
    return await this.statements.update.query<Business>()
  }

  async delete(id: string) {
    await this.statements.delete.query(
      [id]
    );
  }
}

export class BusinessMapper {
  static ToInsert(
    business: Business

  ): unknown[]{
   return  [
            business.id,
            business.userId,
            business.name ?? "",
            business.address ?? "",
            business.createdAt,
            business.activatedAt ?? "",
            business.isOnboarding,
            business.onboardingCompleted,
            business.status
        ]
  }
}