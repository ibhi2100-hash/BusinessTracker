
const API_URL = (
    import.meta.env.VITE_API_URL ?? ""
).replace(/\/+$/, "");

// ------------------------------------------
// PLATFORM API ERROR
// ------------------------------------------

export class PlatformApiError extends Error {
    public readonly statusCode: number;
    public readonly data?: unknown;
    constructor(
        message: string,
        statusCode: number,
        data?: unknown
    ) {
        super(message);
        this.name = "PlatformApiError";
        this.statusCode = statusCode;
        this.data = data
    }
}

// ------------------------------------------
// AUTHENTICATED PLATFORM REQUEST
// ------------------------------------------

export async function platformRequest<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
): Promise<T> {

    if (!accessToken?.trim()) {
        throw new PlatformApiError(
            "Platform authentication required.",
            401
        );
    }

    const headers = new Headers(options.headers);

    headers.set(
        "Authorization",
        `Bearer ${accessToken}`
    );

    headers.set("Accept", "application/json");

    if (
        options.body &&
        !(options.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers,
            credentials: "include",
        }
    );

    const data = await response
        .json()
        .catch(() => null);

    if (!response.ok) {
        throw new PlatformApiError(
            data?.message ??
                "Platform API request failed.",
            response.status,
            data
        );
    }

    return data as T;
}
