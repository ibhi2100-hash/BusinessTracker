export const INSERT_CURRENT_BUSINESS = `
INSERT INTO current_business (
    id,
    businessId,
    businessName,
    businessCode,
    stage,
    status,
    databaseVersion,
    schemaVersion,
    lastSequenceNumber,
    initializedAt,
    activatedAt,
    lastOpenedAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
`;

export const FIND_CURRENT_BUSINESS = `
    SELECT *
    FROM current_business
    WHERE id = 1
    `;

export const UPDATE_CURRENT_BUSINESS = `
UPDATE current_business
SET
    businessId = ?,
    businessName = ?,
    businessCode = ?,
    stage = ?,
    status = ?,
    databaseVersion = ?,
    schemaVersion = ?,
    lastSequenceNumber = ?,
    initializedAt = ?,
    activatedAt = ?,
    lastOpenedAt = ?,
    updatedAt = ?
WHERE id = 1
`;

export const UPSERT_CURRENT_BUSINESS = `
INSERT INTO current_business (
    id,
    businessId,
    businessName,
    businessCode,
    stage,
    status,
    databaseVersion,
    schemaVersion,
    lastSequenceNumber,
    initializedAt,
    activatedAt,
    lastOpenedAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)
ON CONFLICT(id) DO UPDATE SET
    businessId = excluded.businessId,
    businessName = excluded.businessName,
    businessCode = excluded.businessCode,
    stage = excluded.stage,
    status = excluded.status,
    databaseVersion = excluded.databaseVersion,
    schemaVersion = excluded.schemaVersion,
    lastSequenceNumber = excluded.lastSequenceNumber,
    initializedAt = excluded.initializedAt,
    activatedAt = excluded.activatedAt,
    lastOpenedAt = excluded.lastOpenedAt,
    updatedAt = excluded.updatedAt
`;