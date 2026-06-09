import {ProjectionRepository } from "@business/domain-models";
import { AppDB } from "@/src/db";

export class IndexedDbProjectionRepository
  implements ProjectionRepository {

  constructor(
    private db: AppDB
  ) {}

  async load(
    projection: string,
    aggregateId: string
  ) {

    switch (projection) {

      case "product":
        return this.db.products.get(aggregateId);

      case "business":
        return this.db.businesses.get(aggregateId);

      case "branch":
        return this.db.branches.get(aggregateId);

      case "inventory":
        return this.db.inventory.get(aggregateId);

      default:
        return null;
    }
  }

  async save(
    projection: string,
    state: any
  ) {

    switch (projection) {

      case "product":
        return this.db.products.put(state);

      case "business":
        return this.db.businesses.put(state);

      case "branch":
        return this.db.branches.put(state);

      case "inventory":
        return this.db.inventory.put(state);
    }
  }
}