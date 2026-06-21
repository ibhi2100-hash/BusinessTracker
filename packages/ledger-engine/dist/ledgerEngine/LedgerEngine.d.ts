import { IntegrationEvent, LedgerEntry } from "@business/shared-types";
export interface LedgerEngineContext {
    ledgerGenerator: (event: IntegrationEvent) => LedgerEntry[];
    ledgerRepository: {
        append(entries: LedgerEntry[]): Promise<void>;
    };
    idempotencyStore: {
        exists(eventId: string): Promise<boolean>;
        mark(eventId: string): Promise<void>;
    };
}
