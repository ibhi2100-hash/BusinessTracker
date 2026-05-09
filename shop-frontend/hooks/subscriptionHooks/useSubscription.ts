import { useQuery } from "@tanstack/react-query";
import { useSubscriptionStore } from "@/src/store/useSubscriptionStore";
import { useEffect } from "react";

export const useSubscription = () => {
  const setSubscription = useSubscriptionStore(
    (state) => state.setSubscription
  );

  const query = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = [];
      const subscription = await res // must await

      return subscription;
    },
    staleTime: 1000 * 60 * 60 * 24 * 7
  });
useEffect(() => {
    if (query.data) {
        setSubscription(query.data);
        async()=> console.log(query.data)
    }
  }, [query.data]);

  return query; // THIS IS WHAT WAS MISSING
};