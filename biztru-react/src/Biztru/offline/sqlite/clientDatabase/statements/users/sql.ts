export const INSERT_USER = `
INSERT INTO users (
    id,
    businessId,
    branchId,
    name,
    email,
    role,
    onboardingCompleted,
    isActive,
    version,
    lastEventId,
    createdAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
`;

export const FIND_BY_ID = `
SELECT *
FROM users
WHERE id = ?
`;

export const UPDATE_USER = `
UPDATE users
SET
    name = ?,
    email = ?,
    role = ?,
    onboardingCompleted = ?,
    isActive = ?,
    version = ?,
    lastEventId = ?,
    updatedAt = ?
WHERE id = ?
`;

export const DELETE_USER = `
DELETE
FROM users
WHERE id = ?
`;