import { BaseEvent } from "@business/shared-types";
import { SyncRepository } from "./syncRepository.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";

export class PrismaEventStore {
    constructor(
      private tx: Prisma.TransactionClient,
      private repo: SyncRepository
    ){}

  async exists(id: string): Promise<boolean> {

    const event =
     await this.tx.event.findFirst({
      where: {id}
     })

    return !!event;
  }

  async append(
    event: BaseEvent
  ): Promise<void> {
    await this.repo.storeEvent(event, this.tx)
  }
}