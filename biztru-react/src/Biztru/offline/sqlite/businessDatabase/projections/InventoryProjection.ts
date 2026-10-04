import type{ ProjectionConsumer } from "@business/event-bus";
import {
  InventoryEventType,
  salesEventType,
} from "@business/shared-types";
import type { DomainEvent } from "@business/shared-types";
import { InventoryReducer } from "@business/projection-families";
import { SQLiteInventoryRepository } from "../repositories/SQLiteProjectionRepository/SQLiteInventoryRepository";
import { changeNotifier } from "./changeNoifier";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 

export class InventoryConsumer
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "inventories";

  /**
   * Inventory projection state is keyed by productId.
   *
   * This survives across rebuild batches so that a later batch
   * can continue reducing the state produced by earlier events.
   */
  private readonly states = new Map<string, any>();
  private readonly repository: SQLiteInventoryRepository
  constructor(
    repository: SQLiteInventoryRepository
  ) {
    this.repository = repository
  }

  async handle(events: readonly DomainEvent<any>[]): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case InventoryEventType.INVENTORY_ADDED: {
          const inventory =
            new InventoryReducer().reduce(null, event);

          await this.repository.upsert(inventory);

          changeNotifier.notify(["inventories"]);
          break;
        }

        case InventoryEventType.INVENTORY_RECEIVED: {
          const current =
            await this.repository.findProductId(
              event.payload.productId
            );

          const received =
            new InventoryReducer().reduce(
              current,
              event
            );

          await this.repository.upsert(received);

          changeNotifier.notify(["inventories"]);
          break;
        }

        case InventoryEventType.INVENTORY_ADJUSTED: {
          const current =
            await this.repository.findProductId(
              event.payload.productId
            );

          const adjusted =
            new InventoryReducer().reduce(
              current,
              event
            );

          await this.repository.upsert(adjusted);

          changeNotifier.notify(["inventories"]);
          break;
        }

        case InventoryEventType.INVENTORY_TRANSFER: {
          const current =
            await this.repository.findProductId(
              event.payload.productId
            );

          const transferred =
            new InventoryReducer().reduce(
              current,
              event
            );

          await this.repository.upsert(transferred);

          changeNotifier.notify(["inventories"]);
          break;
        }

        case salesEventType.SALE_ADDED: {
          const current =
            await this.repository.findProductId(
              event.payload.productId
            );

          const saleInventory =
            new InventoryReducer().reduce(
              current,
              event
            );

          await this.repository.upsert(saleInventory);

          changeNotifier.notify([
            "inventories",
            "sales",
          ]);

          break;
        }

        default:
          break;
      }
    }
  }

  buildOperations(
    events: readonly DomainEvent<any>[]
  ): SQLiteStatementOperation[] {
    const operations: SQLiteStatementOperation[] = [];

    for (const event of events) {
      switch (event.type) {
        case InventoryEventType.INVENTORY_ADDED: {
          const inventory =
            new InventoryReducer().reduce(null, event);

          const productId =
            event.payload.productId ??
            inventory.productId;

          this.states.set(productId, inventory);

          operations.push(
            this.repository.upsertOperation(inventory)
          );

          break;
        }

        case InventoryEventType.INVENTORY_RECEIVED: {
          const productId =
            event.payload.productId;

          const current =
            this.states.get(productId);

          if (!current) break;

          const received =
            new InventoryReducer().reduce(
              current,
              event
            );

          this.states.set(productId, received);

          operations.push(
            this.repository.upsertOperation(received)
          );

          break;
        }

        case InventoryEventType.INVENTORY_ADJUSTED: {
          const productId =
            event.payload.productId;

          const current =
            this.states.get(productId);

          if (!current) break;

          const adjusted =
            new InventoryReducer().reduce(
              current,
              event
            );

          this.states.set(productId, adjusted);

          operations.push(
            this.repository.upsertOperation(adjusted)
          );

          break;
        }

        case InventoryEventType.INVENTORY_TRANSFER: {
          const productId =
            event.payload.productId;

          const current =
            this.states.get(productId);

          if (!current) break;

          const transferred =
            new InventoryReducer().reduce(
              current,
              event
            );

          this.states.set(productId, transferred);

          operations.push(
            this.repository.upsertOperation(transferred)
          );

          break;
        }

        case salesEventType.SALE_ADDED: {
          const productId =
            event.payload.productId;

          const current =
            this.states.get(productId);

          if (!current) break;

          const saleInventory =
            new InventoryReducer().reduce(
              current,
              event
            );

          this.states.set(productId, saleInventory);

          operations.push(
            this.repository.upsertOperation(saleInventory)
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