
import {
  BillingPlanStatus,
} from "../../../infrastructure/postgresql/prisma/generated/enums.js";

import {
  Prisma,
} from "../../../infrastructure/postgresql/prisma/generated/client.js";

import {
  prisma,
} from "../../../infrastructure/postgresql/prismaClient.js";

import {
  BillingPlanRepository,
} from "../repositories/billing-plan.repository.js";

/* -------------------------------------------------------------------------- */
/* INPUT TYPES                                                                */
/* -------------------------------------------------------------------------- */

type CreatePlanInput = {
  code: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
  isFeatured?: boolean;
  initialVersion: CreatePlanVersionInput;
};

type CreatePlanVersionInput = {
  priceMinor: bigint;
  currency?: string;
  billingCycle: "MONTHLY" | "QUARTERLY" | "YEARLY" | "LIFETIME";
  intervalCount?: number;
  trialDays: number;
  maxStaff: number;
  maxBranch: number;
  maxProduct: number;
  features: Prisma.InputJsonValue;
};

type UpdatePlanInput = {
  name?: string;
  description?: string | null;
  displayOrder?: number;
  isFeatured?: boolean;
};

type GetAdminPlansParams = {
  status?: BillingPlanStatus;
  search?: string;
  skip?: number;
  take?: number;
};

/* -------------------------------------------------------------------------- */
/* VALIDATION HELPERS                                                         */
/* -------------------------------------------------------------------------- */

function assertNonEmptyString(
  value: string,
  field: string
): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${field} is required.`);
  }

  return normalized;
}

function assertNonNegativeInteger(
  value: number,
  field: string
): void {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${field} must be a non-negative integer.`
    );
  }
}

function assertPositiveInteger(
  value: number,
  field: string
): void {
  if (
    !Number.isSafeInteger(value) ||
    value < 1
  ) {
    throw new Error(
      `${field} must be a positive integer.`
    );
  }
}

