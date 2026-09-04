import { authSession } from "./refreshService";

async function restoreSession() {

    const accessToken =
        await authSession.refresh();


    if (!accessToken) {

        /*
         * No valid refresh session.
         */

        return false;
    }


    /*
     * Access token is now available
     * to the rest of the application.
     */

    return true;
}
