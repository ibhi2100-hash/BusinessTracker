import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Columns3,
  HelpCircle,
} from "lucide-react";
import {
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

  initialMapping: Partial<
    Record<ProductImportField, string>
  >;

  onBack: () => void;

  onContinue: (
    mapping: ProductImportMapping,
  ) => void;

  disabled?: boolean;
}

type MappingOption = {
  field: ProductImportField;
  label: string;
  description: string;
  required?: boolean;
};

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
    description: "Stock level at which replenishment is needed.",
  },
  {
    field: "quantity",
    label: "Opening quantity",
    description: "Initial stock for the selected branch.",
  },
];

function createInitialMapping(
  initialMapping: Partial<
    Record<ProductImportField, string>
  >,
): ProductImportMapping {
  return {
    name: initialMapping.name ?? null,
    sku: initialMapping.sku ?? null,
    barcode: initialMapping.barcode ?? null,
    costPrice: initialMapping.costPrice ?? null,
    sellingPrice: initialMapping.sellingPrice ?? null,
    category: initialMapping.category ?? null,
    description: initialMapping.description ?? null,
    reorderLevel: initialMapping.reorderLevel ?? null,
    quantity: initialMapping.quantity ?? null,
  };
}

function getColumnPreview(
  rows: ProductImportRow[],
  header: string,
): string[] {
  return rows
    .slice(0, 3)
    .map((row) => row.raw[header])
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== "",
    )
    .map((value) => String(value));
}

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
      createInitialMapping(initialMapping),
    );

  const [error, setError] = useState<string | null>(
    null,
  );

  const mappedHeaders = useMemo(
    () =>
      new Set(
        Object.values(mapping).filter(
          (value): value is string => Boolean(value),
        ),
      ),
    [mapping],
  );

  const updateMapping = (
    field: ProductImportField,
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = event.target.value;

    setMapping((current) => ({
      ...current,
      [field]: value || null,
    }));

    setError(null);
  };

  const handleContinue = () => {
    const missingRequired = MAPPING_OPTIONS.filter(
      (option) =>
        option.required &&
        !mapping[option.field],
    );

    if (missingRequired.length > 0) {
      setError(
        `Map the required fields: ${missingRequired
          .map((field) => field.label)
          .join(", ")}.`,
      );

      return;
    }

    onContinue(mapping);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-emerald-400">
            <Columns3
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">
              Map your catalogue
            </h2>

            <p className="mt-1 text-sm leading-5 text-neutral-400">
              Tell BizTru which columns contain each
              product field.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-neutral-400">
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

      {/* Mapping list */}
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="space-y-2">
          {MAPPING_OPTIONS.map((option) => {
            const selectedHeader =
              mapping[option.field];

            const preview = selectedHeader
              ? getColumnPreview(rows, selectedHeader)
              : [];

            const isMapped = Boolean(selectedHeader);

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
                  {/* BizTru field */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">
                        {option.label}
                      </span>

                      {option.required && (
                        <span className="rounded-md border border-red-400/20 bg-red-400/[0.06] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-300">
                          Required
                        </span>
                      )}

                      {isMapped && (
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                          <Check size={12} />
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {option.description}
                    </p>
                  </div>

                  {/* Mapping select */}
                  <div className="relative w-full lg:w-[280px]">
                    <select
                      value={selectedHeader ?? ""}
                      onChange={(event) =>
                        updateMapping(
                          option.field,
                          event,
                        )
                      }
                      disabled={disabled}
                      className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-3 pr-9 text-sm text-white outline-none transition-colors hover:border-white/20 focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-50"
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

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500"
                    />
                  </div>
                </div>

                {/* Source preview */}
                {preview.length > 0 && (
                  <div className="mt-4 border-t border-white/[0.06] pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                        Preview
                      </span>

                      <div className="flex min-w-0 flex-1 gap-2 overflow-hidden">
                        {preview.map((value, index) => (
                          <span
                            key={`${value}-${index}`}
                            className="max-w-[220px] truncate rounded-lg border border-white/[0.06] bg-black/10 px-2 py-1 text-[11px] text-neutral-500"
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

        {/* Unmapped columns */}
        {headers.some(
          (header) => !mappedHeaders.has(header),
        ) && (
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
            <div className="flex items-start gap-3">
              <HelpCircle
                size={16}
                className="mt-0.5 shrink-0 text-neutral-500"
              />

              <div className="min-w-0">
                <p className="text-xs font-medium text-neutral-300">
                  Some columns will not be imported
                </p>

                <p className="mt-1 text-xs leading-5 text-neutral-500">
                  This is safe. Columns that do not contain
                  BizTru product information can simply be
                  left unmapped.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3"
          >
            <p className="text-sm text-red-300">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
        <GlassButton
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={disabled}
        >
          <ArrowLeft size={16} />
          Back
        </GlassButton>

        <GlassButton
          type="button"
          onClick={handleContinue}
          disabled={disabled}
          className="min-w-[150px]"
        >
          Continue
          <ArrowRight size={16} />
        </GlassButton>
      </div>
    </div>
  );
}