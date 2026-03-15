import { useQuery } from "@tanstack/react-query";


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
  
  return query;
};