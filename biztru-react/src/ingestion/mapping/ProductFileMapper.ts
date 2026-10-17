
import type {
  ProductImportField,
  ProductImportRow,
  ProductImportSource,
} from "@business/shared-types";

import { FIELD_ALIASES } from "@business/shared-types";

import type { ProductImportMapping } from "../../components/inventory/import/ImportMappingStep";
import type { ParsedProductFile } from "../parsers/ProductFileParser"; 

export type ResolvedProductMapping = Record<
  ProductImportField,
  string | null
>;

export interface MappedProductFile {
  source: ProductImportSource;
  headers: string[];
  rows: ProductImportRow[];
  mapping: ResolvedProductMapping;
  unmappedHeaders: string[];
}

const IMPORT_FIELDS: ProductImportField[] = [
  "name",
  "sku",
  "barcode",
  "costPrice",
  "sellingPrice",
  "category",
  "description",
  "reorderLevel",
  "quantity",
];

function normalizeHeader(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function cleanText(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();

  return text.length > 0 ? text : null;
}

function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  let text = String(value).trim();

  if (!text) {
    return null;
  }

  // Accept common currency symbols and thousands separators.
  text = text
    .replace(/^[₦$€£]\s*/u, "")
    .replace(/\s*[₦$€£]$/u, "")
    .replace(/,/g, "")
    .trim();

  if (!/^-?\d+(\.\d+)?$/.test(text)) {
    return null;
  }

  const number = Number(text);

  return Number.isFinite(number) ? number : null;
}

function resolveHeaders(
  headers: string[],
): ResolvedProductMapping {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));

  const mapping: ResolvedProductMapping = {
    name: null,
    sku: null,
    barcode: null,
    costPrice: null,
    sellingPrice: null,
    category: null,
    description: null,
    reorderLevel: null,
    quantity: null,
  };

  const usedHeaders = new Set<string>();

  for (const field of IMPORT_FIELDS) {
    const aliases = FIELD_ALIASES[field] ?? [];

    const normalizedAliases = [
      normalizeHeader(field),
      ...aliases.map(normalizeHeader),
    ];

    const match = normalizedHeaders.find(
      (header) =>
        !usedHeaders.has(header.original) &&
        normalizedAliases.includes(header.normalized),
    );

    if (match) {
      mapping[field] = match.original;
      usedHeaders.add(match.original);
    }
  }

  return mapping;
}

function getMappedValue(
  raw: Record<string, unknown>,
  column: string | null,
): unknown {
  if (!column) {
    return null;
  }

  return raw[column] ?? null;
}

function applyMapping(
  parsed: ParsedProductFile,
  mapping: ResolvedProductMapping,
): ProductImportRow[] {
  return parsed.rows.map((raw, index) => ({
    rowNumber: index + 2,

    name: cleanText(getMappedValue(raw, mapping.name)),
    sku: cleanText(getMappedValue(raw, mapping.sku)),
    barcode: cleanText(getMappedValue(raw, mapping.barcode)),

    costPrice: parseNumber(
      getMappedValue(raw, mapping.costPrice),
    ),

    sellingPrice: parseNumber(
      getMappedValue(raw, mapping.sellingPrice),
    ),

    category: cleanText(
      getMappedValue(raw, mapping.category),
    ),

    description: cleanText(
      getMappedValue(raw, mapping.description),
    ),

    reorderLevel: parseNumber(
      getMappedValue(raw, mapping.reorderLevel),
    ),

    quantity: parseNumber(
      getMappedValue(raw, mapping.quantity),
    ),

    source: parsed.source,
    raw,
  }));
}

export function mapProductFile(
  parsed: ParsedProductFile,
  selectedMapping?: ProductImportMapping,
): MappedProductFile {
  const automaticMapping = resolveHeaders(parsed.headers);

  // When the user selects columns manually, those selections
  // override automatic detection.
  const mapping: ResolvedProductMapping = {
    name: selectedMapping
      ? selectedMapping.name
      : automaticMapping.name,

    sku: selectedMapping
      ? selectedMapping.sku
      : automaticMapping.sku,

    barcode: selectedMapping
      ? selectedMapping.barcode
      : automaticMapping.barcode,

    costPrice: selectedMapping
      ? selectedMapping.costPrice
      : automaticMapping.costPrice,

    sellingPrice: selectedMapping
      ? selectedMapping.sellingPrice
      : automaticMapping.sellingPrice,

    category: selectedMapping
      ? selectedMapping.category
      : automaticMapping.category,

    description: selectedMapping
      ? selectedMapping.description
      : automaticMapping.description,

    reorderLevel: selectedMapping
      ? selectedMapping.reorderLevel
      : automaticMapping.reorderLevel,

    quantity: selectedMapping
      ? selectedMapping.quantity
      : automaticMapping.quantity,
  };

  const mappedHeaders = new Set(
    Object.values(mapping).filter(
      (header): header is string => header !== null,
    ),
  );

  return {
    source: parsed.source,
    headers: parsed.headers,
    rows: applyMapping(parsed, mapping),
    mapping,
    unmappedHeaders: parsed.headers.filter(
      (header) => !mappedHeaders.has(header),
    ),
  };
}
