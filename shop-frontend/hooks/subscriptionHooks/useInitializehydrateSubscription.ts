"use client"

import { useEffect } from "react";

import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";

export const useInitializeSubscription = () => {
  const setSubscription = useSubscriptionStore(
    (state) => state.setSubscription
  );

  useEffect(() => {
    
    const hydrate = async () => {
      const cached = [];

      if (cached) {
        setSubscription(cached);
      }
    };

    hydrate();
  }, []);
};