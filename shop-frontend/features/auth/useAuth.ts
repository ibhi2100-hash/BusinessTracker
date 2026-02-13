"use client"
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export  const useAuth = ()=> {
    return useQuery({
        queryKey: ["me"],
        queryFn: async ()=> {
            const res = await apiClient.get("auth/me");
            return res.data;
        }
    })
}