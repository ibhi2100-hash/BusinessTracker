import { apiClient } from "@/lib/api-client";

export const getDashboardSummary = async () => {
    const res = await apiClient.get("reports");
    return res.data;
};

export const getBranchPerformance = async ()=> {
    const res = await apiClient.get('reports/branch-performance');
    return res.data;
}