function isUniqueConstraintError(
  error: unknown
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

/* -------------------------------------------------------------------------- */
/* BILLING PLAN SERVICE                                                       */
/* -------------------------------------------------------------------------- */

export class BillingPlanService {
  constructor(
    private readonly planRepository: BillingPlanRepository
  ) {}

  /* ------------------------------------------------------------------------ */
  /* CREATE PLAN                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Create a billing plan.
   *
   * Every new plan starts as DRAFT.
   */
  async createPlan(input: CreatePlanInput) {
  const code = assertNonEmptyString(
    input.code,
    "Plan code"
  ).toUpperCase();

  const name = assertNonEmptyString(
    input.name,
    "Plan name"
  );

  const version = input.initialVersion;

  if (!version) {
    throw new Error("Initial billing plan version is required.");
  }

  if (version.priceMinor < 0n) {
    throw new Error("Plan price cannot be negative.");
  }

  const currency = (
    version.currency ?? "NGN"
  ).toUpperCase();

  const intervalCount = version.intervalCount ?? 1;
  const trialDays = version.trialDays ?? 0;

  if (intervalCount < 1) {
    throw new Error("Interval count must be at least 1.");
  }

  if (trialDays < 0) {
    throw new Error("Trial days cannot be negative.");
  }

  if (
    version.maxStaff == null ||
    version.maxBranch == null ||
    version.maxProduct == null
  ) {
    throw new Error(
      "Staff, branch, and product limits are required."
    );
  }

  return prisma.$transaction(
    async (tx) => {
      const existing =
        await this.planRepository.findByCode(code, tx);

      if (existing) {
        throw new Error(
          "A billing plan with this code already exists."
        );
      }

      // 1. Create the plan.
      const plan = await this.planRepository.create(
        {
          code,
          name,
          description: input.description ?? null,
          displayOrder: input.displayOrder ?? 0,
          isFeatured: input.isFeatured ?? false,
          status: BillingPlanStatus.DRAFT,
        },
        tx
      );

      // 2. Create its initial version.
      const initialVersion =
        await this.planRepository.createVersion(
          {
            id: crypto.randomUUID(),
            plan: {
              connect: {
                id: plan.id,
              },
            },
            planVersion: 1,
            priceMinor: version.priceMinor,
            currency,
            billingCycle: version.billingCycle,
            intervalCount,
            trialDays,
            maxStaff: version.maxStaff,
            maxBranch: version.maxBranch,
            maxProduct: version.maxProduct,
            features: version.features ?? {},
          },
          tx
        );

      // 3. Return the plan with its initial version.
      return {
        ...plan,
        versions: [initialVersion],
      };
    },
    {
      isolationLevel:
        Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
  /* ------------------------------------------------------------------------ */
  /* UPDATE PLAN                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Update plan presentation metadata.
   *
   * Pricing and entitlements are managed through plan versions.
   */
  async updatePlan(
    id: string,
    input: UpdatePlanInput
  ) {
    if (!id.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    if (
      input.name === undefined &&
      input.description === undefined &&
      input.displayOrder === undefined &&
      input.isFeatured === undefined
    ) {
      throw new Error(
        "At least one plan field must be provided for update."
      );
    }

    if (input.name !== undefined) {
      assertNonEmptyString(input.name, "Plan name");
    }

    if (input.displayOrder !== undefined) {
      assertNonNegativeInteger(
        input.displayOrder,
        "Display order"
      );
    }

    return prisma.$transaction(
      async (tx) => {
        const plan =
          await this.planRepository.findById(id, tx);

        if (!plan) {
          throw new Error("Billing plan not found.");
        }

        if (
          plan.status === BillingPlanStatus.ARCHIVED
        ) {
          throw new Error(
            "Archived plans cannot be modified."
          );
        }

        return this.planRepository.update(
          id,
          {
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
          },
          tx
        );
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* CREATE VERSION                                                           */
  /* ------------------------------------------------------------------------ */

  /**
   * Create a new plan version.
   *
   * Published versions are never modified.
   * New commercial terms must always create a new version.
   */
  async createVersion(
    planId: string,
    input: CreatePlanVersionInput
  ) {
    if (!planId.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    if (input.priceMinor < 0n) {
      throw new Error("Plan price cannot be negative.");
    }

    if (
      !Number.isInteger(input.intervalCount ?? 1) ||
      (input.intervalCount ?? 1) < 1
    ) {
      throw new Error(
        "Interval count must be a positive integer."
      );
    }

    if (
      !Number.isInteger(input.trialDays ?? 0) ||
      (input.trialDays ?? 0) < 0
    ) {
      throw new Error(
        "Trial days must be a non-negative integer."
      );
    }

    for (const [field, value] of Object.entries({
      maxStaff: input.maxStaff,
      maxBranch: input.maxBranch,
      maxProduct: input.maxProduct,
    })) {
      if (
        value !== null &&
        value !== undefined
      ) {
        assertNonNegativeInteger(value, field);
      }
    }

    const currency = (
      input.currency ?? "NGN"
    ).trim().toUpperCase();

    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new Error(
        "Currency must be a valid three-letter currency code."
      );
    }

    return prisma.$transaction(
      async (tx) => {
        const plan =
          await this.planRepository.findById(
            planId,
            tx
          );

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

        const latestVersion =
          await this.planRepository.findLatestVersion(
            planId,
            tx
          );

        const nextVersion =
          (latestVersion?.planVersion ?? 0) + 1;

        return this.planRepository.createVersion(
          {
            id: crypto.randomUUID(),
            plan: {
              connect: {
                id: planId,
              },
            },

            planVersion: nextVersion,
            priceMinor: input.priceMinor,
            currency,
            billingCycle: input.billingCycle,
            intervalCount: input.intervalCount ?? 1,
            trialDays: input.trialDays ?? 0,
            maxStaff: input.maxStaff ?? 0,
            maxBranch: input.maxBranch ?? 0,
            maxProduct: input.maxProduct ?? null,
            features: input.features,
          },
          tx
        );
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* PUBLISH VERSION                                                          */
  /* ------------------------------------------------------------------------ */

  /**
   * Publish a specific plan version.
   *
   * Version publication and plan status changes are atomic.
   */
  async publishVersion(
    planId: string,
    planVersion: number
  ) {
    if (!planId.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    assertPositiveInteger(
      planVersion,
      "Plan version"
    );

    return prisma.$transaction(
      async (tx) => {
        const plan =
          await this.planRepository.findById(
            planId,
            tx
          );

        if (!plan) {
          throw new Error("Billing plan not found.");
        }

        if (
          plan.status === BillingPlanStatus.RETIRED ||
          plan.status === BillingPlanStatus.ARCHIVED
        ) {
          throw new Error(
            "This plan cannot be published."
          );
        }

        const version =
          await this.planRepository.findVersion(
            planId,
            planVersion,
            tx
          );

        if (!version) {
          throw new Error("Plan version not found.");
        }

        if (version.publishedAt) {
          throw new Error(
            "This plan version has already been published."
          );
        }

        if (version.priceMinor < 0n) {
          throw new Error("Invalid plan price.");
        }

        const now = new Date();

        await this.planRepository.updateVersion(
          planId,
          planVersion,
          {
            publishedAt: now,
          },
          tx
        );

        await this.planRepository.publish(
          planId,
          tx
        );

        return {
          planId,
          planVersion,
          publishedAt: now,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }



  /**
   * Get the complete version history for a billing plan.
   */
  async getPlanVersions(planId: string) {
    if (!planId.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    const plan = await this.planRepository.findById(planId);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    return {
      planId: plan.id,
      planCode: plan.code,
      planName: plan.name,
      planStatus: plan.status,
      versions: plan.versions.map((version) => ({
        ...version,
        priceMinor: version.priceMinor.toString(),
      })),
    };
  }

  /**
   * Get one specific version of a billing plan.
   */
  async getPlanVersion(
    planId: string,
    planVersion: number
  ) {
    if (!planId.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    if (
      !Number.isSafeInteger(planVersion) ||
      planVersion < 1
    ) {
      throw new Error("A valid plan version is required.");
    }

    const plan = await this.planRepository.findById(planId);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    const version = await this.planRepository.findVersion(
      planId,
      planVersion
    );

    if (!version) {
      throw new Error("Billing plan version not found.");
    }

    return {
      ...version,
      priceMinor: version.priceMinor.toString(),
    };
  }

  /* ------------------------------------------------------------------------ */
  /* PUBLISH PLAN                                                             */
  /* ------------------------------------------------------------------------ */

  /**
   * Publish the latest unpublished version of a plan.
   */
  async publishPlan(id: string) {
    if (!id.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    return prisma.$transaction(
      async (tx) => {
        const plan =
          await this.planRepository.findById(id, tx);

        if (!plan) {
          throw new Error("Billing plan not found.");
        }

        if (
          plan.status === BillingPlanStatus.RETIRED ||
          plan.status === BillingPlanStatus.ARCHIVED
        ) {
          throw new Error(
            "This plan cannot be published."
          );
        }

        const latestVersion =
          await this.planRepository.findLatestVersion(
            id,
            tx
          );

        if (!latestVersion) {
          throw new Error(
            "This plan does not have a version to publish."
          );
        }

        if (latestVersion.publishedAt) {
          throw new Error(
            "The latest plan version has already been published."
          );
        }

        const now = new Date();

        await this.planRepository.updateVersion(
          id,
          latestVersion.planVersion,
          {
            publishedAt: now,
          },
          tx
        );

        await this.planRepository.publish(
          id,
          tx
        );

        return {
          planId: id,
          planVersion: latestVersion.planVersion,
          publishedAt: now,
        };
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* RETIRE PLAN                                                              */
  /* ------------------------------------------------------------------------ */

  /**
   * Retire a plan.
   *
   * Existing subscriptions retain their historical plan versions.
   */
  async retirePlan(id: string) {
    if (!id.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    return prisma.$transaction(
      async (tx) => {
        const plan =
          await this.planRepository.findById(id, tx);

        if (!plan) {
          throw new Error("Billing plan not found.");
        }

        if (
          plan.status === BillingPlanStatus.ARCHIVED
        ) {
          throw new Error(
            "Archived plans cannot be retired."
          );
        }

        if (
          plan.status === BillingPlanStatus.RETIRED
        ) {
          throw new Error(
            "This plan is already retired."
          );
        }

        return this.planRepository.retire(id, tx);
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ARCHIVE PLAN                                                             */
  /* ------------------------------------------------------------------------ */

  /**
   * Archive a retired plan.
   */
  async archivePlan(id: string) {
    if (!id.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    return prisma.$transaction(
      async (tx) => {
        const plan =
          await this.planRepository.findById(id, tx);

        if (!plan) {
          throw new Error("Billing plan not found.");
        }

        if (
          plan.status !== BillingPlanStatus.RETIRED
        ) {
          throw new Error(
            "Only retired plans can be archived."
          );
        }

        return this.planRepository.update(
          id,
          {
            status: BillingPlanStatus.ARCHIVED,
          },
          tx
        );
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  }

  /* ------------------------------------------------------------------------ */
  /* PUBLIC PRICING CATALOG                                                   */
  /* ------------------------------------------------------------------------ */

  /**
   * Get the public pricing catalog.
   *
   * BigInt values are serialized as strings.
   */
  async getPublicPlans() {
    const plans =
      await this.planRepository.findPublicPlans();

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
              priceMinor:
                latestVersion.priceMinor.toString(),
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

  /* ------------------------------------------------------------------------ */
  /* ADMIN PLAN CATALOG                                                       */
  /* ------------------------------------------------------------------------ */

  /**
   * Get the administrative plan catalog.
   */
  async getAdminPlans(
    params?: GetAdminPlansParams
  ) {
    const skip = params?.skip ?? 0;
    const take = params?.take ?? 20;

    if (
      !Number.isSafeInteger(skip) ||
      skip < 0
    ) {
      throw new Error(
        "Pagination skip must be a non-negative integer."
      );
    }

    if (
      !Number.isSafeInteger(take) ||
      take < 1 ||
      take > 100
    ) {
      throw new Error(
        "Pagination take must be between 1 and 100."
      );
    }

    const normalizedParams = {
      ...(params?.status !== undefined && {
        status: params.status,
      }),
      ...(params?.search !== undefined && {
        search: params.search.trim(),
      }),
      skip,
      take,
    };

    const [plans, total] = await Promise.all([
      this.planRepository.findMany(
        normalizedParams
      ),

      this.planRepository.count({
        ...(normalizedParams.status !== undefined && {
          status: normalizedParams.status,
        }),
        ...(normalizedParams.search !== undefined && {
          search: normalizedParams.search,
        }),
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
        skip,
        take,
      },
    };
  }

  /* ------------------------------------------------------------------------ */
  /* PLAN DETAILS                                                             */
  /* ------------------------------------------------------------------------ */

  /**
   * Get a plan and its complete version history.
   */
  async getPlanDetails(id: string) {
    if (!id.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    const plan =
      await this.planRepository.findById(id);

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


  /* ------------------------------------------------------------------------ */
  /* PUBLIC PLAN VERSIONS                                                     */
  /* ------------------------------------------------------------------------ */

  /**
   * Get published versions of a published plan.
   *
   * This method is safe for business-facing catalogue requests.
   * Draft versions and retired plans are not exposed.
   */
  async getPublicPlanVersions(planId: string) {
    if (!planId.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    const plan =
      await this.planRepository.findById(planId);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    if (plan.status !== BillingPlanStatus.PUBLISHED) {
      throw new Error("This billing plan is not publicly available.");
    }

    const versions = plan.versions
      .filter((version) => version.publishedAt !== null)
      .map((version) => ({
        ...version,
        priceMinor: version.priceMinor.toString(),
      }));

    return {
      planId: plan.id,
      planCode: plan.code,
      planName: plan.name,
      versions,
    };
  }

  /**
   * Get one specific published version of a published plan.
   *
   * Never exposes a draft or unpublished version.
   */
  async getPublicPlanVersion(
    planId: string,
    planVersion: number
  ) {
    if (!planId.trim()) {
      throw new Error("Billing plan ID is required.");
    }

    if (
      !Number.isSafeInteger(planVersion) ||
      planVersion < 1
    ) {
      throw new Error("A valid plan version is required.");
    }

    const plan =
      await this.planRepository.findById(planId);

    if (!plan) {
      throw new Error("Billing plan not found.");
    }

    if (plan.status !== BillingPlanStatus.PUBLISHED) {
      throw new Error("This billing plan is not publicly available.");
    }

    const version =
      await this.planRepository.findVersion(
        planId,
        planVersion
      );

    if (!version || !version.publishedAt) {
      throw new Error("Published billing plan version not found.");
    }

    return {
      ...version,
      priceMinor: version.priceMinor.toString(),
    };
  }

}
