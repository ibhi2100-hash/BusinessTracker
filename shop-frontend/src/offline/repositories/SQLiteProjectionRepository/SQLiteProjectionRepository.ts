// SQLiteProjectionRepository.ts

import { ProjectionRepository } from "@business/projection-families";

import { SQLiteBusinessRepository } from "./SQLiteBusinessRepository";
import { SQLiteBranchRepository } from "./SQLiteBranchRepository";
import { SQLiteProductRepository } from "./SQLiteProductRepository";
import { SQLiteInventoryRepository } from "./SQLiteInventoryRepository";

export class SQLiteProjectionRepository
  implements ProjectionRepository {

  constructor(
    private businessRepo: SQLiteBusinessRepository,
    private branchRepo: SQLiteBranchRepository,
    private productRepo: SQLiteProductRepository,
    private inventoryRepo: SQLiteInventoryRepository
  ) {}

  async load(
    projection: string,
    aggregateId: string
  ): Promise<any> {

    switch (projection) {

      case "business":
        return this.businessRepo.findById(
          aggregateId
        );

      case "branch":
        return this.branchRepo.findById(
          aggregateId
        );

      case "product":
        return this.productRepo.findById(
          aggregateId
        );

      case "inventory":
        return this.inventoryRepo.findById(
          aggregateId
        );

      default:
        return null;
    }
  }

  async save(
    projection: string,
    aggregateId: string,
    state: any
  ): Promise<void> {

    switch (projection) {

      case "business":
        await this.businessRepo.upsert(
          aggregateId,
          state
        );
        break;

      case "branch":
        await this.branchRepo.upsert(
          aggregateId,
          state
        );
        break;

      case "product":
        await this.productRepo.upsert(
          aggregateId,
          state
        );
        break;

      case "inventory":
        await this.inventoryRepo.upsert(
          aggregateId,
          state
        );
        break;
    }
  }
}