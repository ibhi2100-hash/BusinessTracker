
type RefreshResponse = {
    accessToken: string;
    accessExpiresIn: number;
    user?: unknown;
};


class AuthSession {

    private accessToken: string | null = null;

    private refreshPromise:
        Promise<string | null> | null = null;


    setAccessToken(
        token: string
    ) {
        this.accessToken = token;
    }


    getAccessToken() {
        return this.accessToken;
    }


    clear() {
        this.accessToken = null;
    }


    async refresh():
        Promise<string | null> {

        /*
         * Prevent multiple simultaneous refreshes.
         *
         * If 10 requests receive 401 at the same time,
         * only ONE refresh request is sent.
         */

        if (this.refreshPromise) {
            return this.refreshPromise;
        }


        this.refreshPromise =
            this.performRefresh();


        try {

            return await this.refreshPromise;

        } finally {

            this.refreshPromise = null;
        }
    }


    private async performRefresh():
        Promise<string | null> {

        const response =
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                {
                    method: "POST",

                    credentials: "include",
                }
            );


        if (!response.ok) {

            this.clear();

            return null;
        }


        const result:
            RefreshResponse =
            await response.json();


        this.setAccessToken(
            result.accessToken
        );


        return result.accessToken;
    }
}


export const authSession =
    new AuthSession();

