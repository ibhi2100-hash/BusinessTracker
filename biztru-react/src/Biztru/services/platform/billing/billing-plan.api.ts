
import type { BillingPlanVersion } from "../../../../types/billing/billingPlan.types";

import type {
  BillingPlan,
  BillingPlanResponse,
  BillingPlansResponse,
  CreateBillingPlanInput,
  UpdateBillingPlanInput,
} from "../../../../types/billing/billingPlan.types";

import { platformRequest } from "../platformApiClient"; 

const BASE = "/platform/billing/plans";

export const billingPlanApi = {
  async list(accessToken: string): Promise<BillingPlan[]> {
    const result = await platformRequest<BillingPlansResponse>(
      BASE,
      accessToken
    );

    return result.plans;
  },

  async get(
    planId: string,
    accessToken: string
  ): Promise<BillingPlan> {
    const result = await platformRequest<BillingPlanResponse>(
      `${BASE}/${encodeURIComponent(planId)}`,
      accessToken
    );

    return result.plan;
  },

  async create(
    payload: CreateBillingPlanInput,
    accessToken: string
  ): Promise<BillingPlan> {
    const result = await platformRequest<BillingPlanResponse>(
      `${BASE}/create`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    return result.plan;
  },

  async update(
    planId: string,
    payload: UpdateBillingPlanInput,
    accessToken: string
  ): Promise<BillingPlan> {
    const result = await platformRequest<BillingPlanResponse>(
      `${BASE}/${encodeURIComponent(planId)}`,
      accessToken,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      }
    );

    return result.plan;
  },

  async publish(
    planId: string,
    accessToken: string
  ): Promise<BillingPlan> {
    const result = await platformRequest<BillingPlanResponse>(
      `${BASE}/${encodeURIComponent(planId)}/publish`,
      accessToken,
      {
        method: "POST",
      }
    );

    return result.plan;
  },

  async retire(
    planId: string,
    accessToken: string
  ): Promise<BillingPlan> {
    const result = await platformRequest<BillingPlanResponse>(
      `${BASE}/${encodeURIComponent(planId)}/retire`,
      accessToken,
      {
        method: "POST",
      }
    );

    return result.plan;
  },

  async versions(
    planId: string,
    accessToken: string
  ): Promise<BillingPlanVersion[]> {
    const result = await platformRequest<{
      versions: BillingPlanVersion[];
    }>(
      `${BASE}/${encodeURIComponent(planId)}/versions`,
      accessToken
    );

    return result.versions;
  },
};
