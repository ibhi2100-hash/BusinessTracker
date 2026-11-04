// hooks/useLiveSyncManagement.ts

import { useCallback } from "react";

import { useApplication } from "../Biztru/services/ApplicationService/ApplicationContext"; 
import { useLiveQuery } from "./useLiveQuery";

export function useLiveCursor() {

    const app = useApplication();

    const query = useCallback(async (): Promise<string> => {

        return app.syncService.getCursor();

    }, [app]);

    return useLiveQuery<string>(
        [
            "sync_state",
            "sync_activities",
            "conflicts",
            "outbox",
        ],
        query,
        "0"
    );
}