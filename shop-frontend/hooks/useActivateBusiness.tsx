import { useMutation, useQueryClient } from "@tanstack/react-query";
import { on } from "events";

export const useActivateBusiness = () => {
    const queryClient = useQueryClient();
    
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URl}/business/activate`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return res.json();
    },
    onSuccess(data, variables, onMutateResult, context) {
        
    },
  });
  
};