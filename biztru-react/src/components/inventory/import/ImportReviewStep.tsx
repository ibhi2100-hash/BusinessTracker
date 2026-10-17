import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Filter,
  Package,
  Search,
  XCircle,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import { GlassButton } from "../../../components/ui/GlassButton";
import { GlassCard } from "../../../components/ui/GlassCard";

import type {
  ProductImportIssue,
  ProductImportSummary,
  ValidatedProductImportRow,
} from "@business/shared-types";

export type ImportReviewFilter =
  | "ALL"
  | "VALID"
  | "ERRORS"
  | "WARNINGS";

export interface ImportReviewStepProps {
  rows: ValidatedProductImportRow[];
  summary: ProductImportSummary;

  onBack: () => void;

  onApprove: () => void;

  disabled?: boolean;
}

function formatMoney(
  value: number | null,
): string {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

function getIssueCount(
  row: ValidatedProductImportRow,
  severity?: ProductImportIssue["severity"],
): number {
  if (!severity) {
    return row.issues.length;
  }

  return row.issues.filter(
    (issue) => issue.severity === severity,
  ).length;
}

function getIssueIcon(
  issue: ProductImportIssue,
) {
  if (issue.severity === "ERROR") {
    return (
      <XCircle
        size={14}
        className="shrink-0 text-red-400"
      />
    );
  }

  return (
    <AlertTriangle
      size={14}
      className="shrink-0 text-amber-400"
    />
  );
}

function matchesFilter(
  row: ValidatedProductImportRow,
  filter: ImportReviewFilter,
): boolean {
  switch (filter) {
    case "VALID":
      return row.valid;

    case "ERRORS":
      return row.issues.some(
        (issue) => issue.severity === "ERROR",
      );

    case "WARNINGS":
      return row.issues.some(
        (issue) => issue.severity === "WARNING",
      );

    case "ALL":
    default:
      return true;
  }
}

function matchesSearch(
  row: ValidatedProductImportRow,
  search: string,
): boolean {
  if (!search.trim()) {
    return true;
  }

  const query = search.trim().toLocaleLowerCase("en");

  const searchable = [
    row.row.name,
    row.row.sku,
    row.row.barcode,
    row.row.category,
    row.row.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en");

  return searchable.includes(query);
}

export function ImportReviewStep({
  rows,
  summary,
  onBack,
  onApprove,
  disabled = false,
}: ImportReviewStepProps) {
  const [filter, setFilter] =
    useState<ImportReviewFilter>("ALL");

  const [search, setSearch] = useState("");

  const [selectedRowNumber, setSelectedRowNumber] =
    useState<number | null>(null);

  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) =>
        matchesFilter(row, filter) &&
        matchesSearch(row, search),
    );
  }, [rows, filter, search]);

  const selectedRow = useMemo(() => {
    if (selectedRowNumber == null) {
      return null;
    }

    return (
      rows.find(
        (row) =>
          row.row.rowNumber === selectedRowNumber,
      ) ?? null
    );
  }, [rows, selectedRowNumber]);

  const hasErrors = summary.invalidRows > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-emerald-400">
            <Package
              size={20}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">
              Review your import
            </h2>

            <p className="mt-1 text-sm leading-5 text-neutral-400">
              Check the products BizTru is ready to
              import before anything changes.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <SummaryCard
          label="Total"
          value={summary.totalRows}
          icon={
            <Package
              size={15}
              strokeWidth={1.8}
            />
          }
        />

        <SummaryCard
          label="Ready"
          value={summary.validRows}
          icon={
            <CheckCircle2
              size={15}
              strokeWidth={1.8}
            />
          }
          positive
        />

        <SummaryCard
          label="Errors"
          value={summary.invalidRows}
          icon={
            <XCircle
              size={15}
              strokeWidth={1.8}
            />
          }
          negative={summary.invalidRows > 0}
        />

        <SummaryCard
          label="Duplicates"
          value={summary.duplicateRows}
          icon={
            <CircleAlert
              size={15}
              strokeWidth={1.8}
            />
          }
          warning={summary.duplicateRows > 0}
        />
      </div>

      {/* Search + filters */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search products, SKU, barcode..."
            disabled={disabled}
            className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-9 pr-3 text-sm text-white outline-none placeholder:text-neutral-600 transition-colors focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/10 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.025] p-1">
          <Filter
            size={14}
            className="ml-2 mr-1 shrink-0 text-neutral-600"
          />

          <FilterButton
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            disabled={disabled}
          >
            All
          </FilterButton>

          <FilterButton
            active={filter === "VALID"}
            onClick={() => setFilter("VALID")}
            disabled={disabled}
          >
            Ready
          </FilterButton>

          <FilterButton
            active={filter === "ERRORS"}
            onClick={() => setFilter("ERRORS")}
            disabled={disabled}
          >
            Errors
          </FilterButton>

          <FilterButton
            active={filter === "WARNINGS"}
            onClick={() => setFilter("WARNINGS")}
            disabled={disabled}
          >
            Warnings
          </FilterButton>
        </div>
      </div>

      {/* Main review area */}
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.015]">
        <div className="h-full overflow-auto">
          {filteredRows.length === 0 ? (
            <EmptyReviewState
              hasRows={rows.length > 0}
            />
          ) : (
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-white/[0.07] bg-neutral-950/95 backdrop-blur-xl">
                <tr>
                  <th className="w-14 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    #
                  </th>

                  <th className="min-w-[220px] px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    Product
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    SKU
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    Cost
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    Price
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    Qty
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((item) => {
                  const isSelected =
                    selectedRowNumber ===
                    item.row.rowNumber;

                  const errorCount =
                    getIssueCount(item, "ERROR");

                  const warningCount =
                    getIssueCount(item, "WARNING");

                  return (
                    <tr
                      key={item.row.rowNumber}
                      onClick={() =>
                        setSelectedRowNumber(
                          item.row.rowNumber,
                        )
                      }
                      className={[
                        "cursor-pointer border-b border-white/[0.04] transition-colors",
                        isSelected
                          ? "bg-emerald-400/[0.06]"
                          : "hover:bg-white/[0.025]",
                      ].join(" ")}
                    >
                      <td className="px-4 py-3 text-xs tabular-nums text-neutral-600">
                        {item.row.rowNumber}
                      </td>

                      <td className="px-4 py-3">
                        <div className="min-w-0">
                          <p className="max-w-[260px] truncate text-sm font-medium text-neutral-200">
                            {item.row.name ??
                              "Unnamed product"}
                          </p>

                          {item.row.category && (
                            <p className="mt-0.5 max-w-[260px] truncate text-xs text-neutral-600">
                              {item.row.category}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {item.row.sku ?? "—"}
                      </td>

                      <td className="px-4 py-3 text-xs tabular-nums text-neutral-400">
                        {formatMoney(
                          item.row.costPrice,
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs tabular-nums text-neutral-300">
                        {formatMoney(
                          item.row.sellingPrice,
                        )}
                      </td>

                      <td className="px-4 py-3 text-xs tabular-nums text-neutral-500">
                        {item.row.quantity ?? "—"}
                      </td>

                      <td className="px-4 py-3">
                        {item.valid ? (
                          warningCount > 0 ? (
                            <StatusBadge
                              type="WARNING"
                              label={`${warningCount} warning${warningCount === 1 ? "" : "s"}`}
                            />
                          ) : (
                            <StatusBadge
                              type="READY"
                              label="Ready"
                            />
                          )
                        ) : (
                          <StatusBadge
                            type="ERROR"
                            label={`${errorCount} error${errorCount === 1 ? "" : "s"}`}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Selected row details */}
      {selectedRow && (
        <GlassCard className="mt-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">
                  Row {selectedRow.row.rowNumber}
                </p>

                {selectedRow.row.name && (
                  <>
                    <span className="text-neutral-700">
                      /
                    </span>

                    <p className="truncate text-sm text-neutral-400">
                      {selectedRow.row.name}
                    </p>
                  </>
                )}
              </div>

              {selectedRow.issues.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {selectedRow.issues.map(
                    (issue, index) => (
                      <div
                        key={`${issue.code}-${index}`}
                        className="flex items-start gap-2"
                      >
                        {getIssueIcon(issue)}

                        <div className="min-w-0">
                          <p
                            className={[
                              "text-xs",
                              issue.severity ===
                              "ERROR"
                                ? "text-red-300"
                                : "text-amber-300",
                            ].join(" ")}
                          >
                            {issue.message}
                          </p>

                          {issue.field && (
                            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-600">
                              {issue.field}
                            </p>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <p className="mt-2 text-xs text-neutral-500">
                  No validation issues found for this
                  row.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                setSelectedRowNumber(null)
              }
              className="flex size-7 shrink-0 items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-white/[0.06] hover:text-white"
              aria-label="Close row details"
            >
              <AlertCircle
                size={15}
              />
            </button>
          </div>
        </GlassCard>
      )}

      {/* Approval warning */}
      {hasErrors && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3">
          <AlertTriangle
            size={17}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>
            <p className="text-xs font-medium text-red-300">
              This import cannot be approved yet
            </p>

            <p className="mt-1 text-xs leading-5 text-red-300/60">
              Fix the rows with errors before continuing.
              BizTru will not silently discard invalid
              products.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-5">
        <GlassButton
          type="button"
          variant="tertiary"
          onClick={onBack}
          disabled={disabled}
        >
          <ArrowLeft size={16} />
          Back
        </GlassButton>

        <div className="flex items-center gap-3">
          <p className="hidden text-xs text-neutral-600 sm:block">
            {filteredRows.length} of {rows.length} rows
            shown
          </p>

          <GlassButton
            type="button"
            onClick={onApprove}
            disabled={disabled || hasErrors}
            className="min-w-[170px]"
          >
            Review complete
            <ArrowRight size={16} />
          </GlassButton>
        </div>
      </div>
    </div>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  positive?: boolean;
  negative?: boolean;
  warning?: boolean;
}

function SummaryCard({
  label,
  value,
  icon,
  positive,
  negative,
  warning,
}: SummaryCardProps) {
  const iconClass = negative
    ? "text-red-400"
    : warning
      ? "text-amber-400"
      : positive
        ? "text-emerald-400"
        : "text-neutral-500";

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3.5 py-3">
      <div className="flex items-center gap-2">
        <span className={iconClass}>
          {icon}
        </span>

        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">
          {label}
        </span>
      </div>

      <p className="mt-1.5 text-lg font-semibold tabular-nums text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}

interface FilterButtonProps {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterButton({
  active,
  disabled,
  onClick,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "shrink-0 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
        active
          ? "bg-white/[0.08] text-white"
          : "text-neutral-600 hover:text-neutral-300",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

interface StatusBadgeProps {
  type: "READY" | "WARNING" | "ERROR";
  label: string;
}

function StatusBadge({
  type,
  label,
}: StatusBadgeProps) {
  const classes =
    type === "READY"
      ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
      : type === "WARNING"
        ? "border-amber-400/15 bg-amber-400/[0.06] text-amber-300"
        : "border-red-400/15 bg-red-400/[0.06] text-red-300";

  const Icon =
    type === "READY"
      ? CheckCircle2
      : type === "WARNING"
        ? AlertTriangle
        : XCircle;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-1",
        "text-[10px] font-medium",
        classes,
      ].join(" ")}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function EmptyReviewState({
  hasRows,
}: {
  hasRows: boolean;
}) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-neutral-500">
        <Search size={20} />
      </div>

      <p className="mt-4 text-sm font-medium text-neutral-300">
        {hasRows
          ? "No matching products"
          : "Nothing to review"}
      </p>

      <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-600">
        {hasRows
          ? "Try another search or remove the active filter."
          : "No product rows were produced by the import."}
      </p>
    </div>
  );
}