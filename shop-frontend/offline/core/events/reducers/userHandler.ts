import { addRecord } from "@/offline/core/db/helpers";
import { getDb } from "@/offline/core/db/indexDB"
import { TABLES } from "@/offline/core/db/schema";

export const userHandlers = {
    async createUser(event: any){
        const db = await getDb();

        const { id, name, email, accessToken, expiresIn } = event.payload;

        await addRecord(TABLES.USER, {
            id,
            name,
            email,
            accessToken,
            expiresIn
        })
    }
}