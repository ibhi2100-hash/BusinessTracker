export const SAVE_SESSION =  `
            INSERT INTO sessions (

                id,
                userId,
                accessToken,
                refreshToken,
                expiresAt,
                createdAt

            )
            VALUES (

                ?,
                ?,
                ?,
                ?,
                ?,
                ?

            );
        `;
    
export const GET_CURRENT_SESSION = `
        SELECT *

        FROM sessions
    `

export const CLEAR_SESSION = `
                DELETE FROM sessions
            `
