import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBranchStore } from "@/store/useBranchStore";

// Define the types for context
interface BusinessContext {
  user: {
    id: string;
    role: string;
  };
  business: {
    id: string;
    name: string;
  };
  branches: { id: string; name: string }[];
}

export const useBusinessContext = () => {
  const setContext = useBranchStore((s) => s.setContext);
  const activeBranchId = useBranchStore((s) => s.activeBranchId); // get current active branch if needed

  const query = useQuery<BusinessContext, Error>({
    queryKey: ["business-context"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/business/context`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load context");
      const data = (await res.json()) as BusinessContext;
      return data;
    },
    staleTime: 1000 * 60 * 5, // cache 5 minutes
  });

  useEffect(() => {
    if (query.data) {
      const { user, business, branches } = query.data;
      if (!business) return;

    const branchId = activeBranchId ?? branches[0]?.id ?? "";
      setContext({
        businessName: business.name,
        branches,
        role: "ADMIN",
        activeBranchId: branchId, // this will either come from store or you can pick the first branch: branches[0]?.id
      });
    }
  }, [query.data, setContext, activeBranchId]);

  return query;
};