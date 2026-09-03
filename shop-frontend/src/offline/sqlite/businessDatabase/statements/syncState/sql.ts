export const GET_CURSOR = `
    SELECT cursor
    FROM sync_state
    WHERE stream = ?
`;

export const SET_CURSOR = `
    INSERT INTO sync_state (
        stream,
        cursor,
        updatedAt
    )
    VALUES (?, ?, ?)

    ON CONFLICT(stream)
    DO UPDATE SET
        cursor = excluded.cursor,
        updatedAt = excluded.updatedAt
`;

export const ADVANCE_CURSOR = `
    UPDATE sync_state
    SET
        cursor = ?,
        updatedAt = ?
    WHERE
        stream = ?
        AND cursor < ?
`;