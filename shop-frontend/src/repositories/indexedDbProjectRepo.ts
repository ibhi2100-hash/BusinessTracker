import {ProjectionRepository } from "@business/projection-families";
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
    aggregateId: string,
    state: any,
  ) {

    const entity = {
      ...state,
      id: aggregateId
    };
    console.log({
      projection,
      aggregateId,
      state
    });
    switch (projection) {

      case "product":
        return this.db.products.put(entity);

      case "business":
        return this.db.businesses.put(entity);

      case "branches":
        return this.db.branches.put(entity);

      case "inventory":
        return this.db.inventory.put(entity);
    }
  }
}