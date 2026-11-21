
import {
  createContext,
  useContext,
} from "react";

export type PlatformRole = string;
export type PlatformPermission = string;

export type PlatformUserStatus =
  | "ACTIVE"
  | "INVITED"
  | "SUSPENDED"
  | "DISABLED";

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  status: PlatformUserStatus;
}

export interface PlatformAssignedRole {
  id: string;
  code: PlatformRole;
  name: string;
}

export interface PlatformAuthorization {
  roles: PlatformAssignedRole[];
  permissions: PlatformPermission[];
}

export interface PlatformSession {
  user: PlatformUser | null;
  authorization: PlatformAuthorization;
  accessToken: string | null;
  expiresAt: string | null;
}

export interface PlatformLoginCredentials {
  email: string;
  password: string;
}

export type PlatformSessionStatus =
  | "LOADING"
  | "INITIALIZING"
  | "AUTHENTICATED"
  | "UNAUTHENTICATED"
  | "ERROR";

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

export const EMPTY_PLATFORM_AUTHORIZATION: PlatformAuthorization = {
  roles: [],
  permissions: [],
};

export const EMPTY_PLATFORM_SESSION: PlatformSession = {
  user: null,
  authorization: EMPTY_PLATFORM_AUTHORIZATION,
  accessToken: null,
  expiresAt: null,
};

const DEFAULT_PLATFORM_SESSION: PlatformSessionContextValue = {
  session: EMPTY_PLATFORM_SESSION,
  status: "INITIALIZING",
  error: null,
  isAuthenticated: false,

  login: async () => {
    throw new Error("PlatformSessionProvider is not mounted.");
  },

  refreshSession: async () => {},
  logout: async () => {},
};

export const PlatformSessionContext =
  createContext<PlatformSessionContextValue>(
    DEFAULT_PLATFORM_SESSION
  );

export function usePlatformSession() {
  return useContext(PlatformSessionContext);
}
