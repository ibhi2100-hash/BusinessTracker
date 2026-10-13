// src/ingestion/products/ui/ProductImportSheet.tsx

import {
  useCallback,
  useMemo,
  useState,
} from "react";

import type {
  ProductImportRow,
  ProductImportStatus,
  ProductImportSummary,
  ValidatedProductImportRow,
} from "@business/shared-types"

import type { ProductImportMapping } from "../import/ImportMappingStep"; 


import {
  ImportUploadStep,
} from "../import/ImportUploadStep";

import {
  ImportMappingStep,
} from "../import/ImportMappingStep";

import {
  ImportReviewStep,
} from "../import/ImportReviewStep";

import {
  ImportProgressStep,
  type ImportProgressPhase,
} from "../import/ImportProgressStep";

import {
  ImportCompleteStep,
} from "../import/ImportCompleteStep";

import { GlassSheet } from "../../../components/ui/GlassSheet";

interface ProductImportSheetProps {
  open: boolean;
  onClose: () => void;

  onImport: (
    rows: ValidatedProductImportRow[],
  ) => Promise<ProductImportResult>;

  onViewProducts?: () => void;
  onViewInventory?: () => void;
}
function applyProductMapping(){

}

export interface ProductImportResult {
  totalOperations: number;
  createdProducts: number;
  updatedProducts: number;
  createdStock: number;
  failedOperations: number;
}
function prepareProductImport(prepare: any){

}
type ImportStep =
  | "UPLOAD"
  | "MAPPING"
  | "REVIEW"
  | "IMPORTING"
  | "COMPLETE";

