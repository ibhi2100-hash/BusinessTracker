// hooks/useBusinessStatus.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { useBusinessStore, Business } from "@/store/businessStore";
import { useEffect } from "react";

export const useBusinessStatus = () => {
  const setBusiness = useBusinessStore((state) => state.setBusiness);

  const query =  useQuery<Business>({
    queryKey: ["business-status"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/status`, {
        method: "GET",
        credentials: "include", // REQUIRED for cookies
      });

      if (!res.ok) {
        throw new Error("Failed to fetch business status");
      }

      return res.json();
    },
    staleTime: Infinity
    
  });

  useEffect(()=> {
    if(!query.data) return;
    setBusiness(query.data)
  }, [query.data, setBusiness]);
  return query
};