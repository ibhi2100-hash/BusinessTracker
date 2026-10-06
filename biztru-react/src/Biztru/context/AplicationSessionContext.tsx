import {
    createContext,
    useContext,
} from "react";

import type { User } from "../../../../packages/shared-types/dist/entities/User";

import type {
    Business,
    Branch,
} from "@business/shared-types";


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


export interface ApplicationSessionContextValue {

    session: ApplicationSessionState;

    /**
     * Reconstructs the current session from durable storage.
     *
     * The returned value is the freshly restored session.
     *
     * This is intentionally different from relying on the
     * `session` React state immediately after calling it because
     * React state updates are asynchronous.
     */
    refreshSession: () => Promise<ApplicationSessionState>;
}


export const ApplicationSessionContext =
    createContext<ApplicationSessionContextValue | null>(
        null
    );


export function useApplicationSession():
    ApplicationSessionContextValue {

    const context =
        useContext(
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