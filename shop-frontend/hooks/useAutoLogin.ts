import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadUser } from "@/offline/user/loadUser";
import { loadSession } from "@/offline/session/sessionLoader";
import { loadBusiness } from "@/offline/business/businessLoader";
import { hydrateStores } from "@/offline/hydration/hydrationStore";
import { loadBranches } from "@/offline/business/loadbranches";
import { useBusinessStore } from "@/store/businessStore";
import { id } from "zod/v4/locales";


export function useAutoLogin() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const session = await loadSession();
      const user = await loadUser();
      const business = await loadBusiness();

      if(!session || !user || !business){
        setChecking(false);
        return;
      }
      // Load Branches for this business
      const branches = await loadBranches(business.id);
      const activeBranchId = branches[0]?.id;

      if (session && user) {
        hydrateStores({
          user,
          accessToken: session.accessToken,
          expiresIn: session.expiresIn,
          business,
          branches,
          activeBranchId

        });

        //read business after hyration
        const businessFromStore = useBusinessStore.getState().business;
        if(businessFromStore?.isOnboarding)(
            router.replace("/onboard")
        )
        else{
        router.replace("/dashboard");
        }
      }

      setChecking(false);
    }

    checkSession();
  }, []);

  return checking;
}