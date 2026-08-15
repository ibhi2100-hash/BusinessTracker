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
  async findById(id: string): Promise<Business | null> {
  console.log("looking for:", id);

  // A) current prepared statement
  let rows = await this.statements.findById.query<Business>([id]);
  console.log("prepared [id]:", rows);


  return rows[0] ?? null;
}

  async findAll() {
    const all = await this.statements.findAll.query<Business>();
    console.log("all businesses IDs:", all.map(b => b.id));
    
  return all
  }

  async delete(id: string) {
    await this.statements.delete.query(
      [id]
    );
  }
  async activateBusiness(
    state: Business
  ): Promise<void> {
    await this.statements.activate.execute(
      BusinessMapper.toActivation(state)
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

  static toActivation(business: Business): unknown[] {
  return [
    business.activatedAt,
    business.status,
    business.isOnboarding,
    business.onboardingCompleted
  ];
}
}
