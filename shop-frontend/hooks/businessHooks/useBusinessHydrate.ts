   "use client"
  
  import { useEffect } from "react";
  import { getBusinessData } from "@/offline/db/helpers";
  import { useBranchStore } from "@/store/useBranchStore";
  import { useBusinessStore } from "@/store/businessStore";
  
  export const useHydrateBusinessData = () => {
    const setContext = useBranchStore((s)=> s.setContext)
    const activeBranchId = useBranchStore((s)=> s.activeBranchId)
    const setBusiness = useBusinessStore((s)=> s.setBusiness)

  useEffect(() => {
    
    const hydrate = async () => {

      const cached = await getBusinessData();
      const cachedData = cached[0]
      const branches = cachedData.branches;
      const branchId = activeBranchId ? branches[0]?.id : "";
      if (cached) {
        setContext({
          businessName: cachedData.business.name,
          branches,
          role: "ADMIN",
          activeBranchId: branchId
        });
        setBusiness(cachedData.business)
      }

    
    };
 
    hydrate();
  }, []);
}