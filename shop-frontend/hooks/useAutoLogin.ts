import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadUser } from "@/offline/user/loadUser";
import { loadSession } from "@/offline/session/sessionLoader";
import { loadBusiness } from "@/offline/business/businessLoader";
import { hydrateStores } from "@/offline/hydration/hydrationStore";
import { appBootstrap } from "@/offline/bootstrap/appBootstrap";
import { useBusinessStore } from "@/store/businessStore";


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

      if (session && user) {
        hydrateStores({
          user,
          accessToken: session.accessToken,
          expiresIn: session.expiresIn,
          business: business

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