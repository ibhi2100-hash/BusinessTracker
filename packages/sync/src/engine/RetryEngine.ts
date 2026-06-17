import { BaseEvent } from "@business/shared-types";

import { RetryPolicy } from "../contracts/RetryPolicy";
import { SyncRepository } from "../contracts/SyncRepository";

export class RetryEngine {

    constructor(
        private repository: SyncRepository,
        private retryPolicy: RetryPolicy
    ) {}

    async schedule(
        event: BaseEvent,
        reason?: string
    ): Promise<void> {

        const retryCount = (event.retryCount ?? 0) + 1;

        if (!this.retryPolicy.shouldRetry(retryCount)) {

            await this.repository.markDead(
                event.id,
                reason ?? "Retry limit exceeded"
            );

            return;
        }

        const nextRetryAt =
            this.retryPolicy.nextDelay(retryCount);

        await this.repository.markFailed(
            event.id,
            reason ?? "",
            retryCount,
            nextRetryAt
        );
    }

    async reset(
        eventId: string
    ): Promise<void> {

        await this.repository.resetForRetry(
            eventId
        );

    }

    async readyForRetry(): Promise<BaseEvent[]> {

        return this.repository.getRetryableEvents(
            Date.now()
        );

    }

}