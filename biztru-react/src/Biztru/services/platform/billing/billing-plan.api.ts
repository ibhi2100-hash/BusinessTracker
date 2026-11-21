
import type { BillingPlanVersion } from "../../../../types/billing/billingPlan.types";
import type {
  BillingPlan,
  BillingPlanResponse,
  BillingPlansResponse,
  CreateBillingPlanInput,
  UpdateBillingPlanInput,
} from "../../../types/billing/billing-plan.types";

const BASE_URL = "/api/platform/billing/plans";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Billing operation failed"
    );
  }

  return data as T;
}

export const billingPlanApi = {
  async list(): Promise<BillingPlan[]> {
    const result =
      await request<BillingPlansResponse>("");

    return result.plans;
  },

  async get(planId: string): Promise<BillingPlan> {
    const result =
      await request<BillingPlanResponse>(
        `/${encodeURIComponent(planId)}`
      );

    return result.plan;
  },

  async create(
    payload: CreateBillingPlanInput
  ): Promise<BillingPlan> {
    const result =
      await request<BillingPlanResponse>("", {
        method: "POST",
        body: JSON.stringify(payload),
      });

    return result.plan;
  },

  async update(
    planId: string,
    payload: UpdateBillingPlanInput
  ): Promise<BillingPlan> {
    const result =
      await request<BillingPlanResponse>(
        `/${encodeURIComponent(planId)}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

    return result.plan;
  },

  async publish(
    planId: string
  ): Promise<BillingPlan> {
    const result =
      await request<BillingPlanResponse>(
        `/${encodeURIComponent(planId)}/publish`,
        {
          method: "POST",
        }
      );

    return result.plan;
  },

  async retire(
    planId: string
  ): Promise<BillingPlan> {
    const result =
      await request<BillingPlanResponse>(
        `/${encodeURIComponent(planId)}/retire`,
        {
          method: "POST",
        }
      );

    return result.plan;
  },

  async versions(planId: string): Promise<BillingPlanVersion[]> {
  const result = await request<{
    versions: BillingPlanVersion[];
  }>(
    `/${encodeURIComponent(planId)}/versions`
  );

  return result.versions;
},
};
