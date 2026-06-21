import { IntegrationEvent, LedgerEntry } from "@business/shared-types";
import { LedgerRepository } from "./ledgerContract";
export interface LedgerEngineContext {
    ledgerGenerator: (event: IntegrationEvent) => LedgerEntry[];
    ledgerRepository: LedgerRepository;
}
