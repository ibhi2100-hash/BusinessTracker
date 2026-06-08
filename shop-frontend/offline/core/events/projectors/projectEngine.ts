import { getDb } from "@/src/db";
import { useAuthStore } from "@/src/store/useAuthStore";
import { projectorRegistry } from "@business/domain-models"
import { saveProjection } from "./saveProjection";
import { loadCurrentState } from "./loadCurrent";
import { BaseEvent } from "@business/shared-types";

export class IndexedDbProjectionEngine {

  async process(event: BaseEvent) {
    const userId = useAuthStore.getState().user.id;
    const db = getDb(userId)

    const projectors =
      projectorRegistry[event.type];

    for (const projector of projectors) {
        const { reducer, target } = projector
        const current = await loadCurrentState(db, target, event.aggregateId )
        
        const next =
            reducer.reduce(
                current,
                event
            )
            
      await saveProjection(db, target, next)
    }
  }
}