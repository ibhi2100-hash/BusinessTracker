import type { 
    ProductImportIssue,
    ProductImportRow,
    ProductImportSummary  
} from "@business/shared-types";


export type ProductImportAction = 
    | "CREATE"
    | "UPDATE"
    | "SKIP"
    | "ERROR"

export type ProductImportOperation = {
    id: string;

    rowNumber: number;

    action: ProductImportAction;

    product: ProductImportRow;

    existingProductId: string | null;

    issues: ProductImportIssue[]
};

export type ImportPlan  = {
    id: string;

    businessId: string;

    branchId: string | null;

    sourceFileName: string;

    createdAt: number;

    operations: ProductImportOperation[];

    summary: ProductImportSummary;

    approvedAt: number | null;
}

