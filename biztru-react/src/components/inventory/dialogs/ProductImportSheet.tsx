
// src/ingestion/products/ui/ProductImportSheet.tsx

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  ProductImportRow,
  ProductImportSource,
  ProductImportStatus,
  ProductImportSummary,
  ValidatedProductImportRow,
} from "@business/shared-types";

import type {
  ProductImportMapping,
} from "../import/ImportMappingStep";

import { ImportUploadStep } from "../import/ImportUploadStep";
import { ImportMappingStep } from "../import/ImportMappingStep";
import { ImportReviewStep } from "../import/ImportReviewStep";

import {
  ImportProgressStep,
  type ImportProgressPhase,
} from "../import/ImportProgressStep";

import { ImportCompleteStep } from "../import/ImportCompleteStep";
import { GlassSheet } from "../../../components/ui/GlassSheet";

/* ============================================================
   DOMAIN CONTRACTS
   ============================================================ */

/**
 * The parser must return the canonical shared source type.
 *
 * Do not replace ProductImportSource with string. This keeps
 * the source contract consistent across preparation, mapping,
 * validation, and import.
 */
export interface PreparedProductImport {
  source: ProductImportSource;
  headers: string[];
  rows: ProductImportRow[];
  mapping: ProductImportMapping;
  results: ValidatedProductImportRow[];
  summary: ProductImportSummary;
}

export interface ProductImportValidation {
  results: ValidatedProductImportRow[];
  summary: ProductImportSummary;
}

export interface ProductImportResult {
  totalOperations: number;
  createdProducts: number;
  updatedProducts: number;
  createdStock: number;
  failedOperations: number;
}

/**
 * Optional progress information reported by the import service.
 * The service must report actual progress, not estimated progress.
 */
export interface ProductImportProgressUpdate {
  phase: ImportProgressPhase;
  totalOperations?: number;
  completedOperations?: number;
  createdProducts?: number;
  updatedProducts?: number;
  createdStock?: number;
  failedOperations?: number;
  errorMessage?: string | null;
}

export interface ProductImportSheetProps {
  open: boolean;
  onClose: () => void;

  /**
   * Parse and prepare the selected file.
   *
   * The implementation should enforce supported file formats,
   * file-size limits, parser safety, and empty-file detection.
   */
  prepareFile: (
    file: File,
  ) => Promise<PreparedProductImport>;

  /**
   * Apply the chosen mapping and run canonical validation.
   *
   * This is synchronous because the component expects immediate
   * validation results. Use a Promise-based contract if your
   * validation pipeline performs asynchronous work.
   */
  validateRows: (args: {
    rows: ProductImportRow[];
    mapping: ProductImportMapping;
    source: ProductImportSource;
  }) => ProductImportValidation;

  /**
   * Delegate persistence to the import service.
   *
   * The optional progress callback is backward-compatible with
   * implementations that only accept rows. To display live
   * progress, the service must invoke the callback as work runs.
   *
   * The service should also enforce idempotency and reconcile
   * partially committed operations before allowing retries.
   */
  onImport: (
    rows: ValidatedProductImportRow[],
    onProgress?: (update: ProductImportProgressUpdate) => void,
  ) => Promise<ProductImportResult>;

  onViewProducts?: () => void;
  onViewInventory?: () => void;
}

type ImportStep =
  | "UPLOAD"
  | "MAPPING"
  | "REVIEW"
  | "IMPORTING"
  | "COMPLETE";

interface ImportProgressState {
  phase: ImportProgressPhase;
  totalOperations: number;
  completedOperations: number;
  createdProducts: number;
  updatedProducts: number;
  createdStock: number;
  failedOperations: number;
  errorMessage: string | null;
}

const EMPTY_SUMMARY: ProductImportSummary = {
  totalRows: 0,
  validRows: 0,
  invalidRows: 0,
  warningRows: 0,
  duplicateRows: 0,
};

const INITIAL_PROGRESS: ImportProgressState = {
  phase: "PREPARING",
  totalOperations: 0,
  completedOperations: 0,
  createdProducts: 0,
  updatedProducts: 0,
  createdStock: 0,
  failedOperations: 0,
  errorMessage: null,
};

