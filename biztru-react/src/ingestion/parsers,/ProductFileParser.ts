
import * as XLSX from "xlsx";

import type {
  ProductImportFileType,
  ProductImportSource,
} from "@business/shared-types"

export interface ParsedProductFile {
  source: ProductImportSource;
  headers: string[];
  rows: Array<Record<string, unknown>>;
}

const SUPPORTED_EXTENSIONS = new Set(["csv", "xlsx", "xls"]);

function getExtension(fileName: string): string {
  const index = fileName.lastIndexOf(".");

  if (index < 0) return "";

  return fileName.slice(index + 1).toLowerCase();
}

function isEmptyRow(row: unknown[]): boolean {
  return row.every(
    (value) => value == null || String(value).trim() === "",
  );
}

function makeUniqueHeaders(values: unknown[]): string[] {
  const counts = new Map<string, number>();

  return values.map((value, index) => {
    const base = String(value ?? "").trim() || `Column ${index + 1}`;
    const count = (counts.get(base) ?? 0) + 1;

    counts.set(base, count);

    return count === 1 ? base : `${base} (${count})`;
  });
}

export async function parseProductFile(
  file: File,
  sheetName?: string,
): Promise<ParsedProductFile> {
  const extension = getExtension(file.name);

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error(
      "Unsupported file type. Upload a CSV, XLSX, or XLS file.",
    );
  }

  if (file.size === 0) {
    throw new Error("The selected file is empty.");
  }

  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "array",
    cellDates: false,
  });

  const selectedSheetName =
    sheetName ?? workbook.SheetNames[0];

  if (!selectedSheetName) {
    throw new Error("The workbook contains no worksheets.");
  }

  const worksheet = workbook.Sheets[selectedSheetName];

  if (!worksheet) {
    throw new Error(`Worksheet "${selectedSheetName}" was not found.`);
  }

  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
    blankrows: false,
  });

  const nonEmptyRows = matrix.filter(
    (row) => Array.isArray(row) && !isEmptyRow(row),
  );

  if (nonEmptyRows.length < 2) {
    throw new Error(
      "The file must contain a header row and at least one data row.",
    );
  }

  // The first non-empty row is treated as the header.
  const headers = makeUniqueHeaders(nonEmptyRows[0]);

  const rows = nonEmptyRows.slice(1).map((cells) => {
    const record: Record<string, unknown> = {};

    headers.forEach((header, index) => {
      record[header] = cells[index] ?? "";
    });

    return record;
  });

  const fileType = extension as ProductImportFileType;

  return {
    source: {
      fileName: file.name,
      fileType,
      sheetName: selectedSheetName,
    },
    headers,
    rows,
  };
}