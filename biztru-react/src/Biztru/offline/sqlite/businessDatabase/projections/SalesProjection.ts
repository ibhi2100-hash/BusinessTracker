import type{ ProjectionConsumer } from "@business/event-bus";
import {
  salesEventType,
} from "@business/shared-types";
import type{ DomainEvent } from "@business/shared-types";
import type{ SalesEventPayload } from "@business/projection-families";
import { SalesReducer } from "@business/projection-families";
import { SQLiteSalesRepository } from "../repositories/SQLiteProjectionRepository/SQLiteSalesRepository";
import { changeNotifier } from "./changeNoifier";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 

export class SalesConsumer
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "sales";

  /**
   * Rebuild state.
   *
   * Keyed by sale ID because SALE_VOIDED and SALE_REFUNDED
   * mutate an existing sale.
   */
  private readonly states = new Map<string, any>();
  private readonly repository: SQLiteSalesRepository
  constructor(
    repository: SQLiteSalesRepository
  ) {
    this.repository = repository
  }

  async handle(
    events: readonly DomainEvent<SalesEventPayload>[]
  ): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case salesEventType.SALE_ADDED: {
          const sale =
            new SalesReducer().reduce(null, event);

          await this.repository.upsert(sale);

          changeNotifier.notify(["sales"]);
          break;
        }

        case salesEventType.SALE_VOIDED: {
          const saleId =
            event.aggregateId

          const existing =
            await this.repository.findById(saleId);

          if (!existing) break;

          const voided =
            new SalesReducer().reduce(
              existing,
              event
            );

          await this.repository.upsert(voided);

          changeNotifier.notify(["sales"]);
          break;
        }

        case salesEventType.SALE_REFUNDED: {
          const saleId =
            event.aggregateId

          const existing =
            await this.repository.findById(saleId);

          if (!existing) break;

          const refunded =
            new SalesReducer().reduce(
              existing,
              event
            );

          await this.repository.upsert(refunded);

          changeNotifier.notify(["sales"]);
          break;
        }

        default:
          break;
      }
    }
  }

  buildOperations(
    events: readonly DomainEvent<SalesEventPayload>             []
  ): SQLiteStatementOperation[] {
    const operations: SQLiteStatementOperation[] = [];

    for (const event of events) {
      switch (event.type) {
        case salesEventType.SALE_ADDED: {
          const sale =
            new SalesReducer().reduce(null, event);

          const saleId =
            event.aggregateId 
            sale.id;

          this.states.set(saleId, sale);

          operations.push(
            this.repository.upsertOperation(sale)
          );

          break;
        }

        case salesEventType.SALE_VOIDED: {
          const saleId =
            event.aggregateId 
          const existing =
            this.states.get(saleId);

          if (!existing) break;

          const voided =
            new SalesReducer().reduce(
              existing,
              event
            );

          this.states.set(saleId, voided);

          operations.push(
            this.repository.upsertOperation(voided)
          );

          break;
        }

        case salesEventType.SALE_REFUNDED: {
          const saleId =
            event.aggregateId 
          const existing =
            this.states.get(saleId);

          if (!existing) break;

          const refunded =
            new SalesReducer().reduce(
              existing,
              event
            );

          this.states.set(saleId, refunded);

          operations.push(
            this.repository.upsertOperation(refunded)
          );

          break;
        }

        default:
          break;
      }
    }

    return operations;
  }
}