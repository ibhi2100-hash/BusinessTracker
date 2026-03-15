   "use client"
  
  import { useEffect } from "react";
  import { useBranchStore } from "@/store/useBranchStore";
  import { useBusinessStore } from "@/store/businessStore";
import { getAll} from "@/offline/db/helpers";
import { TABLES } from "@/offline/db/schema";
  
  export const useHydrateBusinessData = () => {
    const setContext = useBranchStore((s)=> s.setContext)
    const activeBranchId = useBranchStore((s)=> s.activeBranchId)
    const setBusiness = useBusinessStore((s)=> s.setBusiness)
    

  useEffect(() => {
    
    const hydrate = async () => {
       const getBusinessData = async()=> { await getAll(TABLES.BUSINESSDATA)
       };
      const cached = getBusinessData();
      const cachedData = cached[0]
      const branches = cachedData?.branches;
      const branchId = activeBranchId ? branches[0]?.id : "";
      if (cached) {
        setContext({
          businessName: cachedData?.business.name,
          branches,
          role: "ADMIN",
          activeBranchId: branchId
        });
        setBusiness(cachedData?.business)
      }

    
    };
 
    hydrate();
  }, []);
}