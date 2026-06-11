import {ProjectionRepository } from "@business/domain-models";
import { AppDB } from "@/src/db";
import Dexie from "dexie";

export class IndexedDbProjectionRepository
  implements ProjectionRepository {

  constructor(
    private db: AppDB
  ) {}

  async load(
    projection: string,
    aggregateId: string
  ) {
    console.log(
      "LOAD",
      projection,
      aggregateId,
      "TX",
      !!Dexie.currentTransaction
    )
    switch (projection) {

      case "product":
        return this.db.products.get(aggregateId);

      case "business":
        return this.db.businesses.get(aggregateId);

      case "branches":
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
      console.log(
      "LOAD",
      projection,
      "TX",
      !!Dexie.currentTransaction
    )
    switch (projection) {

      case "product":
        return this.db.products.put(state);

      case "business":
        return this.db.businesses.put(state);

      case "branches":
        return this.db.branches.put(state);

      case "inventory":
        return this.db.inventory.put(state);
    }
  }
}