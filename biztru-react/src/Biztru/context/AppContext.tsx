import {
    createContext,
    useContext,
} from "react";

import type { User } from "../../../../packages/shared-types/dist/entities/User";
import type { CurrentBusiness } from "../offline/sqlite/clientDatabase/repositories/CurrentBusiness/SQLiteCurrentBusinessRepository";
import type { Branch } from "../../types/branchTypes";

export type SessionStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated";

export interface ApplicationSessionState {
    status: SessionStatus;

    user: User | null;

    business: CurrentBusiness | null;

    branch: Branch | null;
}

export const ApplicationSessionContext =
    createContext<ApplicationSessionState | null>(null);

export function useApplicationSession(): ApplicationSessionState {
    const context =
        useContext(ApplicationSessionContext);

    if (!context) {
        throw new Error(
            "useApplicationSession must be used inside " +
            "ApplicationSessionProvider"
        );
    }

    return context;
}
