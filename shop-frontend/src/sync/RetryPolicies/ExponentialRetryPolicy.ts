import { RetryPolicy} from "@business/sync";

export class ExponentialRetryPolicy implements RetryPolicy {

  constructor(
    private readonly options?: {
      baseDelayMs?: number;
      maxDelayMs?: number;
      factor?: number;
      maxRetries?: number;
    }
  ) {}

  nextDelay(retryCount: number): number {

    const base =
      this.options?.baseDelayMs ?? 2000;

    const factor =
      this.options?.factor ?? 2;

    const max =
      this.options?.maxDelayMs ?? 5 * 60 * 1000;

    const delay =
      base * Math.pow(factor, retryCount - 1);

    return Math.min(delay, max);
  }

  shouldRetry(retryCount: number): boolean {

    const maxRetries =
      this.options?.maxRetries ?? 8;

    return retryCount < maxRetries;
  }
}