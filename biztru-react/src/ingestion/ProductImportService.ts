
import type {
  ProductImportRow,
  ProductImportSource,
  ProductImportSummary,
  ValidatedProductImportRow,
} from "@business/shared-types";

import type { ProductImportMapping } from "../components/inventory/import/ImportMappingStep";
import type {
  PreparedProductImport,
  ProductImportProgressUpdate,
  ProductImportResult,
  ProductImportValidation,
} from "../components/inventory/dialogs/ProductImportSheet";

import { parseProductFile } from "./parsers/ProductFileParser";
import { mapProductFile } from "./mapping/ProductFileMapper";
import { validateProductRows } from "./validation/ProductImportValidator";
import { inventoryKey } from "../Biztru/utils/keygenerator";

export type InventoryMode = "OPENING" | "LIVE";

export interface ExecuteProductImportArgs {
  branchId: string;
  mode: InventoryMode;
  rows: ValidatedProductImportRow[];
}

/**
 * Product and inventory application APIs.
 *
 * Inventory aggregates are created whenever quantity is provided,
 * including when quantity is exactly zero.
 */
export interface ProductImportApplication {
  product: {
    create(request: {
      id: string;
      name: string;
      price: number;
      costPrice: number;
      description: string | null;
      sku: string | null;
      barcode: string | null;
      reorderLevel: number | null;
      imageUrl: string | null;
      category: string | null;
      mode: InventoryMode;
    }): Promise<unknown>;
  };

  inventory: {
    createStock(request: {
      id: string;
      productId: string;
      quantity: number;
      costPrice: number;
      mode: InventoryMode;
    }): Promise<unknown>;
  };
}

function emitProgress(
  callback:
    | ((update: ProductImportProgressUpdate) => void)
    | undefined,
  update: ProductImportProgressUpdate,
): void {
  callback?.(update);
}

function toProductImportMapping(
  mapping: Record<string, string | null>,
): ProductImportMapping {
  return {
    name: mapping.name ?? null,
    sku: mapping.sku ?? null,
    barcode: mapping.barcode ?? null,
    costPrice: mapping.costPrice ?? null,
    sellingPrice: mapping.sellingPrice ?? null,
    category: mapping.category ?? null,
    description: mapping.description ?? null,
    reorderLevel: mapping.reorderLevel ?? null,
    quantity: mapping.quantity ?? null,
  };
}

/**
 * Stage 1: Parse, auto-map, and validate the uploaded file.
 */
export async function prepareProductImportFile(
  file: File,
): Promise<PreparedProductImport> {
  const parsed = await parseProductFile(file);
  const mapped = mapProductFile(parsed);
  const validation = validateProductRows(mapped.rows);

  return {
    source: parsed.source,
    headers: parsed.headers,
    rows: mapped.rows,
    mapping: toProductImportMapping(mapped.mapping),
    results: validation.results,
    summary: validation.summary,
  };
}

/**
 * Stage 2: Apply the user's selected mapping to the original raw rows.
 */
export function validateProductImportRows(args: {
  rows: ProductImportRow[];
  mapping: ProductImportMapping;
  source: ProductImportSource;
}): ProductImportValidation {
  const { rows, mapping, source } = args;

  if (rows.length === 0) {
    const summary: ProductImportSummary = {
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      warningRows: 0,
      duplicateRows: 0,
    };

    return {
      results: [],
      summary,
    };
  }

  const headers = [
    ...new Set(rows.flatMap((row) => Object.keys(row.raw))),
  ];

  const remapped = mapProductFile(
    {
      source,
      headers,
      rows: rows.map((row) => row.raw),
    },
    mapping,
  );

  const validation = validateProductRows(remapped.rows);

  return {
    results: validation.results,
    summary: validation.summary,
  };
}

/**
 * Stage 3: Create products and optional inventory aggregates.
 *
 * Rules:
 * - Existing products are not updated.
 * - Quantity > 0 creates an inventory aggregate.
 * - Quantity === 0 also creates an inventory aggregate.
 * - Quantity === null skips inventory aggregate creation.
 * - Invalid quantities are rejected.
 *
 * Each successful product creation is followed by its inventory
 * aggregate creation when a quantity was provided.
 */