export default function ProductImportSheet({
  open,
  onClose,
  onImport,
  onViewProducts,
  onViewInventory,
}: ProductImportSheetProps) {
  const [step, setStep] =
    useState<ImportStep>("UPLOAD");
interface prepareProductImport { 

}

  const [status, setStatus] =
    useState<ProductImportStatus>("UPLOADED");

  const [file, setFile] =
    useState<File | null>(null);

  const [source, setSource] =
    useState<Awaited<
      ReturnType<ProductImportResult>
    >["source"] | null>(null);

  const [headers, setHeaders] =
    useState<string[]>([]);

  const [rawRows, setRawRows] =
    useState<
      Array<{
        rowNumber: number;
        raw: Record<string, unknown>;
      }>
    >([]);

  const [mapping, setMapping] =
    useState<ProductImportMapping>();

  const [rows, setRows] =
    useState<ValidatedProductImportRow[]>([]);

  const [summary, setSummary] =
    useState<ProductImportSummary>({
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      warningRows: 0,
      duplicateRows: 0,
    });

  const [progressPhase, setProgressPhase] =
    useState<ImportProgressPhase>("PREPARING");

  const [importResult, setImportResult] =
    useState<ProductImportResult | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [busy, setBusy] =
    useState(false);

  const reset = useCallback(() => {
    setStep("UPLOAD");
    setStatus("UPLOADED");
    setFile(null);
    setSource(null);
    setHeaders([]);
    setRawRows([]);
    setMapping(undefined);
    setRows([]);
    setSummary({
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      warningRows: 0,
      duplicateRows: 0,
    });
    setProgressPhase("PREPARING");
    setImportResult(null);
    setError(null);
    setBusy(false);
  }, []);

  const handleClose = useCallback(() => {
    if (busy) {
      return;
    }

    reset();
    onClose();
  }, [busy, onClose, reset]);

  const handleFileSelected = useCallback(
    async (selectedFile: File) => {
      setBusy(true);
      setError(null);
      setFile(selectedFile);
      setStatus("PARSING");

      try {
        const prepared =
          await prepareProductImport(selectedFile);

        setSource(prepared.source);
        setHeaders(prepared.headers);

        setRawRows(
          prepared.rows.map((row) => ({
            rowNumber: row.rowNumber,
            raw: row.raw,
          })),
        );

        setMapping(prepared.mapping);

        setRows(prepared.results);
        setSummary(prepared.summary);

        setStatus("MAPPING");
        setStep("MAPPING");
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Unable to read the selected file.";

        setError(message);
        setStatus("FAILED");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const handleMappingContinue = useCallback(
    (nextMapping: ProductImportMapping) => {
      if (!source) {
        return;
      }

      setBusy(true);
      setError(null);
      setStatus("VALIDATING");

      try {
        const canonicalRows =
          applyProductMapping({
            rows: rawRows,
            mapping: nextMapping,
            source,
          });

        const validation =
          validateProductImport(canonicalRows);

        setMapping(nextMapping);
        setRows(validation.results);
        setSummary(validation.summary);

        setStatus("READY");
        setStep("REVIEW");
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Unable to validate the mapped import.";

        setError(message);
        setStatus("FAILED");
      } finally {
        setBusy(false);
      }
    },
    [rawRows, source],
  );

  const handleBackToUpload = useCallback(() => {
    if (busy) {
      return;
    }

    reset();
  }, [busy, reset]);

  const handleBackToMapping = useCallback(() => {
    if (busy) {
      return;
    }

    setStep("MAPPING");
    setStatus("MAPPING");
  }, [busy]);

  const handleApprove = useCallback(async () => {
    if (busy || rows.length === 0) {
      return;
    }

    if (summary.invalidRows > 0) {
      return;
    }

    setBusy(true);
    setError(null);
    setStep("IMPORTING");
    setStatus("IMPORTING");
    setProgressPhase("PREPARING");

    try {
      setProgressPhase("CREATING_PRODUCTS");

      const result = await onImport(rows);

      setImportResult(result);

      if (result.failedOperations > 0) {
        setProgressPhase("FAILED");
        setStatus("FAILED");
      } else {
        setProgressPhase("COMPLETED");
        setStatus("COMPLETED");
      }

      setStep("COMPLETE");
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "The product import failed.";

      setError(message);
      setProgressPhase("FAILED");
      setStatus("FAILED");
      setStep("COMPLETE");

      setImportResult({
        totalOperations: rows.length,
        createdProducts: 0,
        updatedProducts: 0,
        createdStock: 0,
        failedOperations: rows.length,
      });
    } finally {
      setBusy(false);
    }
  }, [
    busy,
    onImport,
    rows,
    summary.invalidRows,
  ]);

  const handleDone = useCallback(() => {
    if (busy) {
      return;
    }

    reset();
    onClose();
  }, [busy, onClose, reset]);

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
        return "Import complete";
    }
  }, [step]);

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
          <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
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

        {step === "MAPPING" &&
          source && (
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
            disabled={busy}
          />
        )}

        {step === "IMPORTING" && (
          <ImportProgressStep
            phase={progressPhase}
            totalOperations={rows.length}
            completedOperations={
              progressPhase === "COMPLETED"
                ? rows.length
                : 0
            }
            createdProducts={
              importResult?.createdProducts ?? 0
            }
            updatedProducts={
              importResult?.updatedProducts ?? 0
            }
            createdStock={
              importResult?.createdStock ?? 0
            }
            failedOperations={
              importResult?.failedOperations ?? 0
            }
            errorMessage={error}
            disabled={busy}
          />
        )}

        {step === "COMPLETE" &&
          importResult && (
            <ImportCompleteStep
              totalOperations={
                importResult.totalOperations
              }
              createdProducts={
                importResult.createdProducts
              }
              updatedProducts={
                importResult.updatedProducts
              }
              createdStock={
                importResult.createdStock
              }
              failedOperations={
                importResult.failedOperations
              }
              onDone={handleDone}
              onViewProducts={onViewProducts}
              onViewInventory={onViewInventory}
              disabled={busy}
            />
          )}
      </div>
    </GlassSheet>
  );
}