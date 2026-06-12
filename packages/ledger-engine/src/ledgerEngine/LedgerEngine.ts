import { BaseEvent, LedgerEntry } from "@business/shared-types";

export interface LedgerEngineContext {

  eventStore: {
    exists(id: string): Promise<boolean>;
    append(event: BaseEvent): Promise<void>;
  };

  snapshotEngine: {
    process(event: BaseEvent): Promise<void>;
  };

  projectionEngine: {
    process(event: BaseEvent): Promise<void>;
  };

  ledgerGenerator: (
    event: BaseEvent
  ) => LedgerEntry[];
  versionManager: {
    update(event: BaseEvent): Promise<void>;
  };
}
