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
 * These request shapes match the calls already used in InventoryPage.
 * Product and stock writes still go through the application APIs.
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
      reorderLevel: number| null;
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
 * Stage 1: parse, auto-map, and validate the uploaded file.
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
 * Stage 2: apply the user's selected mapping to the original raw rows.
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
 * Stage 3: create products and optional opening stock.
 *
 * Existing products are not updated by this implementation.
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

  const totalOperations = rows.reduce((total, item) => {
    const quantity = item.row.quantity;

    return total + 1 + (quantity !== null && quantity > 0 ? 1 : 0);
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
    const hasOpeningStock =
      row.quantity !== null && row.quantity > 0;

    // Defensive checks: the validator should already enforce these.
    if (
      !row.name?.trim() ||
      row.sellingPrice === null ||
      row.costPrice === null ||
      !Number.isFinite(row.sellingPrice) ||
      !Number.isFinite(row.costPrice) ||
      row.sellingPrice < 0 ||
      row.costPrice < 0
    ) {
      failedOperations += 1;
      completedOperations += 1;

      // If stock was planned, it cannot proceed without its product.
      if (hasOpeningStock) {
        failedOperations += 1;
        completedOperations += 1;
      }

      report(
        "CREATING_PRODUCTS",
        `Row ${row.rowNumber} is missing valid product data. ${
          hasOpeningStock
            ? "Its stock operation was skipped."
            : ""
        }`,
      );

      continue;
    }

    const productId = crypto.randomUUID();

    report("CREATING_PRODUCTS");

    try {
      await app.product.create({
        id: productId,
        name: row.name.trim(),
        price: row.sellingPrice,
        costPrice: row.costPrice,
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

      // Count the planned stock operation as failed/skipped too,
      // otherwise progress would never reach totalOperations.
      if (hasOpeningStock) {
        failedOperations += 1;
        completedOperations += 1;
      }

      report(
        "CREATING_PRODUCTS",
        `Product creation failed on row ${row.rowNumber}. ${
          hasOpeningStock
            ? "Its stock operation was skipped."
            : ""
        } ${error instanceof Error ? error.message : "Unknown error"}`,
      );

      continue;
    }

    if (!hasOpeningStock) {
      continue;
    }

    // The product exists, so create its opening stock.
    report("CREATING_STOCK");

    try {
      await app.inventory.createStock({
        id: inventoryKey(productId, branchId),
        productId,
        quantity: row.quantity!,
        costPrice: row.costPrice,
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
        `Product "${row.name}" was created, but stock creation failed. ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    }
  }

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
