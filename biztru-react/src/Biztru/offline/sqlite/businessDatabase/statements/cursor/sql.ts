export const ENSURE_SYNC_CURSOR = `
    INSERT INTO sync_cursor (
        stream,
        cursor,
        updatedAt
    )
    VALUES (?, ?, ?)
    ON CONFLICT(stream) DO NOTHING;
`;

export const GET_SYNC_CURSOR = `
    SELECT
        stream,
        cursor,
        updatedAt
    FROM sync_cursor
    WHERE stream = ?
    LIMIT 1;
`;

export const ADVANCE_SYNC_CURSOR = `
    UPDATE sync_cursor
    SET cursor = ?,
        updatedAt = ?
    WHERE stream = ?
      AND CAST(cursor AS INTEGER) <= CAST(? AS INTEGER);
`;