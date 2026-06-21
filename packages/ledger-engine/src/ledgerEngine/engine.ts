import { IntegrationEvent } from "@business/shared-types";
import { LedgerEngineContext } from "./LedgerEngine";

export class LedgerEngine {

  constructor(
    private readonly ctx: LedgerEngineContext
  ) {}

  async process(event: IntegrationEvent) {

    try {

      // 1. Idempotency guard
      const exists =
        await this.ctx.idempotencyStore.exists(event.id);

      if (exists) return;

      // 2. Generate ledger entries
      const entries =
        this.ctx.ledgerGenerator(event);

      // 3. Persist ledger entries ONLY
      await this.ctx.ledgerRepository.append(entries);

      // 4. Mark processed (idempotency)
      await this.ctx.idempotencyStore.mark(event.id);

    } catch (e) {
      console.error("LEDGER_ENGINE_FAILED", {
        eventId: event.id,
        error: e
      });

      throw e;
    }
  }
}