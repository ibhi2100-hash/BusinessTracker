import { getRecord } from "../db/helpers";
import { TABLES } from "../db/schema";

export async function loadSession() {
    const session = await getRecord(TABLES.SESSION, "active")

    if(!session) return;

    if(Date.now() > session.expiresAt) {
        return null;
    }
    return session;
}