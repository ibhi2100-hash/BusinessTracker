// hooks/useLiveEmployees.ts

import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext";

import { useLiveQuery } from "./useLiveQuery";
import type { ApplicationSessionState } from "../Biztru/context/AplicationSessionContext";

export function useLiveAuth() {
  const app = useApplication();

  const query = useCallback(
    async (): Promise<ApplicationSessionState | null> => {
    
      // Replace this with the actual employee read contract.
      return await app.session.restore()
    },
    [app]
  );

  return useLiveQuery<ApplicationSessionState | null>(
    ["auth"],
    query,
    null
  );
}
