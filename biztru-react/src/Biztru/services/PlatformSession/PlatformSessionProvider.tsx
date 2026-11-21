
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

import {
  buildPlatformSession,
  mapPlatformAuthorizationResponse,
  mapPlatformLoginResponse,
} from "./Session.mapper";

/* -------------------------------------------------------------------------- */
/* CONFIGURATION                                                              */
/* -------------------------------------------------------------------------- */

const API_URL = (
  import.meta.env.VITE_API_URL ?? ""
).replace(/\/+$/, "");

const IDENTITY_ENDPOINT = `${API_URL}/platform/identity`;

const LOGIN_ENDPOINT = `${IDENTITY_ENDPOINT}/login`;
const REFRESH_ENDPOINT = `${IDENTITY_ENDPOINT}/refresh`;
const ME_ENDPOINT = `${IDENTITY_ENDPOINT}/me`;
const LOGOUT_ENDPOINT = `${IDENTITY_ENDPOINT}/logout`;

interface PlatformSessionProviderProps {
  children: ReactNode;
}

/* -------------------------------------------------------------------------- */
/* HTTP ERROR                                                                 */
/* -------------------------------------------------------------------------- */

class PlatformAuthError extends Error {
  public readonly statusCode: number;
  constructor(
    message: string,
    statusCode: number
  ) {
    super(message);
    this.name = "PlatformAuthError";
    this.statusCode = statusCode
  }
}

async function readResponse<T>(
  response: Response
): Promise<T> {
  const result: unknown = await response
    .json()
    .catch(() => null);

  if (!response.ok) {
    let message = "The platform authentication request failed.";

    if (
      result &&
      typeof result === "object" &&
      "message" in result &&
      typeof result.message === "string"
    ) {
      message = result.message;
    } else if (response.status === 401) {
      message = "Your platform session is invalid or has expired.";
    } else if (response.status === 403) {
      message = "Your account is not permitted to access the platform.";
    }

    throw new PlatformAuthError(message, response.status);
  }

  if (result === null) {
    throw new Error("The platform server returned an empty response.");
  }

  return result as T;
}

/* -------------------------------------------------------------------------- */
/* TOKEN REFRESH                                                              */
/* -------------------------------------------------------------------------- */

interface RefreshResponse {
  accessToken: string;
  expiresAt?: string;
}

async function requestNewAccessToken(): Promise<RefreshResponse> {
  const response = await fetch(REFRESH_ENDPOINT, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
  });

  const result = await readResponse<unknown>(response);

  if (
    !result ||
    typeof result !== "object" ||
    !("accessToken" in result) ||
    typeof result.accessToken !== "string"
  ) {
    throw new Error("The refresh endpoint returned an invalid access token.");
  }

  return {
    accessToken: result.accessToken,
    expiresAt:
      "expiresAt" in result &&
      typeof result.expiresAt === "string"
        ? result.expiresAt
        : undefined,
  };
}

/* -------------------------------------------------------------------------- */
/* AUTHORIZATION BOOTSTRAP                                                    */
/* -------------------------------------------------------------------------- */

async function requestMyAuthorization(
  accessToken: string
) {
  const response = await fetch(ME_ENDPOINT, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return readResponse<unknown>(response);
}

/* -------------------------------------------------------------------------- */
/* PROVIDER                                                                   */
/* -------------------------------------------------------------------------- */

export function PlatformSessionProvider({
  children,
}: PlatformSessionProviderProps) {
  const [session, setSession] =
    useState<PlatformSession>(EMPTY_PLATFORM_SESSION);

  const [status, setStatus] =
    useState<PlatformSessionStatus>("INITIALIZING");

  const [error, setError] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /* RESTORE SESSION                                                        */
  /* ---------------------------------------------------------------------- */

  const refreshSession = useCallback(async () => {
    if (!API_URL) {
      setSession(EMPTY_PLATFORM_SESSION);
      setStatus("ERROR");
      setError("VITE_API_URL is not configured.");
      return;
    }

    setStatus("LOADING");
    setError(null);

    try {
      // The refresh token is sent automatically through the HttpOnly cookie.
      const refreshed = await requestNewAccessToken();

      // Resolve the current user, roles and permissions from the backend.
      const authorizationResponse =
        await requestMyAuthorization(refreshed.accessToken);

      const authorization =
        mapPlatformAuthorizationResponse(authorizationResponse);

      if (authorization.user.status !== "ACTIVE") {
        throw new PlatformAuthError(
          "Your platform account is not active.",
          403
        );
      }

      const restoredSession: PlatformSession = {
        user: authorization.user,
        authorization: authorization.authorization,
        accessToken: refreshed.accessToken,
        expiresAt: refreshed.expiresAt ?? null,
      };

      setSession(restoredSession);
      setStatus("AUTHENTICATED");
    } catch (err) {
      setSession(EMPTY_PLATFORM_SESSION);

      const message =
        err instanceof Error
          ? err.message
          : "Unable to restore platform session.";

      setError(message);

      if (
        err instanceof PlatformAuthError &&
        (err.statusCode === 401 || err.statusCode === 403)
      ) {
        setStatus("UNAUTHENTICATED");
      } else {
        setStatus("ERROR");
      }
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* LOGIN                                                                  */
  /* ---------------------------------------------------------------------- */

  const login = useCallback(
    async (
      credentials: PlatformLoginCredentials
    ): Promise<PlatformSession> => {
      if (!API_URL) {
        throw new Error("VITE_API_URL is not configured.");
      }

      setStatus("LOADING");
      setError(null);

      try {
        const loginResponse = await fetch(LOGIN_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const loginPayload = mapPlatformLoginResponse(
          await readResponse<unknown>(loginResponse)
        );

        if (loginPayload.user.status !== "ACTIVE") {
          throw new PlatformAuthError(
            "Your platform account is not active.",
            403
          );
        }

        // Critical: login alone does not bootstrap authorization.
        // Call /me using the access token returned by login.
        const authorizationResponse =
          await requestMyAuthorization(loginPayload.accessToken);

        const authorizationPayload =
          mapPlatformAuthorizationResponse(authorizationResponse);

        const authenticatedSession = buildPlatformSession(
          loginPayload,
          authorizationPayload
        );

        setSession(authenticatedSession);
        setStatus("AUTHENTICATED");

        return authenticatedSession;
      } catch (err) {
        setSession(EMPTY_PLATFORM_SESSION);

        const message =
          err instanceof Error
            ? err.message
            : "Unable to sign in.";

        setError(message);

        if (
          err instanceof PlatformAuthError &&
          (err.statusCode === 401 || err.statusCode === 403)
        ) {
          setStatus("UNAUTHENTICATED");
        } else {
          setStatus("ERROR");
        }

        throw err;
      }
    },
    []
  );

  /* ---------------------------------------------------------------------- */
  /* LOGOUT                                                                 */
  /* ---------------------------------------------------------------------- */

  const logout = useCallback(async () => {
    try {
      if (API_URL) {
        await fetch(LOGOUT_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            ...(session.accessToken
              ? {
                  Authorization: `Bearer ${session.accessToken}`,
                }
              : {}),
          },
        });
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
    }
  }, [session.accessToken]);

  /* ---------------------------------------------------------------------- */
  /* INITIAL RESTORATION                                                    */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  /* ---------------------------------------------------------------------- */
  /* CONTEXT VALUE                                                          */
  /* ---------------------------------------------------------------------- */

  const value: PlatformSessionContextValue = {
    session,
    status,
    error,

    isAuthenticated:
      status === "AUTHENTICATED" &&
      session.user !== null &&
      session.user.status === "ACTIVE",

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
