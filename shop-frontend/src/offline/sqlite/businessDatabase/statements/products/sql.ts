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

export const PRODUCTS = 
`
      SELECT
        p.id,
        p.name,
        p.price,
        p.costPrice,
        p.category,
        p.imageUrl,
        p.isActive,
        p.branchId,
        COALESCE(i.quantity, 0) AS quantity
      FROM products p
      LEFT JOIN inventories i
        ON i.productId = p.id
       AND i.branchId = ?
      WHERE p.isDeleted = 0
        AND p.isActive = 1
        AND (p.branchId = ? OR p.branchId IS NULL)
      ORDER BY p.name ASC
    `