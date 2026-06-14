import { SyncRepository } from "../contracts/SyncRepository";

export class RetryEngine {
    constructor(
        private repo: SyncRepository
    ){}

    async execute() {
        const now =
            Date.now()

        const retryable = 
            await this.repo 
                .getRetryableEvents(now);

        for(const event of retryable) {
            await this.repo
                .resetForRetry(event.id)
        }
    }
}