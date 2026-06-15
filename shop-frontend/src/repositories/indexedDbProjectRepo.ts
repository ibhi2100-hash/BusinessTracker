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
  ): Promise<void> {

    const entity = {
      ...state,
      id: aggregateId
    };
    
    switch (projection) {

      case "product":
        this.db.products.put(entity);
        break;

      case "business":
        this.db.businesses.put(entity);
        break;

      case "branches":
        this.db.branches.put(entity);
        break;

      case "inventory":
        this.db.inventory.put(entity);
        break;
    }
  }
}