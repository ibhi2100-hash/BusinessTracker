
import {
  BillingPlanStatus,
  Prisma,
  PrismaClient,
} from "../../generated/client";

import { BillingPlanRepository } from "../repositories/billing-plan.repository";

type CreatePlanInput = {
  code: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
  isFeatured?: boolean;
};

type CreatePlanVersionInput = {
  priceMinor: bigint;
  currency?: string;
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
  intervalCount?: number;
  trialDays?: number;
  maxStaff?: number | null;
  maxBranch?: number | null;
  maxProduct?: number | null;
  features: Prisma.InputJsonValue;
};

type UpdatePlanInput = {
  name?: string;
  description?: string | null;
  displayOrder?: number;
  isFeatured?: boolean;
};

export class BillingPlanService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly planRepository: BillingPlanRepository
  ) {}

  /**
   * Create a billing plan.
   *
   * New plans always start as DRAFT.
   */
  async createPlan(input: CreatePlanInput) {
    const code = input.code.trim().toUpperCase();

    if (!code) {
      throw new Error("Plan code is required.");
    }

    if (!input.name.trim()) {
      throw new Error("Plan name is required.");
    }

    const existing = await this.planRepository.findByCode(code);

    if (existing) {
      throw new Error("A billing plan with this code already exists.");
    }

    return this.planRepository.create({
      code,
      name: input.name.trim(),
      description: input.description ?? null,
      displayOrder: input.displayOrder ?? 0,
      isFeatured: input.isFeatured ?? false,
      status: BillingPlanStatus.DRAFT,
    });
  }

  /**
   * Update plan presentation metadata.
   *
   * Published plan pricing is never changed here.
   */
  async updatePlan(id: string, input: UpdatePlanInput) {
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    if (
      plan.status === BillingPlanStatus.ARCHIVED
    ) {
      throw new Error("Archived plans cannot be modified.");
    }

    return this.planRepository.update(id, {
      ...(input.name !== undefined
        ? { name: input.name.trim() }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.displayOrder !== undefined
        ? { displayOrder: input.displayOrder }
        : {}),
      ...(input.isFeatured !== undefined
        ? { isFeatured: input.isFeatured }
        : {}),
    });
  }

  /**
   * Create a new version of a plan.
   *
   * Each published version is immutable.
   */
  async createVersion(
    planId: string,
    input: CreatePlanVersionInput
  ) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.billingPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new Error("Billing plan not found.");
      }

      if (
        plan.status === BillingPlanStatus.RETIRED ||
        plan.status === BillingPlanStatus.ARCHIVED
      ) {
        throw new Error(
          "Cannot create versions for retired or archived plans."
        );
      }

      if (input.priceMinor < 0n) {
        throw new Error("Plan price cannot be negative.");
      }

      if (
        !Number.isInteger(input.intervalCount ?? 1) ||
        (input.intervalCount ?? 1) < 1
      ) {
        throw new Error("Interval count must be a positive integer.");
      }

      if (
        !Number.isInteger(input.trialDays ?? 0) ||
        (input.trialDays ?? 0) < 0
      ) {
        throw new Error("Trial days cannot be negative.");
      }

      for (const [name, value] of Object.entries({
        maxStaff: input.maxStaff,
        maxBranch: input.maxBranch,
        maxProduct: input.maxProduct,
      })) {
        if (
          value !== null &&
          value !== undefined &&
          (!Number.isInteger(value) || value < 0)
        ) {
          throw new Error(`${name} must be a non-negative integer or null.`);
        }
      }

      const latestVersion = await tx.billingPlanVersion.findFirst({
        where: { planId },
        orderBy: { planVersion: "desc" },
        select: { planVersion: true },
      });

      const nextVersion = (latestVersion?.planVersion ?? 0) + 1;

      return tx.billingPlanVersion.create({
        data: {
          plan: {
            connect: { id: planId },
          },
          planVersion: nextVersion,
          priceMinor: input.priceMinor,
          currency: input.currency ?? "NGN",
          billingCycle: input.billingCycle,
          intervalCount: input.intervalCount ?? 1,
          trialDays: input.trialDays ?? 0,
          maxStaff: input.maxStaff ?? null,
          maxBranch: input.maxBranch ?? null,
          maxProduct: input.maxProduct ?? null,
          features: input.features,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  /**
   * Publish a specific plan version.
   *
   * Publication is performed transactionally.
   */
  async publishVersion(
    planId: string,
    planVersion: number
  ) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.billingPlan.findUnique({
        where: { id: planId },
      });

      if (!plan) {
        throw new Error("Billing plan not found.");
      }

      if (
        plan.status === BillingPlanStatus.RETIRED ||
        plan.status === BillingPlanStatus.ARCHIVED
      ) {
        throw new Error("This plan cannot be published.");
      }

      const version = await tx.billingPlanVersion.findUnique({
        where: {
          planId_planVersion: {
            planId,
            planVersion,
          },
        },
      });

      if (!version) {
        throw new Error("Plan version not found.");
      }

      if (version.publishedAt) {
        throw new Error("This plan version has already been published.");
      }

      if (version.priceMinor < 0n) {
        throw new Error("Invalid plan price.");
      }

      const now = new Date();

      await tx.billingPlanVersion.update({
        where: {
          planId_planVersion: {
            planId,
            planVersion,
          },
        },
        data: {
          publishedAt: now,
        },
      });

      await tx.billingPlan.update({
        where: { id: planId },
        data: {
          status: BillingPlanStatus.PUBLISHED,
        },
      });

      return {
        planId,
        planVersion,
        publishedAt: now,
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });
  }

  /**
   * Publish a plan using its latest unpublished version.
   */
  async publishPlan(id: string) {
    const latestVersion =
      await this.prisma.billingPlanVersion.findFirst({
        where: {
          planId: id,
          publishedAt: null,
        },
        orderBy: {
          planVersion: "desc",
        },
      });

    if (!latestVersion) {
      throw new Error("No unpublished plan version is available.");
    }

    return this.publishVersion(id, latestVersion.planVersion);
  }

  /**
   * Retire a plan.
   *
   * Existing subscriptions remain historically valid.
   */
  async retirePlan(id: string) {
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    if (plan.status === BillingPlanStatus.ARCHIVED) {
      throw new Error("Archived plans cannot be retired.");
    }

    return this.planRepository.retire(id);
  }

  /**
   * Archive a retired plan.
   */
  async archivePlan(id: string) {
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    if (plan.status !== BillingPlanStatus.RETIRED) {
      throw new Error("Only retired plans can be archived.");
    }

    return this.planRepository.update(id, {
      status: BillingPlanStatus.ARCHIVED,
    });
  }

  /**
   * Get public pricing catalog.
   *
   * BigInt values are serialized as strings.
   */
  async getPublicPlans() {
    const plans = await this.planRepository.findPublicPlans();

    return plans.map((plan) => {
      const latestVersion = plan.versions[0];

      return {
        id: plan.id,
        code: plan.code,
        name: plan.name,
        description: plan.description,
        displayOrder: plan.displayOrder,
        isFeatured: plan.isFeatured,
        version: latestVersion
          ? {
              planId: latestVersion.planId,
              planVersion: latestVersion.planVersion,
              priceMinor: latestVersion.priceMinor.toString(),
              currency: latestVersion.currency,
              billingCycle: latestVersion.billingCycle,
              intervalCount: latestVersion.intervalCount,
              trialDays: latestVersion.trialDays,
              maxStaff: latestVersion.maxStaff,
              maxBranch: latestVersion.maxBranch,
              maxProduct: latestVersion.maxProduct,
              features: latestVersion.features,
            }
          : null,
      };
    });
  }

  /**
   * Get administrative plan catalog.
   */
  async getAdminPlans(params?: {
    status?: BillingPlanStatus;
    search?: string;
    skip?: number;
    take?: number;
  }) {
    const [plans, total] = await Promise.all([
      this.planRepository.findMany(params),
      this.planRepository.count({
        status: params?.status,
        search: params?.search,
      }),
    ]);

    return {
      data: plans.map((plan) => ({
        ...plan,
        versions: plan.versions.map((version) => ({
          ...version,
          priceMinor: version.priceMinor.toString(),
        })),
      })),
      pagination: {
        total,
        skip: params?.skip ?? 0,
        take: params?.take ?? 20,
      },
    };
  }

  /**
   * Get one plan and its version history.
   */
  async getPlanDetails(id: string) {
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    return {
      ...plan,
      versions: plan.versions.map((version) => ({
        ...version,
        priceMinor: version.priceMinor.toString(),
      })),
    };
  }
}
