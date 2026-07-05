import { getDB } from "../sqlite/database/db";

export async function useReports() {
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