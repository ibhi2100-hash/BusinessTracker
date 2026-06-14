import { Account, BaseEvent, LedgerEntry } from "@business/shared-types";
import { LedgerRepository } from "./ledgerRepo";


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
  ledgerRepository: LedgerRepository;
  
  versionManager: {
    update(event: BaseEvent): Promise<void>;
  };
}
