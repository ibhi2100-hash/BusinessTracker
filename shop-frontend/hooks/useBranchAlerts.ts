import { useQuery } from "@tanstack/react-query";
import { getBranchAlerts } from "@/services/alerts.service";
import { useAlertStore } from "@/store/alertStore";
import { Alert } from "@/types/branchAlertsTypes";
import { useEffect } from "react";

export const useBranchAlerts = (branchId?: string) => {
  const setAlerts = useAlertStore((s) => s.setAlerts);

  const query = useQuery <Alert[], Error > ({
    queryKey: ["alerts", branchId],
    queryFn:  () => getBranchAlerts(branchId!),
    enabled: !!branchId,
    staleTime: 60_000 ,
  });

  // push data into Zustand store 
  useEffect(()=>{
    if(!query.data || !branchId) return;
    setAlerts(branchId, query.data)
  }, [query.data, setAlerts, branchId])

  return query;
};