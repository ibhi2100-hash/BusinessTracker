export interface BillingHttpRequest {
  params: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
  body: Record<string, unknown>;
  headers: Record<string, string | string[] | undefined>;
  user?: {
    id: string;
    businessId?: string;
    role?: string;
  };
  ip?: string;
  rawBody?: Buffer;
}

export interface BillingHttpResponse<T = unknown> {
  status: number;
  body: T;
}

export type BillingHandler = (
  request: BillingHttpRequest,
) => Promise<BillingHttpResponse>;

export function requireUser(request: BillingHttpRequest) {
  if (!request.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return request.user;
}

export function requireBusinessId(request: BillingHttpRequest) {
  const user = requireUser(request);

  if (!user.businessId) {
    throw new Error("BUSINESS_CONTEXT_REQUIRED");
  }

  return user.businessId;
}

export function requireParam(
  request: BillingHttpRequest,
  name: string,
) {
  const value = request.params[name];

  if (!value) {
    throw new Error(`Missing route parameter: ${name}`);
  }

  return value;
}

export function requireString(
  body: Record<string, unknown>,
  key: string,
) {
  const value = body[key];

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

export function requireBigInt(
  body: Record<string, unknown>,
  key: string,
) {
  const value = body[key];

  if (
    typeof value !== "string" &&
    typeof value !== "number" &&
    typeof value !== "bigint"
  ) {
    throw new Error(`${key} must be an integer amount`);
  }

  try {
    return BigInt(value);
  } catch {
    throw new Error(`${key} must be a valid integer amount`);
  }
}

export function success<T>(
  body: T,
  status = 200,
): BillingHttpResponse<T> {
  return { status, body };
}
