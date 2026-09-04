import { authSession } from "@/src/services/refreshService";


export async function apiFetch(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<Response> {

    const accessToken =
        authSession.getAccessToken();


    const headers =
        new Headers(
            init.headers
        );


    headers.set(
        "Content-Type",
        "application/json"
    );


    if (accessToken) {

        headers.set(
            "Authorization",
            `Bearer ${accessToken}`
        );
    }


    let response =
        await fetch(
            input,
            {
                ...init,

                headers,

                credentials:
                    "include",
            }
        );


    /*
     * Access token expired.
     */
    if (
        response.status !== 401
    ) {

        return response;
    }


    /*
     * Ask backend for a new access token.
     *
     * The refreshToken is HttpOnly, so the browser
     * automatically sends it because credentials:
     * "include" is present.
     */

    const newAccessToken =
        await authSession.refresh();


    /*
     * Refresh failed.
     *
     * Session is genuinely expired.
     */

    if (!newAccessToken) {

        return response;
    }


    /*
     * Retry original request using
     * the newly rotated access token.
     */

    headers.set(
        "Authorization",
        `Bearer ${newAccessToken}`
    );


    return fetch(
        input,
        {
            ...init,

            headers,

            credentials:
                "include",
        }
    );
}
