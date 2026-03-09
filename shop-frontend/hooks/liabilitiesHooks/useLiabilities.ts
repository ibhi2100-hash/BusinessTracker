import { useQuery } from "@tanstack/react-query";
import { Liability } from "@/types/liability";
import { useEffect } from "react";

export const useLiabilities = ()=> {
    const query = useQuery({
        queryKey: ["liabilities"],
        queryFn: async ()=> {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/liability`, {
                method: "GET",
                credentials: "include", // REQUIRED for cookies
            });

            if (!res.ok) {
                throw new Error("Failed to fetch business status");
            }
        return res.json();
    }
}
)

return query;
}