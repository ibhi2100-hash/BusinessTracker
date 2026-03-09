import { dbPromise } from "@/lib/indexDB/idb";

export async function saveSaleOffline(sale: any) {
    const db = await dbPromise;

    await db.put("sales", {
        ...sale,
        synced: false
    })

    await db.add("synchQueue", {
        type: "CREATE_SALE",
        payload: sale
    })
}