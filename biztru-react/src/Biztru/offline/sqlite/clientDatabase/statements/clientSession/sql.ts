export const INSERT_CURRENT_SESSION = `
INSERT INTO client_session (
    id,
    userId,
    createdAt,
    lastAuthenticatedAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?
)
`;

export const FIND_CURRENT_SESSION = `
SELECT *
FROM client_session
WHERE id = 1
`;

export const UPDATE_CURRENT_SESSION = `
UPDATE client_session
SET
    userId = ?,
    createdAt = ?,
    lastAuthenticatedAt = ?,
    updatedAt = ?
WHERE id = 1
`;

export const UPSERT_CURRENT_SESSION = `
INSERT INTO client_session (
    id,
    userId,
    createdAt,
    lastAuthenticatedAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?
)
ON CONFLICT(id) DO UPDATE SET
    userId = excluded.userId,
    createdAt = excluded.createdAt,
    lastAuthenticatedAt = excluded.lastAuthenticatedAt,
    updatedAt = excluded.updatedAt
`;

export const DELETE_CURRENT_SESSION = `
DELETE
FROM client_session
WHERE id = 1
`;