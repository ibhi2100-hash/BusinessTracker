
// src/Biztru/services/PlatformSession/PlatformSessionContext.ts

import {
  createContext,
  useContext,
} from "react";

/* ------------------------------------------------------------------ */
/* PLATFORM ROLES                                                     */
/* ------------------------------------------------------------------ */

export type PlatformRole =
  | "FOUNDER"
  | "PLATFORM_ADMIN"
  | "BILLING_OPERATOR"
  | "SUPPORT_OPERATOR"
  | "SECURITY_ADMIN"
  | "PLATFORM_ENGINEER"
  | "PLATFORM_ANALYST";

/* ------------------------------------------------------------------ */
/* PLATFORM PERMISSIONS                                               */
/* ------------------------------------------------------------------ */

export type PlatformPermission = string;

/* ------------------------------------------------------------------ */
/* PLATFORM USER                                                      */
/* ------------------------------------------------------------------ */

export interface PlatformUser {
  id: string;
  email: string;
  displayName: string;
  role: PlatformRole;
  permissions: readonly PlatformPermission[];
  isActive: boolean;
}

/* ------------------------------------------------------------------ */
/* PLATFORM SESSION                                                   */
/* ------------------------------------------------------------------ */

export interface PlatformSession {
  user: PlatformUser | null;
  sessionId: string | null;
  issuedAt: string | null;
  accessToken?: string | null;
  expiresAt: string | null;
}

/* ------------------------------------------------------------------ */
/* LOGIN CREDENTIALS                                                  */
/* ------------------------------------------------------------------ */

export interface PlatformLoginCredentials {
  email: string;
  password: string;
}

/* ------------------------------------------------------------------ */
/* SESSION STATUS                                                     */
/* ------------------------------------------------------------------ */

export type PlatformSessionStatus =
  | "LOADING"
  | "INITIALIZING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "ERROR";

/* ------------------------------------------------------------------ */
/* SESSION CONTEXT                                                    */
/* ------------------------------------------------------------------ */

export interface PlatformSessionContextValue {
  session: PlatformSession;

  status: PlatformSessionStatus;

  error: string | null;

  isAuthenticated: boolean;

  login: (
    credentials: PlatformLoginCredentials
  ) => Promise<PlatformSession>;

  refreshSession: () => Promise<void>;

  logout: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/* EMPTY SESSION                                                      */
/* ------------------------------------------------------------------ */

export const EMPTY_PLATFORM_SESSION: PlatformSession = {
  user: null,
  sessionId: null,
  issuedAt: null,
  accessToken: null,
  expiresAt: null,
};

/* ------------------------------------------------------------------ */
/* DEFAULT CONTEXT                                                    */
/* ------------------------------------------------------------------ */

const DEFAULT_PLATFORM_SESSION: PlatformSessionContextValue = {
  session: EMPTY_PLATFORM_SESSION,

  status: "INITIALIZING",

  error: null,

  isAuthenticated: false,

  login: async () => {
    throw new Error(
      "PlatformSessionProvider is not mounted."
    );
  },

  refreshSession: async () => {},

  logout: async () => {},
};

/* ------------------------------------------------------------------ */
/* CONTEXT                                                            */
/* ------------------------------------------------------------------ */

export const PlatformSessionContext =
  createContext<PlatformSessionContextValue>(
    DEFAULT_PLATFORM_SESSION
  );

/* ------------------------------------------------------------------ */
/* HOOK                                                               */
/* ------------------------------------------------------------------ */

export function usePlatformSession() {
  return useContext(PlatformSessionContext);
}
