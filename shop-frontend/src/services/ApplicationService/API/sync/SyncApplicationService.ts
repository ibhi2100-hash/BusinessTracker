import {
    BusinessManager,
} from "@/src/Composer/BusinessManager";

import  { 
    SyncTrigger,
    PersistedSyncState,
    SyncResult
} from "@business/shared-types"


export interface SyncApplicationEvent {

    type:
        | "STARTED"
        | "COMPLETED"
        | "FAILED";

    trigger:
        SyncTrigger;

    result:
        SyncResult | null;

    error:
        string | null;

    startedAt:
        number;

    completedAt:
        number | null;

}


export class SyncApplicationService {



  private unsubscribeSynchronization: (() => void) | null = null;
  private boundBusinessId: string | null = null;   // ← replaces “initialized”
  private disposed = false;

  constructor(
    private readonly manager: BusinessManager
  ) {}

  // ─────────────────────────────────────────────
  // Lifecycle – call this whenever a business becomes current
  // ─────────────────────────────────────────────

  async attachToCurrentBusiness(): Promise<boolean> {
    if (this.disposed) return false;

    const app = this.manager.current();          // sync, may be undefined
    if (!app) {
      // no business open → keep default empty state
      this.detach();
      return false;
    }

    // already bound to this business?
    if (this.boundBusinessId === app.businessId && this.unsubscribeSynchronization) {
      return true;
    }

    // switch / first attach
    this.detach()

    this.boundBusinessId = app.businessId;
    await this.refreshPendingAndCursor();
    return true;
  }

  private detach() {
    this.unsubscribeSynchronization?.();
    this.unsubscribeSynchronization = null;
    this.boundBusinessId = null;
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    this.disposed = true;
    this.detach();
  }

  // ─────────────────────────────────────────────
  // Commands
  // ─────────────────────────────────────────────

  async syncNow(): Promise<SyncResult | null> {
    if (this.disposed) {
      throw new Error("SyncApplicationService has been disposed.");
    }

    // ensure we are attached to the current business
    const attached = await this.attachToCurrentBusiness();
    if (!attached) {
      return null;
    }

    const app = this.manager.current();
    
            if(!app){ 
                return
            }

    return app.synchronization.syncNow();
  }

  async start(): Promise<void> {
    const attached = await this.attachToCurrentBusiness();
    if (!attached) return;

    const app = this.manager.current()!;
    await app.synchronization.start();
  }


    /*
     * ========================================================
     * State
     * ========================================================
     */

    async getState(): Promise<PersistedSyncState>{
            const app = await this.manager.current();

            if(!app){ 
                return
            }

        const state = await  app.storage.repositories.syncState.getState()
        

        return state
    }


    /*
     * ========================================================
     * Internal state projection
     * ========================================================
     */
    // SyncApplicationService.ts  – replace applyCompletedResult + helpers

async refreshPendingAndCursor(): Promise<void> {
  const app = this.manager.current();          // sync!
  if (!app) return;

  const now = Date.now();
    const pendingEvents = await app.storage.repositories.outbox.getPendingCount(now);
  const deviceCursor =await app.storage.repositories.syncState.getCursor();
} 

   
}
