export const SALES_UPSERT = `
INSERT INTO sales (
    id,
    businessId,
    branchId,
    productId,
    quantity,
    price,
    costPrice,
    total,
    createdAt,
    updatedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
)

ON CONFLICT(id)
DO UPDATE SET
    businessId = excluded.businessId,
    branchId = excluded.branchId,
    productId = excluded.productId,
    quantity = excluded.quantity,
    price = excluded.price,
    costPrice = excluded.costPrice,
    total = excluded.total,
    updatedAt = excluded.updatedAt
`;

export const FIND_BY_ID = `
SELECT *
FROM sales
WHERE id = ?
LIMIT 1
`;