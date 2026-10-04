import type{ ProjectionConsumer } from "@business/event-bus";
import {
  BusinessEventTypes
} from "@business/shared-types";
import type { DomainEvent } from "@business/shared-types";
import { SQLiteApplicationStateRepository } from "../repositories/ApplicationStateRepository.ts/SQLiteApplicationStateRepository";
import type { SQLiteStatementOperation } from "../../../../storage/statement/worker/WorkerProtocol";

export class ApplicationStateProjection
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "Application State";
  private readonly repository: SQLiteApplicationStateRepository
  constructor(
    repository: SQLiteApplicationStateRepository
  ) {
    this.repository = repository
  }

  async handle(
    events: readonly DomainEvent[]
  ): Promise<void> {
    for (const event of events) {
      switch (event.type) {
        case BusinessEventTypes.BUSINESS_CREATED: {
          await this.repository.setCurrentBusiness(
            event.aggregateId
          );

          break;
        }

        case BusinessEventTypes.BRANCH_CREATED: {
          await this.repository.setCurrentBranch(
            event.aggregateId
          );

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
        case BusinessEventTypes.BUSINESS_CREATED: {
          operations.push(
            this.repository.setCurrentBusinessOperation(
              event.aggregateId
            )
          );

          break;
        }

        case BusinessEventTypes.BRANCH_CREATED: {
          operations.push(
            this.repository.setCurrentBranchOperation(
              event.aggregateId
            )
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