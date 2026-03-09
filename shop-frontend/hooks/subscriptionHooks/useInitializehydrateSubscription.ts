"use client"

import { useEffect } from "react";
import { getSubscriptionCache } from "@/lib/subscriptionHelpers";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export const useInitializeSubscription = () => {
  const setSubscription = useSubscriptionStore(
    (state) => state.setSubscription
  );

  useEffect(() => {
    
    const hydrate = async () => {
      const cached = await getSubscriptionCache();

      if (cached) {
        setSubscription(cached);
      }
    };

    hydrate();
  }, []);
};