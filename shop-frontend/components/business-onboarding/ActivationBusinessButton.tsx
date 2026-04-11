"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBusinessStore } from "@/store/businessStore";
import { useRouter } from "next/navigation";
import { useBusinessStatusStore} from '@/store/useBusinessStatusStore';   
import { useState } from "react";
import { businessService } from "@/services/business/businessService";
import { toast } from "sonner";


export const ActivateBusinessButton = () => {
  const [ loading, setLoading] = useState(false);
  const businessFromStore = useBusinessStore((state) => state.business);
  const canActivate = useBusinessStatusStore.getState().canActivate;
  const router = useRouter()


  const handleActivate = async () => {
    setLoading(true)
    if (!canActivate ) return;
    await businessService.activateMyBusiness()
    toast.success("Business Activated✅")
    setLoading(false)

    if(!businessFromStore.isOnboarding && businessFromStore.status === "ACTIVE") {
      router.push("/dashboard")
    };
    router.push('/dashboard')


   
  };

  return (
    <Card className="space-y-4">
      <Button
        disabled={!canActivate}
        onClick={handleActivate}
        className="w-full rounded-xl"
      >
        {loading ? "Activating..." : "🚀 Start Business"}
      </Button>

      {!canActivate && (
        <p className="text-xs text-center text-gray-500">
          Complete all setup steps before activation.
        </p>
      )}
    </Card>
  );
};