import { EventConsumer } from "@business/event-bus";
import { DomainEvent } from "@business/shared-types";

import { LedgerRepositoryImpl } from "../repositories/LedgerRepository.js";
import { generateLedgerEntries } from "@business/ledger-engine";

export class LedgerConsumer
implements EventConsumer<DomainEvent> {
    readonly name = "ledger Projection"
    constructor(
        private readonly repostory: LedgerRepositoryImpl
    ){}

   async handle(events: readonly DomainEvent<any>[]): Promise<void> {
        for(const event of events){
            const entries = generateLedgerEntries(event);
            await this.repostory.append(entries)
        }
    }
}