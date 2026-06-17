import { BaseEvent } from "@business/shared-types";
import { SyncRepository } from "../contracts/SyncRepository";
import { calculateRetryDelay } from "../helpers/calculateRetryDelay";
import { SyncErrorCode } from "../types/SyncError";

export class FailureService {

  constructor(
    private repository:
      SyncRepository,

    private maxRetry:
      number
  ) {}

  async failEvent(
    event: BaseEvent,
    error: SyncErrorCode
  ) {

    const retryCount =
      (event.retryCount ?? 0) + 1;

    const dead =
      retryCount >=
      this.maxRetry;

    if (dead) {

      await this.repository
        .markDead(
          event.id,
          error
        );

      return;
    }

    const delay =
      calculateRetryDelay(
        retryCount
      );

    await this.repository
      .markFailed(
        event.id,
        error,
        retryCount,
        Date.now() + delay
      );
  }
}