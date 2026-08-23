// ============================================================
// SalesConsumer.ts
// ============================================================
import { EventConsumer } from "@business/event-bus";
import { DomainEvent, salesEventType } from "@business/shared-types";
import { SalesReducer } from "@business/projection-families";
import { SQLiteSalesRepository } from "../repositories/SQLiteProjectionRepository/SQLiteSalesRepository";

export class SalesConsumer implements EventConsumer<DomainEvent> {
  readonly name = "sales";

  constructor(private readonly repository: SQLiteSalesRepository) {}

  async handle(events: readonly DomainEvent<any>[]): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case salesEventType.SALE_ADDED: {
          const sale = new SalesReducer().reduce(null, event);
          await this.repository.upsert(sale);
          break;
        }

        case salesEventType.SALE_VOIDED: {
          const existing = await this.repository.findById(
            event.aggregateId ?? event.payload?.saleId
          );
          if (!existing) break;

          const voided = new SalesReducer().reduce(existing, event);
          await this.repository.upsert(voided);
          break;
        }

        case salesEventType.SALE_REFUNDED: {
          const existing = await this.repository.findById(
            event.aggregateId ?? event.payload?.saleId
          );
          if (!existing) break;

          const refunded = new SalesReducer().reduce(existing, event);
          await this.repository.upsert(refunded);
          break;
        }

        default:
          break;
      }
    }
  }
}