import type{ ProjectionConsumer } from "@business/event-bus";
import {
  InventoryEventType,
} from "@business/shared-types";
import type{ DomainEvent } from "@business/shared-types";
import { ProductReducer } from "@business/projection-families";
import { SQLiteProductRepository } from "../repositories/SQLiteProjectionRepository/SQLiteProductRepository";
import { changeNotifier } from "./changeNoifier";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 
import type { ProductPayload } from "../../../../services/ApplicationService/API/Product/ProductRequest";

export class ProductConsumer
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "products";
  private readonly repository: SQLiteProductRepository
  constructor(
    repository: SQLiteProductRepository
  ) {
    this.repository = repository
  }

  async handle(
    events: readonly DomainEvent<ProductPayload>[]
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

         case InventoryEventType.PRODUCT_UPDATED: {
          const previousProduct = await this.repository.findById(event.payload.id)
          if(!previousProduct){
            throw new Error("Please this product does not exist in local database")
          }
          const product =
            new ProductReducer().reduce(previousProduct, event);
          console.log("This is the Reduced Products: ", product, "and this the event that created it: ", event)
          await this.repository.upsert(product);

          const updatedProduct = await this.repository.findById(product.id);

          console.log("This is the updated product: ", updatedProduct)

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