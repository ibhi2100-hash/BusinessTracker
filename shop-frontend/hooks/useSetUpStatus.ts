import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";


export const useOnboardingStatus = () => {
  const query = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/setup-status`, {
        credentials: "include"
      });
      return res.json();
    }
  });

  return query;

};