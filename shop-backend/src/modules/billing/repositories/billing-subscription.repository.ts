import { BillingSubscriptionStatus } from "../../../infrastructure/postgresql/prisma/generated/enums.js";
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient 

export class BillingSubscriptionRepository {

  /**
   * Create a subscription.
   * The service must validate the plan version and business first.
   */
  async create(
    data: Prisma.BillingSubscriptionCreateInput,
    tx: DbClient
  ) {
    return tx.billingSubscription.create({
      data,
    });
  }

  /**
   * Retrieve a subscription by ID.
   */
  async findById(id: string, tx: DbClient) {
    return tx.billingSubscription.findUnique({
      where: { id },
      include: {
        planVersion: true,
        requests: {
          orderBy: { createdAt: "desc" },
        },
        entitlements: true,
        invoices: {
          orderBy: { createdAt: "desc" },
        },
        leases: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Retrieve subscriptions belonging to a business.
   */
  async findByBusinessId(
    businessId: string,
    params?: {
      status?: BillingSubscriptionStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const {
      status,
      skip = 0,
      take = 20,
    } = params ?? {};

    return prisma.billingSubscription.findMany({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        planVersion: true,
      },
    });
  }

  /**
   * Retrieve the current subscription for a business.
   *
   * Multiple historical subscriptions are allowed.
   * The service must enforce the rule that a business cannot
   * have conflicting current subscriptions.
   */
  async findCurrentByBusinessId(
    businessId: string,
    tx: DbClient 
  ) {
    const currentStatuses: BillingSubscriptionStatus[] = [
      BillingSubscriptionStatus.PENDING,
      BillingSubscriptionStatus.TRIALING,
      BillingSubscriptionStatus.ACTIVE,
      BillingSubscriptionStatus.PAST_DUE,
      BillingSubscriptionStatus.GRACE_PERIOD,
      BillingSubscriptionStatus.SUSPENDED,
    ];

    return tx.billingSubscription.findFirst({
      where: {
        businessId,
        status: {
          in: currentStatuses,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        planVersion: true,
      },
    });
  }

  /**
   * Retrieve an active subscription.
   */
  async findActiveByBusinessId(
    businessId: string,
    tx: DbClient
  ) {
    return tx.billingSubscription.findFirst({
      where: {
        businessId,
        status: BillingSubscriptionStatus.ACTIVE,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        planVersion: true,
      },
    });
  }

  /**
   * Retrieve subscriptions by status.
   * Useful for billing background workers.
   */
  async findByStatus(
    status: BillingSubscriptionStatus,
    params?: {
      skip?: number;
      take?: number;
    }
  ) {
    const {
      skip = 0,
      take = 100,
    } = params ?? {};

    return prisma.billingSubscription.findMany({
      where: { status },
      skip,
      take,
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  /**
   * Update subscription fields.
   */
  async update(
    id: string,
    data: Prisma.BillingSubscriptionUpdateInput,
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data,
    });
  }

  /**
   * Update subscription status.
   */
  async updateStatus(
    id: string,
    status: BillingSubscriptionStatus,
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  /**
   * Activate a subscription.
   */
  async activate(
    id: string,
    period: {
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      activatedAt?: Date;
      trialStart?: Date;
      trialEnd?: Date;
    },
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data: {
        status: period.trialEnd
          ? BillingSubscriptionStatus.TRIALING
          : BillingSubscriptionStatus.ACTIVE,
        currentPeriodStart: period.currentPeriodStart,
        currentPeriodEnd: period.currentPeriodEnd,
        activatedAt: period.activatedAt ?? new Date(),
        trialStart: period.trialStart,
        trialEnd: period.trialEnd,
        cancelledAt: null,
        expiredAt: null,
      },
    });
  }

  /**
   * Update the current billing period.
   */
  async updateBillingPeriod(
    id: string,
    data: {
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      gracePeriodEnd?: Date | null;
    },
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data: {
        currentPeriodStart: data.currentPeriodStart,
        currentPeriodEnd: data.currentPeriodEnd,
        gracePeriodEnd: data.gracePeriodEnd,
      },
    });
  }

  /**
   * Schedule cancellation at the end of the current period.
   */
  async scheduleCancellation(
    id: string,
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data: {
        cancelAtPeriodEnd: true,
      },
    });
  }

  /**
   * Cancel a subscription immediately.
   */
  async cancel(
    id: string,
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data: {
        status: BillingSubscriptionStatus.CANCELLED,
        cancelAtPeriodEnd: false,
        cancelledAt: new Date(),
      },
    });
  }

  /**
   * Expire a subscription.
   */
  async expire(
    id: string,
    tx: DbClient
  ) {
    return tx.billingSubscription.update({
      where: { id },
      data: {
        status: BillingSubscriptionStatus.EXPIRED,
        expiredAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });
  }

  /**
   * Find subscriptions whose billing periods have ended.
   */
  async findDueForExpiration(now = new Date(), take = 100) {
    return prisma.billingSubscription.findMany({
      where: {
        currentPeriodEnd: {
          lte: now,
        },
        status: {
          in: [
            BillingSubscriptionStatus.ACTIVE,
            BillingSubscriptionStatus.GRACE_PERIOD,
            BillingSubscriptionStatus.PAST_DUE,
          ],
        },
      },
      take,
      orderBy: {
        currentPeriodEnd: "asc",
      },
    });
  }

  /**
   * Find subscriptions whose scheduled cancellation is due.
   */
  async findDueForCancellation(now = new Date(), take = 100) {
    return prisma.billingSubscription.findMany({
      where: {
        cancelAtPeriodEnd: true,
        currentPeriodEnd: {
          lte: now,
        },
        status: {
          in: [
            BillingSubscriptionStatus.ACTIVE,
            BillingSubscriptionStatus.GRACE_PERIOD,
            BillingSubscriptionStatus.PAST_DUE,
          ],
        },
      },
      take,
      orderBy: {
        currentPeriodEnd: "asc",
      },
    });
  }

  /**
   * Find subscriptions requiring grace-period follow-up.
   */
  async findExpiredGracePeriods(now = new Date(), take = 100) {
    return prisma.billingSubscription.findMany({
      where: {
        status: BillingSubscriptionStatus.GRACE_PERIOD,
        gracePeriodEnd: {
          lte: now,
        },
      },
      take,
      orderBy: {
        gracePeriodEnd: "asc",
      },
    });
  }

  /**
   * Count subscriptions for a business.
   */
  async countByBusinessId(
    businessId: string,
    status?: BillingSubscriptionStatus
  ) {
    return prisma.billingSubscription.count({
      where: {
        businessId,
        ...(status ? { status } : {}),
      },
    });
  }

  /**
   * Delete only a subscription that has never become active
   * and has no associated financial records.
   *
   * Normally, subscriptions should be retained as history.
   */
  async deletePending(
    id: string,
    tx: DbClient
  ) {
    return tx.billingSubscription.deleteMany({
      where: {
        id,
        status: BillingSubscriptionStatus.PENDING,
        activatedAt: null,
        invoices: {
          none: {},
        },
        payments: {
          none: {},
        },
      },
    });
  }
}
