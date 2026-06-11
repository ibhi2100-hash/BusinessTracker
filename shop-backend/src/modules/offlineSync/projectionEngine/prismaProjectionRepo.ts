import {ProjectionRepository } from "@business/domain-models";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class PrismaProjectionRepository
  implements ProjectionRepository {

  constructor(
    private tx: Prisma.TransactionClient
  ) {}

  async load(
    projection: string,
    aggregateId: string
  ) {

    switch (projection) {

      case "product":
        return this.tx.product.findFirst({
            where: {id : aggregateId}
        });

      case "business":
        return this.tx.business.findFirst({
            where: { id: aggregateId}
        });

      case "branch":
        return this.tx.branch.findFirst({
            where: { id: aggregateId}
        });

      case "inventory":
        return this.tx.inventory.findFirst({
            where: { id:  aggregateId}
        });

      default:
        return null;
    }
  }

  async save(
    projection: string,
    state: any
  ): Promise<string> {

    switch (projection) {

      case "product":
        await this.tx.product.update(state);
        return state.id;

      case "business":
        await this.tx.business.update(state);
        return state.id;

      case "branch":
        await this.tx.branch.update(state);
        return state.id;

      case "inventory":
        await this.tx.inventory.update(state);
        return state.id;

      default:
        return "";
    }
  }
}