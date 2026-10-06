import type { ProjectionConsumer } from "@business/event-bus";

import {
  BusinessEventTypes,
} from "@business/shared-types";

import type {
  DomainEvent,
} from "@business/shared-types";

import {
  SQLiteAuthRepository,
} from "../repositories/SQLiteAuthRepository/SQLiteAuthRepository";

import type {
  SQLiteStatementOperation,
} from "../../../../storage/statement/worker/WorkerProtocol";


export class UserProjection
  implements ProjectionConsumer<DomainEvent>
{
  readonly name = "User";

  private readonly repository: SQLiteAuthRepository;


  constructor(
    repository: SQLiteAuthRepository
  ) {
    this.repository = repository;
  }


  async handle(
    events: readonly DomainEvent[]
  ): Promise<void> {

    for (const event of events) {

      switch (event.type) {

        /*
         * BUSINESS
         *
         * BUSINESS_CREATED establishes the
         * business relationship on the User
         * projection.
         */
        case BusinessEventTypes.BUSINESS_CREATED: {

                await this.repository.updateBusiness(
                    event.actor.userId,
                    event.aggregateId,
                    event.logicClock,
                    event.id,
                    event.createdAt
                );
            break;
        }


        /*
         * BRANCH
         *
         * A branch-related event updates the
         * branch relationship on the User
         * projection.
         */
        case BusinessEventTypes.BRANCH_CREATED: {

          await this.repository.updateBranch(
            event.actor.userId,
            event.aggregateId,
            event.logicClock,
            event.id,
            event.createdAt
          );

          break;
        }


        /*
         * ACTIVATION
         *
         * User activation changes the user's
         * active state.
         */
        case BusinessEventTypes.BUSINESS_ACTIVATION: {

          await this.repository.updateActivation(
            event.actor.userId,
            1,
            event.logicClock,
            event.id,
            event.createdAt
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

    console.log("this is the events: ", events)

    return operations;
  }
}