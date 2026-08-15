import { EventConsumer } from "@business/event-bus";
import { Business, BusinessEventTypes, DomainEvent } from "@business/shared-types";
import { SQLiteBusinessRepository } from "../repositories/SQLiteProjectionRepository/SQLiteBusinessRepository";
import { BusinessReducer } from "@business/projection-families";
import { changeNotifier } from "./changeNoifier";
import { SQLiteLedgerRepository } from "../repositories/SQLiteLedgerRepository/SQLiteLedgerRepository";
import { generateLedgerEntries } from "@business/ledger-engine";

export class LedgerConsumer
implements EventConsumer<DomainEvent> {
    readonly name = "ledger Projection"
    constructor(
        private readonly repostory: SQLiteLedgerRepository
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            const entries = generateLedgerEntries(event);
            await this.repostory.append(entries)
            changeNotifier.notify(["ledger_entries"])
        }
    }
}