import type{ ProjectionConsumer } from "@business/event-bus";
import {
  BusinessEventTypes,
} from "@business/shared-types";
import type { DomainEvent } from "@business/shared-types";
import type{ CurrentBusiness } from "../repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";
import {
  CurrentBusinessRepository,
} from "../repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol"; 
export class CurrentBusinessProjection
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "CurrentBusiness";
  private readonly repository: CurrentBusinessRepository;
  constructor(
    repository: CurrentBusinessRepository
  ) {
    this.repository = repository
  }

  async handle(
    events: readonly DomainEvent<any>[]
  ): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case BusinessEventTypes.BUSINESS_CREATED: {
          const businessData: CurrentBusiness = {
            id: 1,
            businessId: event.aggregateId,
            businessName: event.payload.name,
            businessCode: event.aggregateId,
            initializedAt: Date.now(),
          };

          await this.repository.save(businessData);
          break;
        }

        case BusinessEventTypes.BUSINESS_ACTIVATION: {
          const now = Date.now();

          const business: CurrentBusiness = {
            id: 1,
            businessId: event.businessId,
            businessCode: event.businessId,
            activatedAt: now,
            stage: "ACTIVE",
            initializedAt: now,
            updatedAt: now,
          };

          await this.repository.save(business);
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
        case BusinessEventTypes.BUSINESS_CREATED: {
          const businessData: CurrentBusiness = {
            id: 1,
            businessId: event.aggregateId,
            businessName: event.payload.name,
            businessCode: event.aggregateId,
            initializedAt: Date.now(),
          };

          operations.push(
            this.repository.upsertOperation(businessData)
          );

          break;
        }

        case BusinessEventTypes.BUSINESS_ACTIVATION: {
          const now = Date.now();

          const business: CurrentBusiness = {
            id: 1,
            businessId: event.businessId,
            businessCode: event.businessId,
            activatedAt: now,
            stage: "ACTIVE",
            initializedAt: now,
            updatedAt: now,
          };

          operations.push(
            this.repository.upsertOperation(business)
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