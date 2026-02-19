import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBranchStore } from "@/store/useBranchStore";

export const useBusinessContext = () => {
  const setContext = useBranchStore((s) => s.setContext);

  const query = useQuery({
    queryKey: ["business-context"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/business/context`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to load context");
      const data = res.json()
      return data
    },
  });

  useEffect(() => {
    if (query.data) {
      const { user, business, branches }= query.data
      setContext({
        businessName: business.name,
        branches: branches,
        role: user.role,
      });
    }
  }, [query.data, setContext]);

  return query;
};
