import { BaseEvent } from "@business/shared-types";
import { LedgerEngineContext } from "./LedgerEngine";

export class LedgerEngine {

  constructor(
    private ctx: LedgerEngineContext
  ) {}

  async process(event: BaseEvent) {
    try {
  console.log("1 exists");
  const exists = await this.ctx.eventStore.exists(event.id);
  console.log("1 done");

  if (exists) return;

  console.log("2 append");
  await this.ctx.eventStore.append(event);
  console.log("2 done");

  console.log("3 ledger");
  const entries = this.ctx.ledgerGenerator(event);
  console.log("3 done");

  console.log("4 snapshot");
  await this.ctx.snapshotEngine.process(event);
  console.log("4 done");

  console.log("5 projections");
  await this.ctx.projectionEngine.process(event);
  console.log("5 done");

  console.log("6 version");
  await this.ctx.versionManager.update(event);
  console.log("6 done");

} catch (e) {
  console.error("FAILED INSIDE LEDGER", e);
  throw e;
}
  }
}