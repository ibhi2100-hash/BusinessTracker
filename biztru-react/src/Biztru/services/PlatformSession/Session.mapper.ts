
import type {
  PlatformAuthorization,
  PlatformAssignedRole,
  PlatformSession,
  PlatformUser,
  PlatformUserStatus,
} from "./PlatformSessionContext";

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function unwrapResponse(
  value: unknown
): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error("Invalid response from platform server.");
  }

  let result = value;

  if (isRecord(result.data)) {
    result = result.data;
  }

  return result;
}

function mapUser(value: unknown): PlatformUser {
  if (!isRecord(value)) {
    throw new Error("The server did not return a valid platform user.");
  }

  const { id, name, email, status } = value;

  const validStatuses: PlatformUserStatus[] = [
    "ACTIVE",
    "INVITED",
    "SUSPENDED",
    "DISABLED",
  ];

  if (
    typeof id !== "string" ||
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof status !== "string" ||
    !validStatuses.includes(status as PlatformUserStatus)
  ) {
    throw new Error("The platform user response is incomplete or invalid.");
  }

  return {
    id,
    name,
    email,
    status: status as PlatformUserStatus,
  };
}

function mapRoles(value: unknown): PlatformAssignedRole[] {
  if (!Array.isArray(value)) {
    throw new Error("The server returned invalid platform roles.");
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.code !== "string" ||
      typeof item.name !== "string"
    ) {
      throw new Error("The server returned an invalid role assignment.");
    }

    return {
      id: item.id,
      code: item.code,
      name: item.name,
    };
  });
}

function mapPermissions(value: unknown): string[] {
  if (
    !Array.isArray(value) ||
    !value.every((permission) => typeof permission === "string")
  ) {
    throw new Error("The server returned invalid platform permissions.");
  }

  return [...new Set(value)];
}

export interface PlatformLoginResponse {
  user: PlatformUser;
  accessToken: string;
  expiresAt: string | null;
}

export interface PlatformAuthorizationResponse {
  user: PlatformUser;
  authorization: PlatformAuthorization;
}

export function mapPlatformLoginResponse(
  response: unknown
): PlatformLoginResponse {
  const result = unwrapResponse(response);

  if (typeof result.accessToken !== "string") {
    throw new Error("Login response does not contain an access token.");
  }

  return {
    user: mapUser(result.user),
    accessToken: result.accessToken,
    expiresAt:
      typeof result.expiresAt === "string"
        ? result.expiresAt
        : null,
  };
}

export function mapPlatformAuthorizationResponse(
  response: unknown
): PlatformAuthorizationResponse {
  const result = unwrapResponse(response);

  if (!isRecord(result.authorization)) {
    throw new Error("The server did not return platform authorization.");
  }

  return {
    user: mapUser(result.user),
    authorization: {
      roles: mapRoles(result.authorization.roles),
      permissions: mapPermissions(
        result.authorization.permissions
      ),
    },
  };
}

export function buildPlatformSession(
  login: PlatformLoginResponse,
  authorization: PlatformAuthorizationResponse
): PlatformSession {
  if (login.user.id !== authorization.user.id) {
    throw new Error(
      "The authenticated user does not match the authorization user."
    );
  }

  if (authorization.user.status !== "ACTIVE") {
    throw new Error("Your platform account is not active.");
  }

  return {
    user: authorization.user,
    authorization: authorization.authorization,
    accessToken: login.accessToken,
    expiresAt: login.expiresAt,
  };
}
