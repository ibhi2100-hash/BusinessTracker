import { use } from "react";
import { setupStatusCalculation } from "./setupStatusCalculator";
import { useBusinessStatusStore } from "@/store/useBusinessStatusStore";

export const hydrateSetupStore = async ()=> {
    const status = await setupStatusCalculation();
    useBusinessStatusStore.getState().setSteps(status.steps);
    useBusinessStatusStore.getState().setPercentage(status.percentage);
    useBusinessStatusStore.getState().setCanActivate(status.canActivate);
    useBusinessStatusStore.getState().setIsHydrated(true);
}