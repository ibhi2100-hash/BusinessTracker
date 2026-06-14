import { SyncRepository } from "../contracts/SyncRepository";
import { calculateRetryDelay } from "../helpers/calculateRetryDelay";

export class FailureService {

  constructor(
    private repository:
      SyncRepository,

    private maxRetry:
      number
  ) {}

  async failEvent(
    event: any,
    error: string
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