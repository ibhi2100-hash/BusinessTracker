import { BaseEvent } from "@business/shared-types";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { loadCurrentState } from "./loadCurrentState.js";

import { saveProjection } from "./saveProjections.js";
import { projectorRegistry } from "@business/domain-models"

export class PrismaProjectionEngine {

  constructor(
    private tx: Prisma.TransactionClient
  ) {}

  async process(
    event: BaseEvent
  ) {
    const projectors = 
        projectorRegistry[event.type];
    
    if (!projectors) return;
    
    for(const projector of projectors) {
        const { reducer, target } = projector
    
        const current =
      await loadCurrentState(
        this.tx,
        target,
        event.aggregateId
      );
      const next = 
        reducer.reduce(
            current,
            event
        )
  
    await saveProjection(
      this.tx,
      target,
      next
    );
    }
  }
}