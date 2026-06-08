
import { BaseEvent } from "@business/shared-types";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";


export class PrismaVersionManager {
  constructor(
    private tx: Prisma.TransactionClient
  ){}
  async update(event: BaseEvent) {
    
   
    await this.tx.aggregates.put({
      id: event.aggregateId,
      aggregateId: event.aggregateId,
      aggregateType: event.aggregateType ?? "unknown",
      version: event.aggregateVersion,
      lastEventId: event.id,
      lastLogicClock: event.logicClock,
      updatedAt: event.createdAt
    });
  }
}