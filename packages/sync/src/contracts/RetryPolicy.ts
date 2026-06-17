export interface RetryPolicy {

    nextDelay(
        retryCount: number
    ): number;

    shouldRetry(
        retryCount: number
    ): boolean;

}