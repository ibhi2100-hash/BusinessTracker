export const GET_CURRENT_CONTEXT = `
        SELECT

            u.id                  AS actorId,
            u.email               AS email,
            u.role                AS role,

            s.id                  AS sessionId,

            d.deviceId            AS deviceId,

            cb.businessId         AS businessId

        FROM device d

        LEFT JOIN sessions s
        ON 1 = 1

        LEFT JOIN users u
        ON u.id = s.userId

        LEFT JOIN current_business cb
        ON 1 = 1

        LIMIT 1;
        `;