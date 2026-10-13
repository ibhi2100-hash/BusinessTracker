
import type {
  ProductImportField,
  ProductImportIssue,
  ProductImportRow,
  ProductImportSummary,
  ValidatedProductImportRow,
} from "@business/shared-types";

function addIssue(
  issues: ProductImportIssue[],
  row: ProductImportRow,
  code: string,
  severity: "ERROR" | "WARNING",
  message: string,
  field?: ProductImportField,
): void {
  issues.push({
    code,
    severity,
    message,
    rowNumber: row.rowNumber,
    ...(field ? { field } : {}),
  });
}

function normalizeIdentifier(value: string | null): string | null {
  const normalized = value?.trim().toLocaleLowerCase("en");

  return normalized || null;
}

export function validateProductRows(
  rows: ProductImportRow[],
): {
  results: ValidatedProductImportRow[];
  summary: ProductImportSummary;
} {
  const seenSkus = new Map<string, number>();
  const seenBarcodes = new Map<string, number>();

  const results = rows.map((row) => {
    const issues: ProductImportIssue[] = [];

    if (!row.name) {
      addIssue(
        issues,
        row,
        "PRODUCT_NAME_REQUIRED",
        "ERROR",
        "Product name is required.",
        "name",
      );
    }

    if (row.sellingPrice == null) {
      addIssue(
        issues,
        row,
        "SELLING_PRICE_REQUIRED",
        "ERROR",
        "Selling price is missing or is not a valid number.",
        "sellingPrice",
      );
    } else if (row.sellingPrice < 0) {
      addIssue(
        issues,
        row,
        "SELLING_PRICE_NEGATIVE",
        "ERROR",
        "Selling price cannot be negative.",
        "sellingPrice",
      );
    }

    if (row.costPrice == null) {
      addIssue(
        issues,
        row,
        "COST_PRICE_REQUIRED",
        "ERROR",
        "Cost price is missing or is not a valid number.",
        "costPrice",
      );
    } else if (row.costPrice < 0) {
      addIssue(
        issues,
        row,
        "COST_PRICE_NEGATIVE",
        "ERROR",
        "Cost price cannot be negative.",
        "costPrice",
      );
    }

    if (
      row.reorderLevel != null &&
      row.reorderLevel < 0
    ) {
      addIssue(
        issues,
        row,
        "REORDER_LEVEL_NEGATIVE",
        "ERROR",
        "Reorder level cannot be negative.",
        "reorderLevel",
      );
    }

    if (row.quantity != null && row.quantity < 0) {
      addIssue(
        issues,
        row,
        "QUANTITY_NEGATIVE",
        "ERROR",
        "Opening quantity cannot be negative.",
        "quantity",
      );
    }

    const sku = normalizeIdentifier(row.sku);
    const barcode = normalizeIdentifier(row.barcode);

    if (sku) {
      const previousRow = seenSkus.get(sku);

      if (previousRow != null) {
        addIssue(
          issues,
          row,
          "DUPLICATE_SKU_IN_FILE",
          "ERROR",
          `SKU duplicates row ${previousRow} in this file.`,
          "sku",
        );
      } else {
        seenSkus.set(sku, row.rowNumber);
      }
    }

    if (barcode) {
      const previousRow = seenBarcodes.get(barcode);

      if (previousRow != null) {
        addIssue(
          issues,
          row,
          "DUPLICATE_BARCODE_IN_FILE",
          "ERROR",
          `Barcode duplicates row ${previousRow} in this file.`,
          "barcode",
        );
      } else {
        seenBarcodes.set(barcode, row.rowNumber);
      }
    }

    return {
      row,
      issues,
      valid: !issues.some((issue) => issue.severity === "ERROR"),
    };
  });

  const summary: ProductImportSummary = {
    totalRows: results.length,
    validRows: results.filter((result) => result.valid).length,
    invalidRows: results.filter((result) => !result.valid).length,
    warningRows: results.filter((result) =>
      result.issues.some((issue) => issue.severity === "WARNING"),
    ).length,
    duplicateRows: results.filter((result) =>
      result.issues.some((issue) =>
        issue.code.startsWith("DUPLICATE_"),
      ),
    ).length,
  };

  return { results, summary };
}