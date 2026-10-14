// src/ingestion/products/import/ImportMappingStep.tsx

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Columns3,
  HelpCircle,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from "react";

import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassCard } from "../../../components/ui/GlassCard";

import type {
  ProductImportField,
  ProductImportRow,
  ProductImportSource,
} from "@business/shared-types";

/* ============================================================
   CONTRACTS
   ============================================================ */

export interface ProductImportMapping {
  name: string | null;
  sku: string | null;
  barcode: string | null;
  costPrice: string | null;
  sellingPrice: string | null;
  category: string | null;
  description: string | null;
  reorderLevel: string | null;
  quantity: string | null;
}

export interface ImportMappingStepProps {
  source: ProductImportSource;
  headers: string[];
  rows: ProductImportRow[];

  initialMapping?: Partial<
    Record<ProductImportField, string | null>
  >;

  onBack: () => void;
  onContinue: (mapping: ProductImportMapping) => void;
  disabled?: boolean;
}

interface MappingOption {
  field: ProductImportField;
  label: string;
  description: string;
  required?: boolean;
}

type MappingField = keyof ProductImportMapping;

/* ============================================================
   FIELD DEFINITIONS
   ============================================================ */

const MAPPING_OPTIONS: MappingOption[] = [
  {
    field: "name",
    label: "Product name",
    description: "The name customers and staff see.",
    required: true,
  },
  {
    field: "sku",
    label: "SKU",
    description: "Internal stock keeping identifier.",
  },
  {
    field: "barcode",
    label: "Barcode",
    description: "Barcode, EAN, UPC, or GTIN.",
  },
  {
    field: "costPrice",
    label: "Cost price",
    description: "What the business pays for the product.",
    required: true,
  },
  {
    field: "sellingPrice",
    label: "Selling price",
    description: "The normal selling price.",
    required: true,
  },
  {
    field: "category",
    label: "Category",
    description: "Product category or department.",
  },
  {
    field: "description",
    label: "Description",
    description: "Additional product information.",
  },
  {
    field: "reorderLevel",
    label: "Reorder level",
    description: "The stock threshold for replenishment.",
  },
  {
    field: "quantity",
    label: "Opening quantity",
    description: "Initial inventory for the selected branch.",
  },
];

const MAPPING_FIELDS: MappingField[] = [
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

/* ============================================================
   HELPERS
   ============================================================ */

function createInitialMapping(
  initialMapping: Partial<
    Record<ProductImportField, string | null>
  > = {},
  headers: string[] = [],
): ProductImportMapping {
  const availableHeaders = new Set(headers);

  return {
    name: normalizeHeader(initialMapping.name, availableHeaders),
    sku: normalizeHeader(initialMapping.sku, availableHeaders),
    barcode: normalizeHeader(
      initialMapping.barcode,
      availableHeaders,
    ),
    costPrice: normalizeHeader(
      initialMapping.costPrice,
      availableHeaders,
    ),
    sellingPrice: normalizeHeader(
      initialMapping.sellingPrice,
      availableHeaders,
    ),
    category: normalizeHeader(
      initialMapping.category,
      availableHeaders,
    ),
    description: normalizeHeader(
      initialMapping.description,
      availableHeaders,
    ),
    reorderLevel: normalizeHeader(
      initialMapping.reorderLevel,
      availableHeaders,
    ),
    quantity: normalizeHeader(
      initialMapping.quantity,
      availableHeaders,
    ),
  };
}

function normalizeHeader(
  value: string | null | undefined,
  availableHeaders: Set<string>,
): string | null {
  if (
    typeof value !== "string" ||
    !availableHeaders.has(value)
  ) {
    return null;
  }

  return value;
}

function getCellValue(
  row: ProductImportRow,
  header: string,
): unknown {
  return row.raw[header];
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString();
  }

  return "[Complex value]";
}

function getColumnPreview(
  rows: ProductImportRow[],
  header: string,
): string[] {
  const preview: string[] = [];

  for (const row of rows) {
    const value = formatCellValue(
      getCellValue(row, header),
    );

    if (value) {
      preview.push(value.slice(0, 120));
    }

    if (preview.length === 3) {
      break;
    }
  }

  return preview;
}