/* ============================================================
   VALIDATION HELPERS
   ============================================================ */

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error && error.message.trim()
    ? error.message
    : fallback;
}

function isNonNegativeSafeInteger(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= 0
  );
}

function isValidSummary(
  summary: ProductImportSummary,
): boolean {
  if (!summary || typeof summary !== "object") {
    return false;
  }

  const counts = [
    summary.totalRows,
    summary.validRows,
    summary.invalidRows,
    summary.warningRows,
    summary.duplicateRows,
  ];

  if (!counts.every(isNonNegativeSafeInteger)) {
    return false;
  }

  // Every row must be accounted for as valid or invalid.
  // Warning and duplicate counts may overlap these categories.
  return (
    summary.validRows + summary.invalidRows ===
    summary.totalRows
  );
}

function isValidImportResult(
  result: ProductImportResult,
): boolean {
  if (!result || typeof result !== "object") {
    return false;
  }

  const values = [
    result.totalOperations,
    result.createdProducts,
    result.updatedProducts,
    result.createdStock,
    result.failedOperations,
  ];

  if (!values.every(isNonNegativeSafeInteger)) {
    return false;
  }

  return (
    result.failedOperations <= result.totalOperations
  );
}

function isValidRawRows(
  rows: ProductImportRow[],
  headers: string[],
): boolean {
  if (!Array.isArray(rows) || !Array.isArray(headers)) {
    return false;
  }

  if (headers.length === 0 || rows.length === 0) {
    return false;
  }

  const normalizedHeaders = headers.map((header) =>
    typeof header === "string" ? header.trim() : "",
  );

  // Blank or duplicate headers make column mapping ambiguous.
  if (
    normalizedHeaders.some((header) => header.length === 0) ||
    new Set(
      normalizedHeaders.map((header) => header.toLowerCase()),
    ).size !== normalizedHeaders.length
  ) {
    return false;
  }

  return rows.every((row) => {
    if (
      !row ||
      typeof row !== "object" ||
      !isNonNegativeSafeInteger(row.rowNumber) ||
      row.rowNumber < 1 ||
      !row.raw ||
      typeof row.raw !== "object" ||
      Array.isArray(row.raw)
    ) {
      return false;
    }

    return true;
  });
}

function isValidPreparedImport(
  prepared: PreparedProductImport,
): boolean {
  if (!prepared || typeof prepared !== "object") {
    return false;
  }

  // ProductImportSource may be a union or structured domain type.
  // Its authoritative runtime validation belongs in the shared
  // parser/domain contract, not in an assumed string check here.
  if (prepared.source == null) {
    return false;
  }

  if (
    !Array.isArray(prepared.headers) ||
    !Array.isArray(prepared.rows) ||
    !Array.isArray(prepared.results)
  ) {
    return false;
  }

  if (!isValidRawRows(prepared.rows, prepared.headers)) {
    return false;
  }

  if (!isValidSummary(prepared.summary)) {
    return false;
  }

  if (prepared.summary.totalRows !== prepared.rows.length) {
    return false;
  }

  if (prepared.results.length !== prepared.summary.totalRows) {
    return false;
  }

  return true;
}

function isValidProgressUpdate(
  update: ProductImportProgressUpdate,
): boolean {
  if (!update || typeof update !== "object") {
    return false;
  }

  const optionalCounts = [
    update.totalOperations,
    update.completedOperations,
    update.createdProducts,
    update.updatedProducts,
    update.createdStock,
    update.failedOperations,
  ];

  return optionalCounts.every(
    (value) =>
      value === undefined || isNonNegativeSafeInteger(value),
  );
}

