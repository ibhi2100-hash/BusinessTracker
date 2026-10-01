import type{ ProjectionConsumer } from "@business/event-bus";
import {
  InventoryEventType,
} from "@business/shared-types";
import type{ DomainEvent } from "@business/shared-types";
import { ProductReducer } from "@business/projection-families";
import { SQLiteProductRepository } from "../repositories/SQLiteProjectionRepository/SQLiteProductRepository";
import { changeNotifier } from "./changeNoifier";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 

export class ProductConsumer
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "products";

  constructor(
    private readonly repository: SQLiteProductRepository
  ) {}

  async handle(
    events: readonly DomainEvent[]
  ): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case InventoryEventType.PRODUCT_CREATED: {
          const product =
            new ProductReducer().reduce(null, event);

          await this.repository.upsert(product);

          changeNotifier.notify(["products"]);
          break;
        }

        default:
          break;
      }
    }
  }

  buildOperations(
    events: readonly DomainEvent[]
  ): SQLiteStatementOperation[] {
    const operations: SQLiteStatementOperation[] = [];

    for (const event of events) {
      switch (event.type) {
        case InventoryEventType.PRODUCT_CREATED: {
          const product =
            new ProductReducer().reduce(null, event);

          operations.push(
            this.repository.upsertOperation(product)
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