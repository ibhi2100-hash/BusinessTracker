import { addRecord } from "../db/helpers";
import { TABLES } from "../db/schema";


export async function saveBusiness(business: any){
    await addRecord(TABLES.BUSINESS, {
        ...business,
        timestamp: Date.now()
    })
}