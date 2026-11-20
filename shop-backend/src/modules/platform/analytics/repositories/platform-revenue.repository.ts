import { prisma } from "../../../../infrastructure/postgresql/prismaClient.js";
import { Prisma } from "../../../../infrastructure/postgresql/prisma/generated/client.js";

type DbClient = Prisma.TransactionClient;

export class PlatformRevenueRepository {

  async rebuildDay(date: Date, currency: string) {
    const start = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ));

    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const [payments, refunds, invoices, activeSubscriptions] =
      await Promise.all([
        prisma.billingPayment.findMany({
          where: {
            currency,
            status: {
              in: ["CONFIRMED", "PARTIALLY_REFUNDED", "REFUNDED"],
            },
            confirmedAt: {
              gte: start,
              lt: end,
            },
          },
          select: {
            businessId: true,
            amountMinor: true,
            providerFeeMinor: true,
          },
        }),

        prisma.billingRefund.findMany({
          where: {
            currency,
            status: "SUCCESS",
            processedAt: {
              gte: start,
              lt: end,
            },
          },
          select: {
            amountMinor: true,
          },
        }),

        prisma.billingInvoice.findMany({
          where: {
            currency,
            issuedAt: {
              gte: start,
              lt: end,
            },
            status: { notIn: ["DRAFT", "VOIDED", "CANCELLED"] },
          },
          select: {
            totalMinor: true,
          },
        }),

        prisma.billingSubscription.findMany({
          where: {
            currency,
            status: "ACTIVE",
          },
          select: {
            businessId: true,
            priceMinor: true,
            billingCycle: true,
          },
        }),
      ]);

    const grossCollectedMinor = payments.reduce(
      (sum, payment) => sum + payment.amountMinor,
      0n,
    );

    const refundsMinor = refunds.reduce(
      (sum, refund) => sum + refund.amountMinor,
      0n,
    );

    const providerFeesMinor = payments.reduce(
      (sum, payment) => sum + payment.providerFeeMinor,
      0n,
    );

    const invoicesIssuedMinor = invoices.reduce(
      (sum, invoice) => sum + invoice.totalMinor,
      0n,
    );

    const recurringRevenueMinor = activeSubscriptions.reduce(
      (sum, subscription) => {
        switch (subscription.billingCycle) {
          case "MONTHLY":
            return sum + subscription.priceMinor;
          case "QUARTERLY":
            return sum + subscription.priceMinor / 3n;
          case "YEARLY":
            return sum + subscription.priceMinor / 12n;
          case "LIFETIME":
            return sum;
          default:
            return sum;
        }
      },
      0n,
    );

    const payingBusinesses = new Set(
      payments.map((payment) => payment.businessId),
    ).size;

    // Outstanding is a current-state measure, not a historical daily flow.
    // It is therefore populated as an as-of snapshot on the current date.
    const outstandingInvoices = await prisma.billingInvoice.findMany({
      where: {
        currency,
        status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] },
        amountDueMinor: { gt: 0n },
      },
      select: { amountDueMinor: true },
    });

    const outstandingMinor = outstandingInvoices.reduce(
      (sum, invoice) => sum + invoice.amountDueMinor,
      0n,
    );

    const netCollectedMinor = grossCollectedMinor - refundsMinor;

    return prisma.platformRevenueDaily.upsert({
      where: {
        metricDate_currency: {
          metricDate: start,
          currency,
        },
      },
      create: {
        metricDate: start,
        currency,
        grossCollectedMinor,
        refundsMinor,
        netCollectedMinor,
        providerFeesMinor,
        invoicesIssuedMinor,
        outstandingMinor:
          start.toDateString() === new Date().toDateString()
            ? outstandingMinor
            : 0n,
        recurringRevenueMinor,
        successfulPayments: payments.length,
        failedPayments: await prisma.billingPayment.count({
          where: {
            currency,
            status: "FAILED",
            failedAt: { gte: start, lt: end },
          },
        }),
        payingBusinesses,
      },
      update: {
        grossCollectedMinor,
        refundsMinor,
        netCollectedMinor,
        providerFeesMinor,
        invoicesIssuedMinor,
        outstandingMinor:
          start.toDateString() === new Date().toDateString()
            ? outstandingMinor
            : 0n,
        recurringRevenueMinor,
        successfulPayments: payments.length,
        failedPayments: await prisma.billingPayment.count({
          where: {
            currency,
            status: "FAILED",
            failedAt: { gte: start, lt: end },
          },
        }),
        payingBusinesses,
      },
    });
  }

  async rebuildRange(
    from: Date,
    to: Date,
    currencies: string[],
  ) {
    if (from > to) {
      throw new Error("The start date must be before the end date.");
    }

    let rebuilt = 0;

    for (const currency of currencies) {
      const cursor = new Date(Date.UTC(
        from.getUTCFullYear(),
        from.getUTCMonth(),
        from.getUTCDate(),
      ));

      const end = new Date(Date.UTC(
        to.getUTCFullYear(),
        to.getUTCMonth(),
        to.getUTCDate(),
      ));

      while (cursor <= end) {
        await this.rebuildDay(cursor, currency);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        rebuilt++;
      }
    }

    return { rebuilt };
  }
}