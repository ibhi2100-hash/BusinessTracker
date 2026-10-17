import type {
  ProductImportField,
  ProductImportIssue,
  ProductImportRow,
  ProductImportSummary,
  ValidatedProductImportRow,
} from "@business/shared-types";

function addIssue(
  issues: ProductImportIssue[],
  rowNumber: number,
  code: string,
  severity: "ERROR" | "WARNING",
  message: string,
  field?: ProductImportField,
): void {
  issues.push({
    code,
    severity,
    message,
    rowNumber,
    ...(field ? { field } : {}),
  });
}

function normalizeIdentifier(value: string | null): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized || null;
}

function isValidMoney(value: number | null): boolean {
  return (
    value !== null &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function isValidWholeNumber(value: number | null): boolean {
  return (
    value !== null &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

export function validateProductRows(
  rows: ProductImportRow[],
): {
  results: ValidatedProductImportRow[];
  summary: ProductImportSummary;
} {
  const skuOccurrences = new Map<string, number[]>();
  const barcodeOccurrences = new Map<string, number[]>();

  // First pass: collect every occurrence so the first duplicate
  // is flagged as well as subsequent duplicates.
  for (const row of rows) {
    const sku = normalizeIdentifier(row.sku);
    const barcode = normalizeIdentifier(row.barcode);

    if (sku) {
      const occurrences = skuOccurrences.get(sku) ?? [];
      occurrences.push(row.rowNumber);
      skuOccurrences.set(sku, occurrences);
    }

    if (barcode) {
      const occurrences = barcodeOccurrences.get(barcode) ?? [];
      occurrences.push(row.rowNumber);
      barcodeOccurrences.set(barcode, occurrences);
    }
  }

  const results: ValidatedProductImportRow[] = rows.map((row) => {
    const issues: ProductImportIssue[] = [];

    // Required product name
    if (!row.name?.trim()) {
      addIssue(
        issues,
        row.rowNumber,
        "NAME_REQUIRED",
        "ERROR",
        "Product name is required.",
        "name",
      );
    }

    // Required selling price
    if (row.sellingPrice === null) {
      addIssue(
        issues,
        row.rowNumber,
        "SELLING_PRICE_REQUIRED",
        "ERROR",
        "Selling price is required.",
        "sellingPrice",
      );
    } else if (!isValidMoney(row.sellingPrice)) {
      addIssue(
        issues,
        row.rowNumber,
        "INVALID_SELLING_PRICE",
        "ERROR",
        "Selling price must be a finite, non-negative number.",
        "sellingPrice",
      );
    }

    // Required cost price
    if (row.costPrice === null) {
      addIssue(
        issues,
        row.rowNumber,
        "COST_PRICE_REQUIRED",
        "ERROR",
        "Cost price is required.",
        "costPrice",
      );
    } else if (!isValidMoney(row.costPrice)) {
      addIssue(
        issues,
        row.rowNumber,
        "INVALID_COST_PRICE",
        "ERROR",
        "Cost price must be a finite, non-negative number.",
        "costPrice",
      );
    }

    // Optional reorder level: if provided, it must be a whole number.
    if (
      row.reorderLevel !== null &&
      !isValidWholeNumber(row.reorderLevel)
    ) {
      addIssue(
        issues,
        row.rowNumber,
        "INVALID_REORDER_LEVEL",
        "ERROR",
        "Reorder level must be a non-negative whole number.",
        "reorderLevel",
      );
    }

    // Optional opening stock quantity.
    if (
      row.quantity !== null &&
      !isValidWholeNumber(row.quantity)
    ) {
      addIssue(
        issues,
        row.rowNumber,
        "INVALID_QUANTITY",
        "ERROR",
        "Opening stock quantity must be a non-negative whole number.",
        "quantity",
      );
    }

    // Duplicate SKU: flag every row containing the duplicate.
    const sku = normalizeIdentifier(row.sku);

    if (sku && (skuOccurrences.get(sku)?.length ?? 0) > 1) {
      addIssue(
        issues,
        row.rowNumber,
        "DUPLICATE_SKU_IN_FILE",
        "ERROR",
        `SKU "${row.sku}" appears more than once in this file.`,
        "sku",
      );
    }

    // Duplicate barcode: flag every row containing the duplicate.
    const barcode = normalizeIdentifier(row.barcode);

    if (
      barcode &&
      (barcodeOccurrences.get(barcode)?.length ?? 0) > 1
    ) {
      addIssue(
        issues,
        row.rowNumber,
        "DUPLICATE_BARCODE_IN_FILE",
        "ERROR",
        `Barcode "${row.barcode}" appears more than once in this file.`,
        "barcode",
      );
    }

    return {
      row,
      issues,
      valid: !issues.some((issue) => issue.severity === "ERROR"),
    };
  });

  const duplicateRowNumbers = new Set<number>();

  for (const result of results) {
    if (
      result.issues.some((issue) =>
        issue.code.startsWith("DUPLICATE_"),
      )
    ) {
      duplicateRowNumbers.add(result.row.rowNumber);
    }
  }

  const summary: ProductImportSummary = {
    totalRows: results.length,
    validRows: results.filter((result) => result.valid).length,
    invalidRows: results.filter((result) => !result.valid).length,
    warningRows: results.filter((result) =>
      result.issues.some((issue) => issue.severity === "WARNING"),
    ).length,
    duplicateRows: duplicateRowNumbers.size,
  };

  return { results, summary };
}