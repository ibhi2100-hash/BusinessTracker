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
    businessId = ?,
    branchId = ?,
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

/*
 * Business projection
 *
 * Used when a business-related event changes
 * the business associated with the user.
 */
export const UPDATE_USER_BUSINESS = `
UPDATE users
SET
    businessId = ?,
    version = ?,
    lastEventId = ?,
    updatedAt = ?
WHERE id = ?
`;

/*
 * Branch projection
 *
 * Used when a branch-related event changes
 * the branch associated with the user.
 */
export const UPDATE_USER_BRANCH = `
UPDATE users
SET
    branchId = ?,
    version = ?,
    lastEventId = ?,
    updatedAt = ?
WHERE id = ?
`;

/*
 * Activation projection
 *
 * Used when the user's activation state changes.
 */
export const UPDATE_USER_ACTIVATION = `
UPDATE users
SET
    isActive = ?,
    version = ?,
    lastEventId = ?,
    updatedAt = ?
WHERE id = ?
`;

/*
 * Onboarding projection
 *
 * Used when the user's onboarding state changes.
 */
export const UPDATE_USER_ONBOARDING = `
UPDATE users
SET
    onboardingCompleted = ?,
    version = ?,
    lastEventId = ?,
    updatedAt = ?
WHERE id = ?
`;

/*
 * Optional identity/profile projection
 *
 * Useful for events that change the user's
 * name, email, or role without touching
 * business/branch state.
 */
export const UPDATE_USER_PROFILE = `
UPDATE users
SET
    name = ?,
    email = ?,
    role = ?,
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