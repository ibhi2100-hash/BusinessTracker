
// src/Biztru/services/PlatformSession/PlatformSessionProvider.tsx

import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  EMPTY_PLATFORM_SESSION,
  PlatformSessionContext,
} from "./PlatformSessionContext";

import type {
  PlatformSession,
  PlatformSessionContextValue,
  PlatformLoginCredentials,
  PlatformSessionStatus,
} from "./PlatformSessionContext";

/* ------------------------------------------------------------------ */
/* CONFIGURATION                                                       */
/* ------------------------------------------------------------------ */

const API_URL = (
  import.meta.env.VITE_API_URL ?? ""
).replace(/\/+$/, "");

const SESSION_STORAGE_KEY =
  "biztru.platform.session";

const LOGIN_ENDPOINT =
  `${API_URL}/api/platform/auth/login`;

const SESSION_ENDPOINT =
  `${API_URL}/api/platform/auth/session`;

const LOGOUT_ENDPOINT =
  `${API_URL}/api/platform/auth/logout`;

/* ------------------------------------------------------------------ */
/* PROPS                                                               */
/* ------------------------------------------------------------------ */

interface PlatformSessionProviderProps {
  children: ReactNode;
}

/* ------------------------------------------------------------------ */
/* HTTP ERROR                                                          */
/* ------------------------------------------------------------------ */

class PlatformAuthError extends Error {
  public readonly statusCode: number;

  constructor(
    message: string,
    statusCode: number
  ) {
    super(message);
    this.name = "PlatformAuthError";
    this.statusCode = statusCode;
  }
}

/* ------------------------------------------------------------------ */
/* SESSION VALIDATION                                                  */
/* ------------------------------------------------------------------ */

function isPlatformSession(
  value: unknown
): value is PlatformSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const session = value as Partial<PlatformSession>;
  const user = session.user;

  if (!user || typeof user !== "object") {
    return false;
  }

  const validRoles = [
    "FOUNDER",
    "PLATFORM_ADMIN",
    "BILLING_OPERATOR",
    "SUPPORT_OPERATOR",
    "SECURITY_ADMIN",
    "PLATFORM_ENGINEER",
    "PLATFORM_ANALYST",
  ];

  return Boolean(
    typeof session.sessionId === "string" &&
    session.sessionId.length > 0 &&
    typeof session.issuedAt === "string" &&
    typeof session.expiresAt === "string" &&
    typeof user.id === "string" &&
    user.id.length > 0 &&
    typeof user.email === "string" &&
    typeof user.displayName === "string" &&
    validRoles.includes(user.role) &&
    user.isActive === true &&
    Array.isArray(user.permissions) &&
    user.permissions.every(
      (permission: unknown) =>
        typeof permission === "string"
    )
  );
}

/* ------------------------------------------------------------------ */
/* SESSION STORAGE                                                     */
/* ------------------------------------------------------------------ */

function saveSessionSnapshot(
  session: PlatformSession
): void {
  try {
    sessionStorage.setItem(
      SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );
  } catch (error) {
    console.error(
      "[PlatformSession] Unable to save session snapshot:",
      error
    );
  }
}

function clearSessionSnapshot(): void {
  try {
    sessionStorage.removeItem(
      SESSION_STORAGE_KEY
    );
  } catch (error) {
    console.error(
      "[PlatformSession] Unable to clear session snapshot:",
      error
    );
  }
}

/* ------------------------------------------------------------------ */
/* HTTP RESPONSE HANDLING                                              */
/* ------------------------------------------------------------------ */

async function readResponse<T>(
  response: Response
): Promise<T> {
  const result: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    let message =
      "The platform authentication request failed.";

    if (
      result &&
      typeof result === "object" &&
      "message" in result &&
      typeof result.message === "string"
    ) {
      message = result.message;
    } else if (response.status === 401) {
      message =
        "Your platform session is invalid or has expired.";
    } else if (response.status === 403) {
      message =
        "Your account is not permitted to access the platform.";
    }

    throw new PlatformAuthError(
      message,
      response.status
    );
  }

  return result as T;
}

/* ------------------------------------------------------------------ */
/* PROVIDER                                                            */
/* ------------------------------------------------------------------ */

export function PlatformSessionProvider({
  children,
}: PlatformSessionProviderProps) {
  const [session, setSession] =
    useState<PlatformSession>(
      EMPTY_PLATFORM_SESSION
    );

  const [status, setStatus] =
    useState<PlatformSessionStatus>(
      "INITIALIZING"
    );

  const [error, setError] =
    useState<string | null>(null);

  /* -------------------------------------------------------------- */
  /* RESTORE SESSION                                                 */
  /* -------------------------------------------------------------- */

  const refreshSession = useCallback(async () => {
    setStatus("LOADING");
    setError(null);

    try {
      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      const response = await fetch(
        SESSION_ENDPOINT,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      const result =
        await readResponse<unknown>(response);

      if (!isPlatformSession(result)) {
        throw new Error(
          "The server returned an invalid platform session."
        );
      }

      setSession(result);
      saveSessionSnapshot(result);
      setStatus("AUTHENTICATED");
    } catch (err) {
      setSession(EMPTY_PLATFORM_SESSION);
      clearSessionSnapshot();

      const message =
        err instanceof Error
          ? err.message
          : "Unable to restore platform session.";

      setError(message);

      if (
        err instanceof PlatformAuthError &&
        err.statusCode === 401
      ) {
        setStatus("UNAUTHENTICATED");
      } else if (
        err instanceof PlatformAuthError &&
        err.statusCode === 403
      ) {
        setStatus("UNAUTHENTICATED");
      } else {
        setStatus("ERROR");
      }
    }
  }, []);

  /* -------------------------------------------------------------- */
  /* LOGIN                                                           */
  /* -------------------------------------------------------------- */

  const login = useCallback(
    async (
      credentials: PlatformLoginCredentials
    ): Promise<PlatformSession> => {
      if (!API_URL) {
        throw new Error(
          "VITE_API_URL is not configured."
        );
      }

      setError(null);

      const response = await fetch(
        LOGIN_ENDPOINT,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(credentials),
        }
      );

      const result =
        await readResponse<unknown>(response);

      if (!isPlatformSession(result)) {
        throw new Error(
          "Login response is missing valid platform session data."
        );
      }

      setSession(result);
      saveSessionSnapshot(result);
      setStatus("AUTHENTICATED");

      return result;
    },
    []
  );

  /* -------------------------------------------------------------- */
  /* LOGOUT                                                          */
  /* -------------------------------------------------------------- */

  const logout = useCallback(async () => {
    try {
      if (API_URL) {
        const response = await fetch(
          LOGOUT_ENDPOINT,
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "[PlatformSession] Server logout returned:",
            response.status
          );
        }
      }
    } catch (err) {
      console.error(
        "[PlatformSession] Logout request failed:",
        err
      );
    } finally {
      setSession(EMPTY_PLATFORM_SESSION);
      setStatus("UNAUTHENTICATED");
      setError(null);
      clearSessionSnapshot();
    }
  }, []);

  /* -------------------------------------------------------------- */
  /* INITIAL SESSION RESTORATION                                     */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  /* -------------------------------------------------------------- */
  /* CONTEXT VALUE                                                   */
  /* -------------------------------------------------------------- */

  const value: PlatformSessionContextValue = {
    session,
    status,
    error,

    isAuthenticated:
      status === "AUTHENTICATED" &&
      session.user !== null,

    login,
    refreshSession,
    logout,
  };

  return (
    <PlatformSessionContext.Provider value={value}>
      {children}
    </PlatformSessionContext.Provider>
  );
}
