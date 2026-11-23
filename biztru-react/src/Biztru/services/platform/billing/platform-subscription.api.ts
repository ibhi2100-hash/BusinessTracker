
import type {
  PlatformSubscription,
  PlatformBillingMetrics,
} from "../../../../types/billing/platform-billing.types";

import { platformRequest } from "../platformApiClient"; 

const BASE = "/platform/billing/subscriptions";

export const platformSubscriptionApi = {
  async list(accessToken: string): Promise<PlatformSubscription[]> {
    const result = await platformRequest<{
      subscriptions: PlatformSubscription[];
    }>(BASE, accessToken);

    return result.subscriptions;
  },

  async getMetrics(
    accessToken: string
  ): Promise<PlatformBillingMetrics> {
    const result = await platformRequest<{
      metrics: PlatformBillingMetrics;
    }>(`${BASE}/metrics`, accessToken);

    return result.metrics;
  },

  async get(
    id: string,
    accessToken: string
  ): Promise<PlatformSubscription> {
    const result = await platformRequest<{
      subscription: PlatformSubscription;
    }>(
      `${BASE}/${encodeURIComponent(id)}`,
      accessToken
    );

    return result.subscription;
  },

  async suspend(
    id: string,
    reason: string,
    accessToken: string
  ): Promise<void> {
    await platformRequest<unknown>(
      `${BASE}/${encodeURIComponent(id)}/suspend`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },

  async reactivate(
    id: string,
    reason: string,
    accessToken: string
  ): Promise<void> {
    await platformRequest<unknown>(
      `${BASE}/${encodeURIComponent(id)}/reactivate`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ reason }),
      }
    );
  },
};
