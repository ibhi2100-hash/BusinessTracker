import { tr } from "zod/v4/locales";
import { dbPromise } from "../indexDB/idb";

export async function syncQueue(){
    const db = await dbPromise;
    const queue = await db.getAll("syncQueue");

    for(const item of queue){
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sale/create`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type" : "application/json"},
                body: JSON.stringify(item.payload) 
            })

            await db.delete("syncQueue", item.id)
        } catch (error) {
            console.log("sync failed")
        }
    }
}