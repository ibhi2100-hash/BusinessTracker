export const INVENTORY_UPSERT = `
INSERT INTO inventories (
    id,
    productId,
    branchId,
    businessId,
    quantity,
    costPrice,
    createdAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?
)

ON CONFLICT(id)
DO UPDATE SET
    productId = excluded.productId,
    branchId = excluded.branchId,
    businessId = excluded.businessId,
    quantity = excluded.quantity,
    costPrice = excluded.costPrice,
    updatedAt = excluded.updatedAt
`;

export const FIND_BY_ID = `
SELECT *
FROM inventories
WHERE id = ?
LIMIT 1
`;

