import { useQuery } from "@tanstack/react-query";

export function useTest() {
  return useQuery({
    queryKey: ["test"],
    queryFn: async () => {
      return { message: "React Query Working" };
    },
  });
}
