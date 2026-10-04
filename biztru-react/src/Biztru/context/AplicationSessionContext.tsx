import {
    createContext,
    useContext,
} from "react";

import type { User } from "../../../../packages/shared-types/dist/entities/User";
import type { Business, Branch } from "@business/shared-types";

export type SessionStatus =
    | "loading"
    | "authenticated"
    | "unauthenticated";

export interface ApplicationSessionState {
    status: SessionStatus;
    user: User | null;
    business: Business | null;
    branch: Branch | null;
}

export const ApplicationSessionContext =
    createContext<ApplicationSessionState | null>(null);

export function useApplicationSession(): ApplicationSessionState {
    const context = useContext(
        ApplicationSessionContext
    );

    if (!context) {
        throw new Error(
            "useApplicationSession must be used inside " +
            "ApplicationSessionProvider"
        );
    }

    return context;
}