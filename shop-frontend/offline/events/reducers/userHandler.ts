import { addRecord } from "@/offline/db/helpers";
import { getDb } from "@/offline/db/indexDB"
import { TABLES } from "@/offline/db/schema";

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