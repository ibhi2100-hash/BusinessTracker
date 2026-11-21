
import type {
  PlatformSubscription,
  PlatformBillingMetrics,
} from "../../../types/billing/platform-billing.types";

const BASE_URL = "/api/platform/billing/subscriptions";

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
    throw new Error(data.message || "Platform billing request failed");
  }

  return data as T;
}

export const platformSubscriptionApi = {
  async list(): Promise<PlatformSubscription[]> {
    const result = await request<{
      subscriptions: PlatformSubscription[];
    }>("");

    return result.subscriptions;
  },

  async getMetrics(): Promise<PlatformBillingMetrics> {
    const result = await request<{
      metrics: PlatformBillingMetrics;
    }>("/metrics");

    return result.metrics;
  },

  async get(id: string): Promise<PlatformSubscription> {
    const result = await request<{
      subscription: PlatformSubscription;
    }>(`/${encodeURIComponent(id)}`);

    return result.subscription;
  },

  async suspend(id: string, reason: string): Promise<void> {
    await request(`/${encodeURIComponent(id)}/suspend`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  async reactivate(id: string, reason: string): Promise<void> {
    await request(`/${encodeURIComponent(id)}/reactivate`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