function hasDuplicateHeaders(headers: string[]): boolean {
  const seen = new Set<string>();

  for (const header of headers) {
    const normalized = header.trim().toLocaleLowerCase();

    if (!normalized || seen.has(normalized)) {
      return true;
    }

    seen.add(normalized);
  }

  return false;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export function ImportMappingStep({
  source,
  headers,
  rows,
  initialMapping,
  onBack,
  onContinue,
  disabled = false,
}: ImportMappingStepProps) {
  const [mapping, setMapping] =
    useState<ProductImportMapping>(() =>
      createInitialMapping(initialMapping, headers),
    );

  const [error, setError] = useState<string | null>(null);

  const [duplicateHeaders, setDuplicateHeaders] =
    useState(false);

  /*
   * Reinitialize mapping when the selected file or its
   * available columns change. This prevents stale mappings
   * from a previously selected file.
   */
  const headerSignature = useMemo(
    () => JSON.stringify(headers),
    [headers],
  );

  const mappingSignature = useMemo(
    () => JSON.stringify(
      MAPPING_FIELDS.map(
        (field) => initialMapping?.[field] ?? null,
      ),
    ),
    [initialMapping],
  );

  useEffect(() => {
    setMapping(
      createInitialMapping(initialMapping, headers),
    );

    setError(null);

    setDuplicateHeaders(
      hasDuplicateHeaders(headers),
    );
  }, [
    headerSignature,
    mappingSignature,
    headers,
    initialMapping,
  ]);

  const mappedHeaders = useMemo(() => {
    return new Set(
      Object.values(mapping).filter(
        (value): value is string =>
          typeof value === "string" && value.length > 0,
      ),
    );
  }, [mapping]);

  const updateMapping = useCallback(
    (
      field: ProductImportField,
      event: ChangeEvent<HTMLSelectElement>,
    ) => {
      const selectedHeader = event.currentTarget.value;

      setMapping((current) => {
        const next: ProductImportMapping = {
          ...current,
        };

        /*
         * A source column can map to only one canonical
         * field. Clear any previous assignment first.
         */
        if (selectedHeader) {
          for (const existingField of MAPPING_FIELDS) {
            if (
              existingField !== field &&
              next[existingField] === selectedHeader
            ) {
              next[existingField] = null;
            }
          }
        }

        next[field] = selectedHeader || null;

        return next;
      });

      setError(null);
    },
    [],
  );

  const missingRequired = useMemo(
    () =>
      MAPPING_OPTIONS.filter(
        (option) =>
          option.required &&
          !mapping[option.field],
      ),
    [mapping],
  );

  const handleContinue = useCallback(() => {
    if (disabled) {
      return;
    }

    if (headers.length === 0) {
      setError("No source columns are available to map.");
      return;
    }

    if (duplicateHeaders) {
      setError(
        "The file contains blank or duplicate column names. " +
        "Rename those columns or normalize them in the file parser before continuing.",
      );
      return;
    }

    if (rows.length === 0) {
      setError("The selected file contains no data rows.");
      return;
    }

    if (missingRequired.length > 0) {
      setError(
        `Map the required fields: ${missingRequired
          .map((field) => field.label)
          .join(", ")}.`,
      );

      return;
    }

    const assignedHeaders = Object.values(mapping).filter(
      (value): value is string => Boolean(value),
    );

    if (
      new Set(assignedHeaders).size !==
      assignedHeaders.length
    ) {
      setError(
        "Each source column can only be assigned to one product field.",
      );

      return;
    }

    try {
      onContinue({ ...mapping });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to continue with the selected mapping.",
      );
    }
  }, [
    disabled,
    duplicateHeaders,
    headers.length,
    mapping,
    missingRequired,
    onContinue,
    rows.length,
  ]);

  const unmappedHeaders = useMemo(
    () =>
      headers.filter(
        (header) => !mappedHeaders.has(header),
      ),
    [headers, mappedHeaders],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div
            className="
              flex size-10 shrink-0 items-center justify-center
              rounded-2xl border border-white/10
              bg-white/[0.06] text-emerald-400
            "
          >
            <Columns3 size={20} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">
              Map your catalogue
            </h2>

            <p className="mt-1 text-sm leading-5 text-neutral-400">
              Match each source column to its corresponding
              BizTru product field.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className="
              max-w-full truncate rounded-lg
              border border-white/10 bg-white/[0.04]
              px-2.5 py-1 text-xs text-neutral-400
            "
            title={source.fileName}
          >
            {source.fileName}
          </span>

          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-400">
            {rows.length} rows
          </span>

          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-400">
            {headers.length} columns
          </span>
        </div>
      </div>

      {/* =====================================================
          MAPPING LIST
          ===================================================== */}

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {MAPPING_OPTIONS.map((option) => {
            const selectedHeader = mapping[option.field];

            const preview = selectedHeader
              ? getColumnPreview(rows, selectedHeader)
              : [];

            const isMapped = Boolean(selectedHeader);

            const selectId = `product-import-${option.field}`;

            return (
              <GlassCard
                key={option.field}
                className={[
                  "p-4 transition-colors",
                  isMapped
                    ? "border-emerald-400/10"
                    : option.required
                      ? "border-amber-400/10"
                      : "",
                ].join(" ")}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  {/* Canonical field */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-white"
                      >
                        {option.label}
                      </label>

                      {option.required && (
                        <span className="rounded-md border border-red-400/20 bg-red-400/[0.06] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-300">
                          Required
                        </span>
                      )}

                      {isMapped && (
                        <span
                          aria-label="Mapped"
                          className="
                            flex size-5 items-center justify-center
                            rounded-full bg-emerald-400/10
                            text-emerald-400
                          "
                        >
                          <Check size={12} />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {option.description}
                    </p>
                  </div>

                  {/* Source column selector */}

                  <div className="relative w-full lg:w-[280px]">
                    <select
                      id={selectId}
                      name={option.field}
                      value={selectedHeader ?? ""}
                      onChange={(event) =>
                        updateMapping(option.field, event)
                      }
                      disabled={disabled || duplicateHeaders}
                      aria-invalid={
                        option.required && !isMapped
                      }
                      aria-describedby={`${selectId}-description`}
                      className="
                        h-11 w-full appearance-none rounded-xl
                        border border-white/10 bg-neutral-900
                        px-3 pr-9 text-sm text-white
                        outline-none transition-colors
                        hover:border-white/20
                        focus:border-emerald-400/40
                        focus:ring-2 focus:ring-emerald-400/10
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <option
                        value=""
                        className="bg-neutral-900 text-neutral-400"
                      >
                        Do not import
                      </option>

                      {headers.map((header) => {
                        const alreadyUsed =
                          mappedHeaders.has(header) &&
                          header !== selectedHeader;

                        return (
                          <option
                            key={header}
                            value={header}
                            disabled={alreadyUsed}
                            className="bg-neutral-900 text-white"
                          >
                            {header}
                            {alreadyUsed
                              ? " — already mapped"
                              : ""}
                          </option>
                        );
                      })}
                    </select>

                    <span
                      id={`${selectId}-description`}
                      className="sr-only"
                    >
                      Select the source column for {option.label}.
                    </span>

                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className="
                        pointer-events-none absolute right-3
                        top-1/2 -translate-y-1/2 text-neutral-500
                      "
                    />
                  </div>
                </div>

                {/* Source value preview */}

                {preview.length > 0 && (
                  <div className="mt-4 border-t border-white/[0.06] pt-3">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 pt-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                        Preview
                      </span>

                      <div className="flex min-w-0 flex-1 flex-wrap gap-2">
                        {preview.map((value, index) => (
                          <span
                            key={`${index}-${value}`}
                            title={value}
                            className="
                              max-w-full truncate rounded-lg
                              border border-white/[0.06]
                              bg-black/10 px-2 py-1
                              text-[11px] text-neutral-500
                            "
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>

        {/* Unmapped source columns */}

        {unmappedHeaders.length > 0 && (
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-start gap-3">
              <HelpCircle
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-neutral-500"
              />

              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-300">
                  {unmappedHeaders.length} unmapped{" "}
                  {unmappedHeaders.length === 1
                    ? "column"
                    : "columns"}
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  These columns will be ignored. Confirm that
                  they do not contain product or inventory
                  information you need to import.
                </p>

                <p className="mt-2 break-words text-xs text-neutral-400">
                  {unmappedHeaders.join(", ")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation error */}

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="
              mt-4 rounded-2xl border border-red-400/20
              bg-red-400/[0.06] px-4 py-3
            "
          >
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          FOOTER
          ===================================================== */}

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
        <GlassButton
          type="button"
          variant='tertiary'
          onClick={onBack}
          disabled={disabled}
        >
          <ArrowLeft size={16} />
          Back
        </GlassButton>

        <GlassButton
          type="button"
          onClick={handleContinue}
          disabled={disabled || duplicateHeaders}
          className="min-w-[150px]"
        >
          Continue
          <ArrowRight size={16} />
        </GlassButton>
      </div>
    </div>
  );
}