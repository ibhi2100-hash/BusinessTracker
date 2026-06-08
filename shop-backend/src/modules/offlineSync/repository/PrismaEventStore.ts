import { BaseEvent } from "@business/shared-types";
import { SyncRepository } from "./syncRepository.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class PrismaEventStore {
    constructor(
        private repo: SyncRepository,
        private tx: Prisma.TransactionClient
    ){}

  async exists(id: string): Promise<boolean> {

    const event =
     await this.repo.findExistingEvent(id, this.tx)

    return !!event;
  }

  async append(
    event: BaseEvent
  ): Promise<void> {
    await this.repo.storeEvent(event, this.tx)
  }
}