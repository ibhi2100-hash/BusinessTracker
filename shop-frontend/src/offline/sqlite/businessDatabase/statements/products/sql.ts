export const PRODUCT_UPSERT = `
INSERT INTO products (
    id,
    businessId,
    branchId,
    name,
    imageUrl,
    description,
    costPrice,
    price,
    category,
    reorderLevel,
    isActive,
    isDeleted,
    createdAt,
    updatedAt,
    deletedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)

ON CONFLICT(id)
DO UPDATE SET
    businessId = excluded.businessId,
    branchId = excluded.branchId,
    name = excluded.name,
    imageUrl = excluded.imageUrl,
    description = excluded.description,
    costPrice = excluded.costPrice,
    price = excluded.price,
    category = excluded.category,
    reorderLevel = excluded.reorderLevel,
    isActive = excluded.isActive,
    isDeleted = excluded.isDeleted,
    updatedAt = excluded.updatedAt,
    deletedAt = excluded.deletedAt
`;

export const FIND_BY_ID = `
SELECT *
FROM products
WHERE id = ?
LIMIT 1
`;

export const PRODUCT_DELETE = `
DELETE FROM products
WHERE id = ?
`;