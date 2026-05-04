"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BusinessEventTypes } from "@/offline/core/events/eventGroups/businessEvents";
import { eventService } from "@/src/services/eventService";
import { useBusinessStore } from "@/src/store/businessStore";
import { useRouter } from "next/navigation";  
import { useState } from "react";
import { toast } from "sonner";


export const ActivateBusinessButton = () => {
  const [ loading, setLoading] = useState(false);
  const businessFromStore = useBusinessStore((state) => state.business);
  const router = useRouter()
  const [canActivate, setCanActivate] = useState()


  const handleActivate = async () => {
    setLoading(true)
    eventService.create({
      type: BusinessEventTypes.BUSINESS_ACTIVATION,
      mode: "OPENING",
      payload: ""
    })
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