function mergeProgress(
  current: ImportProgressState,
  update: ProductImportProgressUpdate,
): ImportProgressState {
  return {
    phase: update.phase,
    totalOperations:
      update.totalOperations ?? current.totalOperations,
    completedOperations:
      update.completedOperations ?? current.completedOperations,
    createdProducts:
      update.createdProducts ?? current.createdProducts,
    updatedProducts:
      update.updatedProducts ?? current.updatedProducts,
    createdStock:
      update.createdStock ?? current.createdStock,
    failedOperations:
      update.failedOperations ?? current.failedOperations,
    errorMessage:
      update.errorMessage === undefined
        ? current.errorMessage
        : update.errorMessage,
  };
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function ProductImportSheet({
  open,
  onClose,
  prepareFile,
  validateRows,
  onImport,
  onViewProducts,
  onViewInventory,
}: ProductImportSheetProps) {
  const [step, setStep] = useState<ImportStep>("UPLOAD");

  const [status, setStatus] =
    useState<ProductImportStatus>("UPLOADED");
  console.log(status)
  const [source, setSource] =
    useState<ProductImportSource | null>(null);

  const [headers, setHeaders] = useState<string[]>([]);

  const [rawRows, setRawRows] = useState<ProductImportRow[]>([]);

  const [mapping, setMapping] =
    useState<ProductImportMapping>();

  const [rows, setRows] =
    useState<ValidatedProductImportRow[]>([]);

  const [summary, setSummary] =
    useState<ProductImportSummary>(EMPTY_SUMMARY);

  const [progress, setProgress] =
    useState<ImportProgressState>(INITIAL_PROGRESS);

  const [importResult, setImportResult] =
    useState<ProductImportResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Refs provide synchronous guards against duplicate actions
  // and prevent older asynchronous operations updating new state.
  const busyRef = useRef(false);
  const mountedRef = useRef(false);
  const operationRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      operationRef.current += 1;
      busyRef.current = false;
    };
  }, []);

  const beginOperation = useCallback((): number | null => {
    if (busyRef.current || !mountedRef.current) {
      return null;
    }

    busyRef.current = true;
    setBusy(true);

    operationRef.current += 1;
    return operationRef.current;
  }, []);

  const isCurrentOperation = useCallback(
    (operation: number) =>
      mountedRef.current &&
      operation === operationRef.current,
    [],
  );

  const endOperation = useCallback((operation: number) => {
    if (
      !mountedRef.current ||
      operation !== operationRef.current
    ) {
      return;
    }

    busyRef.current = false;
    setBusy(false);
  }, []);

  const reset = useCallback(() => {
    // Invalidate pending async callbacks before resetting state.
    operationRef.current += 1;
    busyRef.current = false;

    setStep("UPLOAD");
    setStatus("UPLOADED");
    setSource(null);
    setHeaders([]);
    setRawRows([]);
    setMapping(undefined);
    setRows([]);
    setSummary(EMPTY_SUMMARY);
    setProgress(INITIAL_PROGRESS);
    setImportResult(null);
    setError(null);
    setBusy(false);
  }, []);

  const handleClose = useCallback(() => {
    // Do not silently dismiss an in-flight write operation.
    if (busyRef.current) {
      return;
    }

    reset();
    onClose();
  }, [onClose, reset]);

  /* ==========================================================
     UPLOAD / PREPARATION
     ========================================================== */

  const handleFileSelected = useCallback(
    async (selectedFile: File) => {
      const operation = beginOperation();

      if (operation === null) {
        return;
      }

      setError(null);
      setStatus("PARSING");

      try {
        if (
          typeof File === "undefined" ||
          !(selectedFile instanceof File)
        ) {
          throw new Error("Select a valid import file.");
        }

        if (selectedFile.size <= 0) {
          throw new Error("The selected file is empty.");
        }

        const prepared = await prepareFile(selectedFile);

        if (!isCurrentOperation(operation)) {
          return;
        }

        if (!isValidPreparedImport(prepared)) {
          throw new Error(
            "The parser returned invalid or inconsistent import data.",
          );
        }

        setSource(prepared.source);
        setHeaders([...prepared.headers]);
        setRawRows([...prepared.rows]);
        setMapping(prepared.mapping);
        setRows([...prepared.results]);
        setSummary({ ...prepared.summary });

        setProgress({
          ...INITIAL_PROGRESS,
          totalOperations: prepared.rows.length,
        });

        setStatus("MAPPING");
        setStep("MAPPING");
      } catch (cause) {
        if (!isCurrentOperation(operation)) {
          return;
        }

        setError(
          getErrorMessage(
            cause,
            "Unable to prepare the selected file.",
          ),
        );

        setStatus("FAILED");
      } finally {
        endOperation(operation);
      }
    },
    [
      beginOperation,
      endOperation,
      isCurrentOperation,
      prepareFile,
    ],
  );

  /* ==========================================================
     MAPPING / VALIDATION
     ========================================================== */

  const handleMappingContinue = useCallback(
    (nextMapping: ProductImportMapping) => {
      if (busyRef.current || source === null) {
        return;
      }

      const operation = beginOperation();

      if (operation === null) {
        return;
      }

      setError(null);
      setStatus("VALIDATING");

      try {
        const validation = validateRows({
          rows: rawRows,
          mapping: nextMapping,
          source,
        });

        if (!isCurrentOperation(operation)) {
          return;
        }

        if (
          !validation ||
          !Array.isArray(validation.results) ||
          !isValidSummary(validation.summary)
        ) {
          throw new Error(
            "Validation returned an invalid result.",
          );
        }

        if (
          validation.summary.totalRows !== rawRows.length ||
          validation.summary.totalRows !==
            validation.results.length
        ) {
          throw new Error(
            "Validation returned an inconsistent row count.",
          );
        }

        setMapping(nextMapping);
        setRows([...validation.results]);
        setSummary({ ...validation.summary });

        setProgress({
          ...INITIAL_PROGRESS,
          totalOperations: validation.results.length,
        });

        setStatus("READY");
        setStep("REVIEW");
      } catch (cause) {
        if (!isCurrentOperation(operation)) {
          return;
        }

        setError(
          getErrorMessage(
            cause,
            "Unable to validate the mapped import.",
          ),
        );

        setStatus("FAILED");
      } finally {
        endOperation(operation);
      }
    },
    [
      beginOperation,
      endOperation,
      isCurrentOperation,
      rawRows,
      source,
      validateRows,
    ],
  );

  const handleBackToUpload = useCallback(() => {
    if (busyRef.current) {
      return;
    }

    reset();
  }, [reset]);

  const handleBackToMapping = useCallback(() => {
    if (busyRef.current) {
      return;
    }

    setError(null);
    setStep("MAPPING");
    setStatus("MAPPING");
  }, []);

  /* ==========================================================
     IMPORT EXECUTION
     ========================================================== */

  const handleApprove = useCallback(async () => {
    if (
      busyRef.current ||
      rows.length === 0 ||
      summary.invalidRows > 0 ||
      summary.validRows !== rows.length
    ) {
      return;
    }

    const operation = beginOperation();

    if (operation === null) {
      return;
    }

    setError(null);
    setStep("IMPORTING");
    setStatus("IMPORTING");
    setImportResult(null);

    setProgress({
      ...INITIAL_PROGRESS,
      totalOperations: rows.length,
    });

    try {
      const result = await onImport(
        rows,
        (update: ProductImportProgressUpdate) => {
          if (!isCurrentOperation(operation)) {
            return;
          }

          if (!isValidProgressUpdate(update)) {
            setError(
              "The import service reported invalid progress data.",
            );
            return;
          }

          setProgress((current) =>
            mergeProgress(current, update),
          );
        },
      );

      if (!isCurrentOperation(operation)) {
        return;
      }

      if (!isValidImportResult(result)) {
        throw new Error(
          "The import service returned an invalid result.",
        );
      }

      setImportResult(result);

      setProgress((current) => ({
        ...current,
        phase:
          result.failedOperations > 0
            ? "FAILED"
            : "COMPLETED",
        totalOperations: result.totalOperations,
        completedOperations:
          result.totalOperations - result.failedOperations,
        createdProducts: result.createdProducts,
        updatedProducts: result.updatedProducts,
        createdStock: result.createdStock,
        failedOperations: result.failedOperations,
        errorMessage:
          result.failedOperations > 0
            ? "Some import operations failed. Review the import service logs."
            : null,
      }));

      setStatus(
        result.failedOperations > 0
          ? "FAILED"
          : "COMPLETED",
      );

      setStep("COMPLETE");
    } catch (cause) {
      if (!isCurrentOperation(operation)) {
        return;
      }

      const message = getErrorMessage(
        cause,
        "The product import failed.",
      );

      setError(message);
      setStatus("FAILED");

      setProgress((current) => ({
        ...current,
        phase: "FAILED",
        errorMessage: message,
      }));

      // A thrown error does not establish how many operations
      // committed. Preserve reported progress but do not invent
      // a final result or success/failure totals.
      setImportResult(null);
      setStep("COMPLETE");
    } finally {
      endOperation(operation);
    }
  }, [
    beginOperation,
    endOperation,
    isCurrentOperation,
    onImport,
    rows,
    summary.invalidRows,
    summary.validRows,
  ]);

  const handleDone = useCallback(() => {
    if (busyRef.current) {
      return;
    }

    reset();
    onClose();
  }, [onClose, reset]);

  const title = useMemo(() => {
    switch (step) {
      case "UPLOAD":
        return "Import products";
      case "MAPPING":
        return "Map product columns";
      case "REVIEW":
        return "Review product import";
      case "IMPORTING":
        return "Importing products";
      case "COMPLETE":
        return "Import results";
    }
  }, [step]);

  if (!open) {
    return null;
  }

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title={title}
      className="
        w-full
        sm:max-w-xl
        lg:max-w-2xl
        xl:max-w-3xl
      "
    >
      <div className="p-5 md:p-6">
        {error && (
          <div
            role="alert"
            className="
              mb-5 rounded-xl
              border border-red-400/20
              bg-red-400/10
              px-4 py-3 text-sm text-red-300
            "
          >
            {error}
          </div>
        )}

        {step === "UPLOAD" && (
          <ImportUploadStep
            onFileSelected={handleFileSelected}
            onCancel={handleClose}
            disabled={busy}
          />
        )}

        {step === "MAPPING" && source !== null && (
          <ImportMappingStep
            source={source}
            headers={headers}
            rows={rawRows}
            initialMapping={mapping}
            onBack={handleBackToUpload}
            onContinue={handleMappingContinue}
            disabled={busy}
          />
        )}

        {step === "REVIEW" && (
          <ImportReviewStep
            rows={rows}
            summary={summary}
            onBack={handleBackToMapping}
            onApprove={handleApprove}
            disabled={
              busy ||
              rows.length === 0 ||
              summary.invalidRows > 0 ||
              summary.validRows !== rows.length
            }
          />
        )}

        {step === "IMPORTING" && (
          <ImportProgressStep
            phase={progress.phase}
            totalOperations={progress.totalOperations}
            completedOperations={progress.completedOperations}
            createdProducts={progress.createdProducts}
            updatedProducts={progress.updatedProducts}
            createdStock={progress.createdStock}
            failedOperations={progress.failedOperations}
            errorMessage={progress.errorMessage}
            disabled={busy}
          />
        )}

        {step === "COMPLETE" && importResult !== null && (
          <ImportCompleteStep
            totalOperations={importResult.totalOperations}
            createdProducts={importResult.createdProducts}
            updatedProducts={importResult.updatedProducts}
            createdStock={importResult.createdStock}
            failedOperations={importResult.failedOperations}
            onDone={handleDone}
            onViewProducts={onViewProducts}
            onViewInventory={onViewInventory}
            disabled={busy}
          />
        )}

        {step === "COMPLETE" && importResult === null && (
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              The import did not return a confirmed final result.
              Some operations may have committed before the error.
              Check the import service and operation logs before
              retrying.
            </p>

            {progress.completedOperations > 0 && (
              <p className="text-sm text-white/60">
                The service reported{" "}
                {progress.completedOperations} completed operations
                before the error.
              </p>
            )}

            <button
              type="button"
              onClick={handleDone}
              disabled={busy}
              className="
                rounded-xl border border-white/10
                px-4 py-2 text-sm
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Close
            </button>
          </div>
        )}
      </div>
    </GlassSheet>
  );
}