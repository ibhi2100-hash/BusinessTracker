import { Business } from "@business/shared-types";
import { StorageClient } from "../sqlite/bus/StorageBus";

export async function useBusiness() {
    const db = new StorageClient();

    const result = await db.query<Business>(

        `
        SELECT *
        FROM businesses
        LIMIT 1
        `

    );

    return result[0]

}