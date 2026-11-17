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
    sku,
    barcode,
    reorderLevel,
    isActive,
    isDeleted,
    createdAt,
    updatedAt,
    deletedAt
)
VALUES (
    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
    sku = excluded.sku,
    barcode = excluded.barcode,
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

export const PRODUCTS = `
  SELECT
    p.id,
    p.name,
    p.price,
    p.costPrice,
    p.category,
    p.sku,
    p.barcode,
    p.imageUrl,
    p.isActive,
    p.branchId,
    COALESCE(i.quantity, 0) AS quantity
  FROM products p
  LEFT JOIN inventories i
    ON i.productId = p.id
   AND i.branchId = ?
   AND i.businessId = ?
  WHERE p.businessId = ?
    AND p.isDeleted = 0
    AND p.isActive = 1
  ORDER BY p.name ASC
`;

/**
 * Retrieves the complete active product catalogue for a business.
 *
 * Includes:
 * - Products assigned to existing branches.
 * - Products not yet assigned to any branch (branchId IS NULL).
 *
 * Does not filter by branch because this is a business-wide catalogue.
 */
export const PRODUCTS_BY_BUSINESS = `
  SELECT
    p.id,
    p.businessId,
    p.branchId,
    p.name,
    p.price,
    p.costPrice,
    p.category,
    p.sku,
    p.barcode,
    p.imageUrl,
    p.description,
    p.reorderLevel,
    p.isActive
  FROM products p
  WHERE p.businessId = ?
    AND p.isDeleted = 0
    AND p.isActive = 1
  ORDER BY p.name ASC
`;