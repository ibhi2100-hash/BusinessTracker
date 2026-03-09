import { useQuery } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscriptionService";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";
import { useEffect } from "react";
import { saveSubscription } from "@/lib/subscriptionHelpers";

export const useSubscription = () => {
  const setSubscription = useSubscriptionStore(
    (state) => state.setSubscription
  );

  const query = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await subscriptionService.getSubscription();
      const subscription = await res // must await

      return subscription;
    },
    staleTime: 1000 * 60 * 60 * 24 * 7
  });
useEffect(() => {
    if (query.data) {
        setSubscription(query.data);
        async()=> await saveSubscription(query.data)
    }
  }, [query.data]);

  return query; // THIS IS WHAT WAS MISSING
};