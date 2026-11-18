import { BillingRequestStatus, BillingRequestType } from "../../../infrastructure/postgresql/prisma/generated/enums.js";, 
import { Prisma } from "../../../infrastructure/postgresql/prisma/generated/client.js";
import { prisma } from "../../../infrastructure/postgresql/prismaClient.js";

type DbClient = Prisma.TransactionClient

export class BillingSubscriptionRequestRepository {

  /**
   * Create a subscription request.
   */
  async create(
    data: Prisma.BillingSubscriptionRequestCreateInput,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.create({
      data,
    });
  }

  /**
   * Retrieve a request by ID.
   */
  async findById(id: string, tx: DbClient) {
    return tx.billingSubscriptionRequest.findUnique({
      where: { id },
      include: {
        requestedPlanVersion: true,
        subscription: true,
      },
    });
  }

  /**
   * Retrieve requests belonging to a business.
   */
  async findByBusinessId(
    businessId: string,
    params?: {
      status?: BillingRequestStatus;
      requestType?: BillingRequestType;
      skip?: number;
      take?: number;
    }
  ) {
    const {
      status,
      requestType,
      skip = 0,
      take = 20,
    } = params ?? {};

    return prisma.billingSubscriptionRequest.findMany({
      where: {
        businessId,
        ...(status ? { status } : {}),
        ...(requestType ? { requestType } : {}),
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        requestedPlanVersion: true,
        subscription: true,
      },
    });
  }

  /**
   * Retrieve all pending requests.
   * Used by the administration dashboard.
   */
  async findPending(params?: {
    requestType?: BillingRequestType;
    skip?: number;
    take?: number;
  }) {
    const {
      requestType,
      skip = 0,
      take = 50,
    } = params ?? {};

    return prisma.billingSubscriptionRequest.findMany({
      where: {
        status: BillingRequestStatus.PENDING,
        ...(requestType ? { requestType } : {}),
      },
      skip,
      take,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        requestedPlanVersion: true,
        subscription: true,
      },
    });
  }

  /**
   * Find a pending request for a business.
   *
   * Useful for preventing duplicate subscription requests.
   */
  async findPendingByBusinessId(
    businessId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.findFirst({
      where: {
        businessId,
        status: BillingRequestStatus.PENDING,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        requestedPlanVersion: true,
        subscription: true,
      },
    });
  }

  /**
   * Find a request associated with a subscription.
   */
  async findBySubscriptionId(
    subscriptionId: string,
    params?: {
      status?: BillingRequestStatus;
      skip?: number;
      take?: number;
    }
  ) {
    const {
      status,
      skip = 0,
      take = 20,
    } = params ?? {};

    return prisma.billingSubscriptionRequest.findMany({
      where: {
        subscriptionId,
        ...(status ? { status } : {}),
      },
      skip,
      take,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        requestedPlanVersion: true,
      },
    });
  }

  /**
   * Approve a pending request.
   *
   * The service must perform the actual subscription change
   * in the same transaction as this decision.
   */
  async approve(
    id: string,
    reviewedBy: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.updateMany({
      where: {
        id,
        status: BillingRequestStatus.PENDING,
      },
      data: {
        status: BillingRequestStatus.APPROVED,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    });
  }

  /**
   * Reject a pending request.
   */
  async reject(
    id: string,
    reviewedBy: string,
    rejectionReason: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.updateMany({
      where: {
        id,
        status: BillingRequestStatus.PENDING,
      },
      data: {
        status: BillingRequestStatus.REJECTED,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason,
      },
    });
  }

  /**
   * Cancel a pending request.
   *
   * Only the service should decide whether the caller
   * has permission to cancel this request.
   */
  async cancel(
    id: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.updateMany({
      where: {
        id,
        status: BillingRequestStatus.PENDING,
      },
      data: {
        status: BillingRequestStatus.CANCELLED,
      },
    });
  }

  /**
   * Attach the resulting subscription to a request.
   */
  async attachSubscription(
    id: string,
    subscriptionId: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.update({
      where: { id },
      data: {
        subscription: {
          connect: {
            id: subscriptionId,
          },
        },
      },
    });
  }

  /**
   * Set when the requested change should take effect.
   */
  async setEffectiveAt(
    id: string,
    effectiveAt: Date,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.update({
      where: { id },
      data: {
        effectiveAt,
      },
    });
  }

  /**
   * Count requests matching optional filters.
   */
  async count(params?: {
    businessId?: string;
    status?: BillingRequestStatus;
    requestType?: BillingRequestType;
  }) {
    const {
      businessId,
      status,
      requestType,
    } = params ?? {};

    return prisma.billingSubscriptionRequest.count({
      where: {
        ...(businessId ? { businessId } : {}),
        ...(status ? { status } : {}),
        ...(requestType ? { requestType } : {}),
      },
    });
  }

  /**
   * Delete a request only when it is still pending.
   * Prefer cancellation to deletion for auditability.
   */
  async deletePending(
    id: string,
    tx: DbClient
  ) {
    return tx.billingSubscriptionRequest.deleteMany({
      where: {
        id,
        status: BillingRequestStatus.PENDING,
      },
    });
  }
}
