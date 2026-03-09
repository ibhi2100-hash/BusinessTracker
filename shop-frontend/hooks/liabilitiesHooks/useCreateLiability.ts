// hooks/useCreateLiability.ts

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CreateLiabilityInput } from "@/types/liability";

export const useCreateLiability = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLiabilityInput) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/liability`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({ input }),
            });
            if(!res.ok) throw new Error("Failed to Add Liability");

            return res.json
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["liabilities"] });
    },
  });
};