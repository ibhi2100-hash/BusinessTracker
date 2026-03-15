import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";

export async function saveSession(data: {
    userId: string;
    accessToken: string;
    expiresIn: number;
}){
    const expiresAt = Date.now() + data.expiresIn * 1000;
    
    await addRecord(TABLES.SESSION, {
        id: "active",
        userId: data.userId,
        accessToken: data.accessToken,
        expiresAt
    })
}