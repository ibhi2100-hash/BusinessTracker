import { useQuery } from "@tanstack/react-query";
import { useBranchStore } from "@/store/BranchStore";
import { BranchData } from "@/types/branchTypes";
import { useEffect } from "react";

const fetchBranchData = async (token: string): Promise<BranchData> => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business/branchdata`, {
        credentials: "include"
    });
    if(!res.ok) throw new Error("Failed to fetch branch data");
    return res.json();
};

export const useBranchData = ()=> {
    const {activeBranchId, branchTokens, branchData, setBranchData} = useBranchStore();

 const query = useQuery<BranchData, Error>({
    queryKey: ["branchData", activeBranchId],
    queryFn: ()=> fetchBranchData(branchTokens[activeBranchId!]),
    enabled: !!activeBranchId,
    initialData: ()=> (activeBranchId ?  branchData[activeBranchId] : undefined),

 });

 useEffect(()=> {
    if(!query.data || !activeBranchId) return;
    setBranchData(activeBranchId, query.data)
 },[activeBranchId, query.data])
}
