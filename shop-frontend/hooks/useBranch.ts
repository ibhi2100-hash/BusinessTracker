import { useQuery } from "@tanstack/react-query";
import { useBranchStore } from "@/store/BranchStore";
import { BranchData } from "@/types/branchTypes";

const fetchBranchData = async (token: string): Promise<BranchData> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business/branchdata`, {
        credentials: "include"
    });
    if(!res.ok) throw new Error("Failed to fetch branch data");
    return res.json();
};

export const useBranchData = ()=> {
    const {activeBranchId, branchTokens, branchData, setBranchData} = useBranchStore();

    return useQuery<BranchData, Error>(
        ["branchData", activeBranchId],
        ()=> fetchBranchData(branchTokens[activeBranchId!]),
        {
            enable: !!activeBranchId,
            initialData: ()=> (activeBranchId ?  branchData[activeBranchId] : undefined),
            onSuccess: (data) => {
                if(activeBranchId) setBranchData(activeBranchId, data);
            }
        }
    )
}