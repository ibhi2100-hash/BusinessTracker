import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";

export const PlatformMetricKey = {
  BUSINESSES_REGISTERED: "BUSINESSES_REGISTERED",
  BUSINESSES_ACTIVATED: "BUSINESSES_ACTIVATED",
  BUSINESSES_SUSPENDED: "BUSINESSES_SUSPENDED",
  BRANCHES_CREATED: "BRANCHES_CREATED",
  EMPLOYEES_CREATED: "EMPLOYEES_CREATED",
  PRODUCTS_CREATED: "PRODUCTS_CREATED",
  SUBSCRIPTIONS_ACTIVATED: "SUBSCRIPTIONS_ACTIVATED",
  SUBSCRIPTIONS_CANCELLED: "SUBSCRIPTIONS_CANCELLED",
  PAYMENTS_CONFIRMED: "PAYMENTS_CONFIRMED",
  PAYMENTS_FAILED: "PAYMENTS_FAILED",
  REFUNDS_SUCCEEDED: "REFUNDS_SUCCEEDED",
} as const;
type DbClient = Prisma.TransactionClient;

export interface IncrementDailyMetricInput {
  date: Date;
  metricKey: string;
  dimensionKey?: string;
  dimensionValue?: string;
  currency?: string;
  amount?: number;
}

export class PlatformDailyMetricRepository {
  async increment(input: IncrementDailyMetricInput, tx: DbClient) {
    const date = new Date(Date.UTC(
      input.date.getUTCFullYear(),
      input.date.getUTCMonth(),
      input.date.getUTCDate(),
    ));

    const dimensionKey = input.dimensionKey ?? "ALL";
    const dimensionValue = input.dimensionValue ?? "ALL";
    const currency = input.currency ?? "NGN";
    const amount = input.amount ?? 1;

    if (!Number.isFinite(amount)) {
      throw new Error("Metric amount must be finite.");
    }

    return tx.platformDailyMetric.upsert({
      where: {
        metricDate_metricKey_dimensionKey_dimensionValue_currency: {
          metricDate: date,
          metricKey: input.metricKey,
          dimensionKey,
          dimensionValue,
          currency,
        },
      },
      create: {
        metricDate: date,
        metricKey: input.metricKey,
        dimensionKey,
        dimensionValue,
        currency,
        value: new Prisma.Decimal(amount),
      },
      update: {
        value: { increment: new Prisma.Decimal(amount) },
      },
    });
  }

  async replace(
    input: IncrementDailyMetricInput,
    tx: DbClient,
  ) {
    const date = new Date(Date.UTC(
      input.date.getUTCFullYear(),
      input.date.getUTCMonth(),
      input.date.getUTCDate(),
    ));

    return tx.platformDailyMetric.upsert({
      where: {
        metricDate_metricKey_dimensionKey_dimensionValue_currency: {
          metricDate: date,
          metricKey: input.metricKey,
          dimensionKey: input.dimensionKey ?? "ALL",
          dimensionValue: input.dimensionValue ?? "ALL",
          currency: input.currency ?? "NGN",
        },
      },
      create: {
        metricDate: date,
        metricKey: input.metricKey,
        dimensionKey: input.dimensionKey ?? "ALL",
        dimensionValue: input.dimensionValue ?? "ALL",
        currency: input.currency ?? "NGN",
        value: new Prisma.Decimal(input.amount ?? 0),
      },
      update: {
        value: new Prisma.Decimal(input.amount ?? 0),
      },
    });
  }
}