export async function executeProductImport(
  app: ProductImportApplication,
  args: ExecuteProductImportArgs,
  onProgress?: (
    update: ProductImportProgressUpdate,
  ) => void,
): Promise<ProductImportResult> {
  const { branchId, mode, rows } = args;

  if (!branchId.trim()) {
    throw new Error(
      "Select an active branch before importing products.",
    );
  }

  if (rows.some((item) => !item.valid)) {
    throw new Error(
      "The import contains invalid rows. Correct the validation errors before importing.",
    );
  }

  /**
   * IMPORTANT:
   * Check for null, NOT quantity > 0.
   *
   * A quantity of zero still requires an inventory aggregate.
   */
  const totalOperations = rows.reduce((total, item) => {
    const hasInventoryRecord = item.row.quantity !== null;

    return total + 1 + (hasInventoryRecord ? 1 : 0);
  }, 0);

  let completedOperations = 0;
  let createdProducts = 0;
  let createdStock = 0;
  let failedOperations = 0;

  const report = (
    phase: ProductImportProgressUpdate["phase"],
    errorMessage?: string,
  ) => {
    emitProgress(onProgress, {
      phase,
      totalOperations,
      completedOperations,
      createdProducts,
      updatedProducts: 0,
      createdStock,
      failedOperations,
      errorMessage: errorMessage ?? null,
    });
  };

  report("PREPARING");

  for (const item of rows) {
    const row = item.row;

    /**
     * An inventory aggregate must be created whenever quantity
     * is explicitly provided, including quantity = 0.
     */
    const hasInventoryRecord = row.quantity !== null;

    const productName = row.name?.trim() ?? "";

    /**
     * Defensive product validation.
     */
    const validProduct =
      Boolean(productName) &&
      row.sellingPrice !== null &&
      row.costPrice !== null &&
      Number.isFinite(row.sellingPrice) &&
      Number.isFinite(row.costPrice) &&
      row.sellingPrice >= 0 &&
      row.costPrice >= 0;

    /**
     * Defensive inventory quantity validation.
     *
     * Zero is valid.
     * Negative, NaN, and Infinity are invalid.
     * Null means no inventory aggregate is requested.
     */
    const validQuantity =
      row.quantity === null ||
      (
        Number.isFinite(row.quantity) &&
        row.quantity >= 0
      );

    if (!validProduct || !validQuantity) {
      const invalidOperations =
        1 + (hasInventoryRecord ? 1 : 0);

      failedOperations += invalidOperations;
      completedOperations += invalidOperations;

      report(
        "CREATING_PRODUCTS",
        `Row ${row.rowNumber} contains invalid product or inventory data. ${
          hasInventoryRecord
            ? "Product and inventory creation were skipped."
            : "Product creation was skipped."
        }`,
      );

      continue;
    }

    const productId = crypto.randomUUID();

    /**
     * STEP 1: Create product.
     */
    report("CREATING_PRODUCTS");

    try {
      await app.product.create({
        id: productId,
        name: productName,
        price: row.sellingPrice!,
        costPrice: row.costPrice!,
        description: row.description,
        sku: row.sku,
        barcode: row.barcode,
        reorderLevel: row.reorderLevel,
        imageUrl: null,
        category: row.category,
        mode,
      });

      createdProducts += 1;
      completedOperations += 1;

      report("CREATING_PRODUCTS");
    } catch (error) {
      failedOperations += 1;
      completedOperations += 1;

      /**
       * If product creation fails, its inventory aggregate
       * cannot be created.
       *
       * Count the skipped operation so progress remains accurate.
       */
      if (hasInventoryRecord) {
        failedOperations += 1;
        completedOperations += 1;
      }

      report(
        "CREATING_PRODUCTS",
        `Product creation failed on row ${row.rowNumber}. ${
          hasInventoryRecord
            ? "Its inventory aggregate was skipped."
            : ""
        } ${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`,
      );

      continue;
    }

    /**
     * STEP 2: Create inventory aggregate.
     *
     * Do not skip this operation when quantity is zero.
     */
    if (!hasInventoryRecord) {
      continue;
    }

    report("CREATING_STOCK");

    try {
      await app.inventory.createStock({
        id: inventoryKey(productId, branchId),
        productId,
        quantity: row.quantity!,
        costPrice: row.costPrice!,
        mode,
      });

      createdStock += 1;
      completedOperations += 1;

      report("CREATING_STOCK");
    } catch (error) {
      failedOperations += 1;
      completedOperations += 1;

      report(
        "CREATING_STOCK",
        `Product "${row.name}" was created, but its inventory aggregate creation failed. ${
          error instanceof Error
            ? error.message
            : "Unknown error"
        }`,
      );
    }
  }

  /**
   * STEP 3: Finalize.
   */
  report("FINALIZING");

  const result: ProductImportResult = {
    totalOperations,
    createdProducts,
    updatedProducts: 0,
    createdStock,
    failedOperations,
  };

  report(
    failedOperations > 0 ? "FAILED" : "COMPLETED",
    failedOperations > 0
      ? `${failedOperations} operation(s) failed or were skipped. Some writes may already have committed.`
      : undefined,
  );

  return result;
}
