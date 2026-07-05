import { getDB } from "../sqlite/database/db";

export async function useSales() {
    const db = getDB();

    const result = db.query(

        `
        SELECT *
        FROM businesses
        LIMIT 1
        `

    );

    return result

}