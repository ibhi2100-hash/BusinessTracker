export interface RetryPolicy {
    nextDelay(retryCount: number): number;
}
