// domain/inventory/inventoryKey.ts

export type InventoryKeyParts = {
  productId: string;
  branchId: string;
};

/**
 * Creates a deterministic aggregate key for inventory.
 * Used for event sourcing, projections, and reducers.
 */
export function inventoryKey(
  productId: string,
  branchId: string
): string {
  if (!productId || !branchId) {
    throw new Error("inventoryKey requires productId and branchId");
  }

  return `${productId}_${branchId}`;
}

/**
 * Safe object-based variant (preferred for clarity in services)
 */
export function inventoryKeyFromObject({
  productId,
  branchId,
}: InventoryKeyParts): string {
  return inventoryKey(productId, branchId);
}

/**
 * Parses an inventory key back into its components.
 * Useful in reducers/debugging.
 */
export function parseInventoryKey(key: string): InventoryKeyParts {
  const [productId, branchId] = key.split("_");

  if (!productId || !branchId) {
    throw new Error(`Invalid inventory key: ${key}`);
  }

  return { productId, branchId };
}