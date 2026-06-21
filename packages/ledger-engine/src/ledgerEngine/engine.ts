import { IntegrationEvent } from "@business/shared-types";
import { LedgerEngineContext } from "./LedgerEngine";

export class LedgerEngine {

  constructor(
    private readonly ctx: LedgerEngineContext
  ) {}

  async process(event: IntegrationEvent) {

    try {
      // 2. Generate ledger entries
      const entries =
        this.ctx.ledgerGenerator(event);

      // 3. Persist ledger entries ONLY
      await this.ctx.ledgerRepository.append(entries);

    } catch (e) {
      console.error("LEDGER_ENGINE_FAILED", {
        eventId: event.id,
        error: e
      });

      throw e;
    }
  }
}