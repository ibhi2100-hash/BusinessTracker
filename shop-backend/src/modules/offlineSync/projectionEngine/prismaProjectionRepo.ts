import {ProjectionRepository } from "@business/projection-families";
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
    aggregateId: any,
    state: any
  ): Promise<void> {

    switch (projection) {

      case "product":
        await this.tx.product.update({ where: ({ id: aggregateId } as unknown) as Prisma.ProductWhereUniqueInput, data: state });
        return;

      case "business":
        await this.tx.business.update({ where: { id: aggregateId }, data: state });
        return;

      case "branch":
        await this.tx.branch.updateMany({ where: { id: aggregateId }, data: state });
        return;

      case "inventory":
        await this.tx.inventory.update({ where: { id: aggregateId }, data: state });
        return;

      default:
        return;
    }
  }
}