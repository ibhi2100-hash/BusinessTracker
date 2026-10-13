
import {
  type ProductImportField,
  type ProductImportRow,
  type ProductImportSource,
    FIELD_ALIASES
} from "@business/shared-types"

import type { ParsedProductFile } from "../parsers,/ProductFileParser";



function normalizeHeader(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanText(value: unknown): string | null {
  if (value == null) return null;

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}

function parseNumber(value: unknown): number | null {
  if (value == null || String(value).trim() === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value).trim();

  // Accept common currency prefixes and suffixes.
  // Ambiguous number formats should be reviewed by the user.
  text = text
    .replace(/^[₦$€£]\s*/u, "")
    .replace(/\s*[₦$€£]$/u, "")
    .replace(/,/g, "");

  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return null;
  }

  const parsed = Number(text);

  return Number.isFinite(parsed) ? parsed : null;
}

function resolveHeaders(
  headers: string[],
): Partial<Record<ProductImportField, string>> {
  const normalized = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  const result: Partial<Record<ProductImportField, string>> = {};

  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [
    ProductImportField,
    string[],
  ][]) {
    const accepted = new Set(aliases.map(normalizeHeader));

    const match = normalized.find((header) =>
      accepted.has(header.normalized),
    );

    if (match) {
      result[field] = match.original;
    }
  }

  return result;
}

export interface MappedProductFile {
  source: ProductImportSource;
  rows: ProductImportRow[];
  mapping: Partial<Record<ProductImportField, string>>;
  unmappedHeaders: string[];
}

export function mapProductFile(
  parsed: ParsedProductFile,
): MappedProductFile {
  const mapping = resolveHeaders(parsed.headers);

  const usedHeaders = new Set(Object.values(mapping));
  const unmappedHeaders = parsed.headers.filter(
    (header) => !usedHeaders.has(header),
  );

  const rows = parsed.rows.map((raw, index): ProductImportRow => {
    const get = (field: ProductImportField): unknown => {
      const header = mapping[field];

      return header ? raw[header] : null;
    };

    return {
      rowNumber: index + 2,
      name: cleanText(get("name")),
      sku: cleanText(get("sku")),
      barcode: cleanText(get("barcode")),
      costPrice: parseNumber(get("costPrice")),
      sellingPrice: parseNumber(get("sellingPrice")),
      category: cleanText(get("category")),
      description: cleanText(get("description")),
      reorderLevel: parseNumber(get("reorderLevel")),
      quantity: parseNumber(get("quantity")),
      source: parsed.source,
      raw,
    };
  });

  return {
    source: parsed.source,
    rows,
    mapping,
    unmappedHeaders,
  };
}