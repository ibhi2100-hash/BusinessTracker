// hooks/useRepayLiability.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { RepayLiabilityInput } from "@/types/liability";

export const useRepayLiability = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      liabilityId,
      payload,
    }: {
      liabilityId: string;
      payload: RepayLiabilityInput;
    }) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/liability/${liabilityId}/repay`,{
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ payload }),
      }
      );
      if(!res.ok) throw new Error(" Failed to Post Liability")
    }, 
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liabilities"] });
    },
  });
};