export type Product = {
    id: string;
    businessId: string;
    branchId: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    costPrice: number;
    price: number;
    category: string | null;
    sku: string | null;
    barcode: string | null;
    reorderLevel: number | null;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: number;
    updatedAt: number | null;
    deletedAt: number | null;
};
export type ProductImportRow = {
    rowNumber: number;
    name: string | null;
    sku: string | null;
    barcode: string | null;
    costPrice: number | null;
    sellingPrice: number | null;
    category: string | null;
    description: string | null;
    reorderLevel: number | null;
    quantity: number | null;
    source: ProductImportSource;
    raw: Record<string, unknown>;
};
export type ProductImportIssue = {
    code: string;
    severity: "ERROR" | "WARNING";
    message: string;
    rowNumber: number;
    field?: ProductImportField;
};
export type ProductImportStatus = "UPLOADED" | "PARSING" | "MAPPING" | "VALIDATING" | "READY" | "IMPORTING" | "COMPLETED" | "FAILED" | "CANCELLED";
export type ProductImportSummary = {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    warningRows: number;
    duplicateRows: number;
};
export type ProductImportField = "name" | "sku" | "barcode" | "costPrice" | "sellingPrice" | "category" | "description" | "reorderLevel" | "quantity";
export type ProductImportSchema = {
    required: ProductImportField[];
    optional: ProductImportField[];
};
export declare const FIELD_ALIASES: {
    name: string[];
    sku: string[];
    barcode: string[];
    costPrice: string[];
    sellingPrice: string[];
    category: string[];
    quantity: string[];
    reorderLevel: string[];
    description: string[];
};
export type ProductImportSource = {
    fileName: string;
    fileType: ProductImportFileType;
    sheetName?: string;
};
export type ProductImportSession = {
    id: string;
    businessId: string;
    branchId: string;
    fileName: string;
    fileType: ProductImportFileType;
    totalRows: number;
    validRows: number;
    invalidRows: number;
    status: "UPLOADED" | "PARSING" | "MAPPING" | "VALIDATING" | "READY" | "IMPORTING" | "COMPLETED" | "FAILED" | "CANCELLED";
    createdAt: number;
    completedAt: number | null;
};
export interface ValidatedProductImportRow {
    row: ProductImportRow;
    issues: ProductImportIssue[];
    valid: boolean;
}
export type ProductImportFileType = "csv" | "xlsx" | "xls" | "pdf";
