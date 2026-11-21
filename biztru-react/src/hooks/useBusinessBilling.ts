
import { useCallback, useEffect } from "react";

import { businessBillingApi } from "../../services/business/billing/business-billing.api";

import { useBusinessBillingStore } from "../store/useBusinessBillingStore";

export function useBusinessBilling() {
  const plans = useBusinessBillingStore((s) => s.plans);
  const subscription = useBusinessBillingStore((s) => s.subscription);
  const loading = useBusinessBillingStore((s) => s.loading);
  const isOffline = useBusinessBillingStore((s) => s.isOffline);

  const setPlans = useBusinessBillingStore((s) => s.setPlans);
  const setSubscription = useBusinessBillingStore((s) => s.setSubscription);
  const setOffline = useBusinessBillingStore((s) => s.setOffline);
  const setLoading = useBusinessBillingStore((s) => s.setLoading);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);

      const catalogue =
        await businessBillingApi.getCatalogue();

      setPlans(catalogue.plans, catalogue.revision);
      setOffline(false);

      const current =
        await businessBillingApi.getMySubscription();

      setSubscription(current);
    } catch {
      setOffline(true);
    } finally {
      setLoading(false);
    }
  }, [
    setLoading,
    setPlans,
    setOffline,
    setSubscription,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    plans,
    subscription,
    loading,
    isOffline,
    refresh,
  };
}
