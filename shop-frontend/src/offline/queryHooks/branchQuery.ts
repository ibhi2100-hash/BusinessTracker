import { getDB } from "../sqlite/database/db";

export async function useBranches() {
    const db = getDB();

    const result = db.query(

        `
        SELECT *
        FROM branches
        LIMIT 1
        `

    );

    return result

}