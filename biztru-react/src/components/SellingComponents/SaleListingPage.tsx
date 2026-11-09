import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Receipt,
  Filter,
  RefreshCw,
  ShoppingBag,
  RotateCcw,
  Copy,
  Check,
  AlertTriangle,
  PackageCheck,
  Banknote,
  ChevronRight,
  Printer,
  Building2,
  BarChart3,
  ListFilter,
} from "lucide-react";

import { GlassCard } from "../ui/GlassCard";
import { GlassButton } from "../ui/GlassButton";
import { GlassInput } from "../ui/GlassInput";
import { GlassIcon } from "../ui/GlassIcon";
import { GlassSheet } from "../ui/GlassSheet";
import SalesAnalysisPage from "./SalesAnalysisPage";
import { cn } from "../../lib/utils";

import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";
import { useBusinessContext } from "../../Biztru/context/BusinessContext";

import type { SaleFilters } from "../../Biztru/services/ApplicationService/API/Sales/SalesApi";
import type {
  Sales,
  Business,
  Branch,
} from "@business/shared-types";

import { useBusinessLiveQuery } from "../../hooks/useBusinessLiveQuery";
import { useBranchLiveQuery } from "../../hooks/useBranches";

type StatusFilter = "all" | "completed" | "voided" | "refunded";
type DateRangeFilter = "all" | "today" | "7days" | "30days" | "yearly";

type RefundFormState = {
  quantity: string;
  reason: string;
};

type SaleWithBranch = Sales & {
  branchId?: string | null;
};

type ReceiptDetails = {
  receiptNumber: string;

  businessId: string;
  businessName: string;
  businessAddress: string;

  branchId: string;
  branchName: string;
  branchAddress: string;
  branchPhone: string;

  employeeName: string;
  employeeId: string;
};

const EMPTY_REFUND_FORM: RefundFormState = {
  quantity: "1",
  reason: "",
};

// ---------------------------------------------------------
// Formatting
// ---------------------------------------------------------

function formatNaira(value: number) {
  const amount = Number.isFinite(value) ? value : 0;

  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string | number) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Builds inclusive local-calendar date boundaries and converts them to ISO.
 * "7 days" and "30 days" include today plus the preceding 6 or 29 days.
 * "Yearly" means the current calendar year through the end of today.
 */
function getLocalDateRange(
  range: DateRangeFilter,
  now: Date = new Date()
): { from?: string; to?: string } {
  if (range === "all") return {};

  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  );

  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  );

  switch (range) {
    case "today":
      break;
    case "7days":
      start.setDate(start.getDate() - 6);
      break;
    case "30days":
      start.setDate(start.getDate() - 29);
      break;
    case "yearly":
      start.setMonth(0, 1);
      break;
    default:
      return {};
  }

  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

function readText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---------------------------------------------------------
// Sale calculations
// ---------------------------------------------------------

function getSaleCost(sale: Sales): number {
  const cost = Number((sale as any).costPrice ?? 0);

  return Number.isFinite(cost) ? Math.max(0, cost) : 0;
}

function getSaleProfit(sale: Sales): number {
  const profit = (sale as any).profit;

  if (typeof profit === "number" && Number.isFinite(profit)) {
    return profit;
  }

  return sale.total - getSaleCost(sale);
}

function getSaleQuantity(sale: Sales): number {
  const quantity = Number(sale.quantity);

  return Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
}

function getSaleTotal(sale: Sales): number {
  const total = Number(sale.total);

  return Number.isFinite(total) ? Math.max(0, total) : 0;
}

function getUnitAmount(sale: Sales): number {
  const quantity = getSaleQuantity(sale);

  return quantity > 0 ? getSaleTotal(sale) / quantity : 0;
}

// ---------------------------------------------------------
// Receipt details
// ---------------------------------------------------------

/**
 * Resolves receipt information using authoritative live-query
 * business and branch records.
 *
 * IMPORTANT:
 * The branch is resolved using the branchId stored on the sale.
 * This ensures historical receipts show the correct branch,
 * even if the user has switched to another branch.
 */
function getReceiptDetails(
  sale: SaleWithBranch,
  business: Business | null | undefined,
  branches: Branch[] | null,
  currentBranchId?: string | null
): ReceiptDetails {
  const record = sale as any;

  // Prefer the branch recorded on the actual sale.
  // Only fall back to the currently selected branch when
  // the sale does not contain a branchId.
  const actualBranchId =
    sale.branchId ?? currentBranchId ?? "";

  // Find the exact branch belonging to this business.
  const branch =
    branches?.find(
      (item) =>
        item.id === actualBranchId &&
        item.businessId === sale.businessId
    ) ?? null;

  // Employee information remains sourced from the sale.
  const employee =
    record.employee ??
    record.cashier ??
    record.soldBy ??
    record.createdBy ??
    {};

  return {
    receiptNumber: readText(
      record.receiptNumber,
      record.receiptNo,
      record.receiptId,
      record.invoiceNumber,
      record.transactionNumber,
      record.id
    ),

    businessId: business?.id ?? sale.businessId ?? "",

    businessName:
      readText(business?.name) ||
      "Business name not available",

    businessAddress:
      readText(business?.address),

    branchId: actualBranchId,

    branchName:
      readText(branch?.name) ||
      "Branch details not available",

    branchAddress:
      readText(branch?.address),

    branchPhone:
      readText(branch?.phone),

    employeeName:
      readText(
        record.employeeName,
        record.cashierName,
        record.soldByName,
        record.createdByName,
        employee.name,
        employee.fullName,
        employee.displayName
      ) || "Employee details not available",

    employeeId:
      readText(
        record.employeeId,
        record.cashierId,
        record.soldById,
        record.createdById,
        employee.id,
        employee.userId
      ),
  };
}

// ---------------------------------------------------------
// Status
// ---------------------------------------------------------

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    voided:
      "bg-red-500/10 text-red-400 border-red-500/20",
    refunded:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full",
        "text-[10px] font-medium border capitalize whitespace-nowrap",
        styles[status] ??
          "bg-white/5 text-gray-400 border-white/10"
      )}
    >
      {status}
    </span>
  );
}

// ---------------------------------------------------------
// Reusable fields
// ---------------------------------------------------------

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-2">
      <span className="text-gray-400 shrink-0">
        {label}
      </span>

      <span
        className={cn(
          "text-right text-white break-words min-w-0",
          mono && "font-mono text-xs"
        )}
      >
        {value}
      </span>
    </div>
  );
}

// =========================================================
// SALES PAGE
// =========================================================

export default function SalesListPage() {
  const app = useApplication();

  const { businessId, branchId } = useBusinessContext();

  // -------------------------------------------------------
  // IMPORTANT: Live query hooks MUST be at component level.
  // Never call these inside load(), useEffect(), or callbacks.
  // -------------------------------------------------------

  const { data: business } = useBusinessLiveQuery(
    businessId
  );

  const { data: branches } = useBranchLiveQuery(
    businessId
  );

  // -------------------------------------------------------
  // State
  // -------------------------------------------------------

  const [sales, setSales] = useState<Sales[]>([]);
  const [activeView, setActiveView] = useState<"sales" | "analysis">("sales");
  const [analysisSales, setAnalysisSales] = useState<Sales[]>([]);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [dateRange, setDateRange] =
    useState<DateRangeFilter>("all");

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [selected, setSelected] = useState<Sales | null>(
    null
  );

  const [filterOpen, setFilterOpen] = useState(false);

  const [refundOpen, setRefundOpen] = useState(false);

  const [refundForm, setRefundForm] =
    useState<RefundFormState>(EMPTY_REFUND_FORM);

  const [refundError, setRefundError] = useState<
    string | null
  >(null);

  const [refundSuccess, setRefundSuccess] = useState<
    string | null
  >(null);

  const [isRefunding, setIsRefunding] = useState(false);

  const [copied, setCopied] = useState(false);

  const [receiptOpen, setReceiptOpen] = useState(false);

  const [receiptError, setReceiptError] = useState<
    string | null
  >(null);

  // -------------------------------------------------------
  // Load sales
  // -------------------------------------------------------

  const load = useCallback(async () => {
    if (!businessId) {
      setSales([]);
      setLoading(false);

      setLoadError(
        "A business must be selected before loading sales."
      );

      return;
    }

    try {
      setLoading(true);
      setLoadError(null);

      const quickDateRange = getLocalDateRange(dateRange);

      const filters: SaleFilters = {
        branchId: branchId ?? undefined,
        businessId,
        status,
        // Explicit custom dates take precedence over quick date filters.
        from: from || quickDateRange.from,
        to: to || quickDateRange.to,
        limit: 200,
      };

      const rows = await app.sales.listSales(filters);

      setSales(rows);
    } catch (error) {
      console.error(
        "[SalesListPage] Failed to load sales:",
        error
      );

      setLoadError(
        "Unable to load sales. Check your local database and try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    app,
    businessId,
    branchId,
    status,
    dateRange,
    from,
    to,
  ]);

  useEffect(() => {
    void load();
  }, [load]);


  // Analysis always loads all sale statuses so refunded and voided
  // transactions are not accidentally hidden by the list status filter.
  const loadAnalysis = useCallback(async () => {
    if (!businessId) {
      setAnalysisSales([]);
      setAnalysisError("A business must be selected before loading sales analysis.");
      setAnalysisLoading(false);
      return;
    }

    try {
      setAnalysisLoading(true);
      setAnalysisError(null);
      const quickDateRange = getLocalDateRange(dateRange);
      const rows = await app.sales.listSales({
        branchId: branchId ?? undefined,
        businessId,
        status: "all",
        from: from || quickDateRange.from,
        to: to || quickDateRange.to,
        limit: 200,
      });
      setAnalysisSales(rows);
    } catch (error) {
      console.error("[SalesListPage] Failed to load sales analysis:", error);
      setAnalysisError("Unable to load sales analysis. Check your local database and try again.");
    } finally {
      setAnalysisLoading(false);
    }
  }, [app, businessId, branchId, dateRange, from, to]);

  useEffect(() => {
    if (activeView !== "analysis") return;
    let cancelled = false;

    const run = async () => {
      if (!businessId) {
        setAnalysisSales([]);
        setAnalysisError("A business must be selected before loading sales analysis.");
        return;
      }
      try {
        setAnalysisLoading(true);
        setAnalysisError(null);
        const quickDateRange = getLocalDateRange(dateRange);
        const rows = await app.sales.listSales({
          branchId: branchId ?? undefined,
          businessId,
          status: "all",
          from: from || quickDateRange.from,
          to: to || quickDateRange.to,
          limit: 200,
        });
        if (!cancelled) setAnalysisSales(rows);
      } catch (error) {
        console.error("[SalesListPage] Failed to load sales analysis:", error);
        if (!cancelled) setAnalysisError("Unable to load sales analysis. Check your local database and try again.");
      } finally {
        if (!cancelled) setAnalysisLoading(false);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, [activeView, app, businessId, branchId, dateRange, from, to]);

  const activeBranchName = branchId
    ? branches?.find((branch) => branch.id === branchId)?.name ?? "Selected branch"
    : "All branches";

  // -------------------------------------------------------
  // Filter sales
  // -------------------------------------------------------

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return sales;

    return sales.filter((sale) => {
      return (
        sale.productName?.toLowerCase().includes(query) ||
        sale.productId?.toLowerCase().includes(query) ||
        sale.customerRef?.toLowerCase().includes(query) ||
        sale.id?.toLowerCase().includes(query)
      );
    });
  }, [sales, search]);

  const pageTotal = useMemo(
    () =>
      filtered
        .filter((sale) => sale.status === "completed")
        .reduce(
          (sum, sale) => sum + getSaleTotal(sale),
          0
        ),
    [filtered]
  );

  // Always use the latest local sale projection.
  const selectedSale = useMemo(() => {
    if (!selected) return null;

    return (
      sales.find((sale) => sale.id === selected.id) ??
      selected
    );
  }, [sales, selected]);

  // -------------------------------------------------------
  // Resolve receipt details from live business and branches.
  // -------------------------------------------------------

  const receiptDetails = useMemo(() => {
    if (!selectedSale || !businessId) {
      return null;
    }

    return getReceiptDetails(
      selectedSale as SaleWithBranch,
      business,
      branches,
      branchId
    );
  }, [
    selectedSale,
    businessId,
    business,
    branches,
    branchId,
  ]);

  // -------------------------------------------------------
  // Receipt preview
  // -------------------------------------------------------

  const openReceiptPreview = useCallback(() => {
    if (!selectedSale) return;

    setReceiptError(null);
    setReceiptOpen(true);
  }, [selectedSale]);

  // -------------------------------------------------------
  // Print receipt
  // -------------------------------------------------------

  const printReceipt = useCallback(() => {
    if (!selectedSale || !receiptDetails) return;

    // Do not print incomplete business information.
    if (
      !business ||
      !business.name ||
      !receiptDetails.businessName ||
      receiptDetails.businessName ===
        "Business name not available"
    ) {
      setReceiptError(
        "Business information is still loading or unavailable. Please refresh and try again."
      );

      return;
    }

    // Open synchronously inside the click handler.
    const printWindow = window.open(
      "",
      "_blank",
      "width=480,height=760"
    );

    if (!printWindow) {
      setReceiptError(
        "The receipt window was blocked. Allow pop-ups for this app and try again."
      );

      return;
    }

    const sale = selectedSale;

    const itemName = readText(
      sale.productName,
      sale.productId
    );

    const details = receiptDetails;

    const businessLines = [
      details.businessAddress,
      details.branchName &&
      details.branchName !== "Branch details not available"
        ? `Branch: ${details.branchName}`
        : "",
      details.branchAddress
        ? `Branch address: ${details.branchAddress}`
        : "",
      details.branchPhone
        ? `Tel: ${details.branchPhone}`
        : "",
    ].filter(Boolean);

    const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Receipt ${escapeHtml(details.receiptNumber)}</title>

<style>
  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 24px;
    color: #111;
    background: #fff;
    font: 13px/1.45 Arial, Helvetica, sans-serif;
  }

  .receipt {
    max-width: 360px;
    margin: 0 auto;
  }

  .center { text-align: center; }

  h1 {
    font-size: 20px;
    margin: 0 0 5px;
    overflow-wrap: anywhere;
  }

  .muted { color: #555; }

  .rule {
    border: 0;
    border-top: 1px dashed #999;
    margin: 14px 0;
  }

  .row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin: 7px 0;
  }

  .row span:last-child {
    text-align: right;
    overflow-wrap: anywhere;
  }

  .item { margin: 14px 0; }

  .total {
    font-weight: 700;
    font-size: 17px;
  }

  .small { font-size: 11px; }

  .actions {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin: 24px auto 0;
  }

  button {
    border: 0;
    border-radius: 8px;
    padding: 10px 16px;
    background: #111;
    color: #fff;
    cursor: pointer;
  }

  @media print {
    body { padding: 0; }
    .actions { display: none !important; }
    @page { margin: 8mm; }
  }
</style>
</head>

<body>
  <main class="receipt">

    <header class="center">
      <h1>${escapeHtml(details.businessName)}</h1>

      ${businessLines
        .map(
          (line) =>
            `<div class="muted small">${escapeHtml(line)}</div>`
        )
        .join("")}

      <p><strong>SALES RECEIPT</strong></p>
    </header>

    <hr class="rule" />

    <div class="row">
      <span>Receipt no.</span>
      <span>${escapeHtml(details.receiptNumber)}</span>
    </div>

    <div class="row">
      <span>Date</span>
      <span>${escapeHtml(formatDate(sale.createdAt))}</span>
    </div>

    <div class="row">
      <span>Sale status</span>
      <span>${escapeHtml(String(sale.status))}</span>
    </div>

    <div class="row">
      <span>Employee</span>
      <span>${escapeHtml(details.employeeName)}</span>
    </div>

    ${
      details.employeeId
        ? `<div class="row">
            <span>Employee ID</span>
            <span>${escapeHtml(details.employeeId)}</span>
          </div>`
        : ""
    }

    ${
      sale.customerRef
        ? `<div class="row">
            <span>Customer</span>
            <span>${escapeHtml(String(sale.customerRef))}</span>
          </div>`
        : ""
    }

    ${
      sale.paymentMethod
        ? `<div class="row">
            <span>Payment</span>
            <span>${escapeHtml(String(sale.paymentMethod))}</span>
          </div>`
        : ""
    }

    <hr class="rule" />

    <div class="item">
      <div><strong>${escapeHtml(itemName)}</strong></div>

      <div class="row">
        <span>
          ${escapeHtml(String(sale.quantity))}
          ×
          ${escapeHtml(formatNaira(getUnitAmount(sale)))}
        </span>

        <span>${escapeHtml(formatNaira(getSaleTotal(sale)))}</span>
      </div>
    </div>

    <hr class="rule" />

    <div class="row total">
      <span>Total</span>
      <span>${escapeHtml(formatNaira(getSaleTotal(sale)))}</span>
    </div>

    <hr class="rule" />

    <p class="center small">
      Thank you for your business.
    </p>

    <p class="center small muted">
      Sale reference: ${escapeHtml(sale.id)}
    </p>

    <div class="actions">
      <button onclick="window.print()">Print receipt</button>
      <button onclick="window.close()">Close</button>
    </div>

  </main>
</body>
</html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }, [
    selectedSale,
    receiptDetails,
    business,
  ]);

  // -------------------------------------------------------
  // Refund calculations
  // -------------------------------------------------------

  const canRefund =
    selectedSale?.status === "completed" &&
    getSaleQuantity(selectedSale) > 0 &&
    getSaleTotal(selectedSale) > 0;

  const refundQuantity = Number(refundForm.quantity);

  const availableQuantity = selectedSale
    ? getSaleQuantity(selectedSale)
    : 0;

  const validRefundQuantity =
    Number.isSafeInteger(refundQuantity) &&
    refundQuantity > 0 &&
    refundQuantity <= availableQuantity;

  const estimatedRefund =
    selectedSale && validRefundQuantity
      ? getSaleTotal(selectedSale) *
        (refundQuantity / Math.max(availableQuantity, 1))
      : 0;

  const estimatedCostReversal =
    selectedSale && validRefundQuantity
      ? getSaleCost(selectedSale) *
        (refundQuantity / Math.max(availableQuantity, 1))
      : 0;

  // -------------------------------------------------------
  // Close details
  // -------------------------------------------------------

  const closeDetails = useCallback(() => {
    if (isRefunding) return;

    setSelected(null);
    setRefundOpen(false);
    setReceiptOpen(false);
    setRefundError(null);
    setRefundSuccess(null);
    setRefundForm(EMPTY_REFUND_FORM);
  }, [isRefunding]);

  // -------------------------------------------------------
  // Open refund form
  // -------------------------------------------------------

  const openRefundForm = useCallback(() => {
    if (
      !selectedSale ||
      selectedSale.status !== "completed"
    ) {
      return;
    }

    setRefundError(null);
    setRefundSuccess(null);

    setRefundForm({
      quantity: String(getSaleQuantity(selectedSale)),
      reason: "",
    });

    setRefundOpen(true);
  }, [selectedSale]);

  // -------------------------------------------------------
  // Submit refund
  // -------------------------------------------------------

  const submitRefund = useCallback(async () => {
    if (!selectedSale || !businessId || isRefunding) {
      return;
    }

    if (selectedSale.status !== "completed") {
      setRefundError(
        "Only completed sales can be refunded."
      );

      return;
    }

    const quantity = Number(refundForm.quantity);
    const available = getSaleQuantity(selectedSale);
    const total = getSaleTotal(selectedSale);
    const cost = getSaleCost(selectedSale);
    const reason = refundForm.reason.trim();

    if (
      !Number.isSafeInteger(quantity) ||
      quantity <= 0 ||
      quantity > available
    ) {
      setRefundError(
        "Enter a valid quantity within the remaining sale quantity."
      );

      return;
    }

    if (!reason) {
      setRefundError(
        "A refund reason is required for the audit trail."
      );

      return;
    }

    if (reason.length > 500) {
      setRefundError(
        "The refund reason cannot exceed 500 characters."
      );

      return;
    }

    if (total <= 0 || available <= 0) {
      setRefundError(
        "This sale has no refundable quantity or amount."
      );

      return;
    }

    const fraction = quantity / available;

    const amount = Number(
      (total * fraction).toFixed(2)
    );

    const costPrice = Number(
      (cost * fraction).toFixed(2)
    );

    if (amount <= 0) {
      setRefundError(
        "The calculated refund amount must be greater than zero."
      );

      return;
    }

    try {
      setIsRefunding(true);
      setRefundError(null);
      setRefundSuccess(null);

      await app.sales.refundSale({
        saleId: selectedSale.id,
        amount,
        costPrice,
        quantity,
        productId: selectedSale.productId,
        reason,
        branchId:
          (selectedSale as SaleWithBranch).branchId ??
          branchId ??
          undefined,
        mode: "LIVE",
      });

      setRefundSuccess(
        `Return recorded. Refund amount: ${formatNaira(amount)}.`
      );

      setRefundOpen(false);
      setRefundForm(EMPTY_REFUND_FORM);

      await load();
    } catch (error) {
      console.error(
        "[SalesListPage] Failed to process refund:",
        error
      );

      setRefundError(
        "The refund could not be completed. Check the sale and event history before retrying."
      );
    } finally {
      setIsRefunding(false);
    }
  }, [
    selectedSale,
    businessId,
    isRefunding,
    refundForm,
    branchId,
    app,
    load,
  ]);

  // -------------------------------------------------------
  // Copy sale ID
  // -------------------------------------------------------

  const copySaleId = useCallback(async () => {
    if (!selectedSale) return;

    try {
      await navigator.clipboard.writeText(
        selectedSale.id
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (error) {
      console.error(
        "[SalesListPage] Could not copy sale ID:",
        error
      );

      setRefundError(
        "Could not copy the sale ID. Please select and copy it manually."
      );
    }
  }, [selectedSale]);

  const setRefundQuantity = (value: string) => {
    setRefundForm((current) => ({
      ...current,
      quantity: value,
    }));

    setRefundError(null);
  };

  const setRefundReason = (value: string) => {
    setRefundForm((current) => ({
      ...current,
      reason: value,
    }));

    setRefundError(null);
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-screen pb-28 bg-neutral-950 text-white">

      {/* Header */}

      <div className="sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 bg-white/[0.03]">
        <div className="px-4 pt-4 pb-3 space-y-3">

          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold flex items-center gap-2.5">
              <GlassIcon size="sm" variant="primary">
                <Receipt className="w-4 h-4" />
              </GlassIcon>
              Sales
            </h1>

            <div className="flex items-center gap-2">
              <GlassButton
                variant="secondary"
                onClick={() => setFilterOpen(true)}
                icon={<Filter className="w-4 h-4" />}
              >
                Filters
              </GlassButton>

              <GlassButton
                variant="tertiary"
                onClick={() =>
                  activeView === "analysis"
                    ? void loadAnalysis()
                    : void load()
                }
                disabled={activeView === "analysis" ? analysisLoading : loading}
                icon={
                  <RefreshCw
                    className={cn(
                      "w-4 h-4",
                      (activeView === "analysis" ? analysisLoading : loading) && "animate-spin"
                    )}
                  />
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setActiveView("sales")}
              aria-pressed={activeView === "sales"}
              className={cn(
                "flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium transition",
                activeView === "sales" ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-200"
              )}
            >
              <ListFilter className="h-4 w-4" /> Sales list
            </button>
            <button
              type="button"
              onClick={() => setActiveView("analysis")}
              aria-pressed={activeView === "analysis"}
              className={cn(
                "flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-medium transition",
                activeView === "analysis" ? "bg-teal-400/15 text-teal-200 shadow-sm" : "text-gray-500 hover:text-gray-200"
              )}
            >
              <BarChart3 className="h-4 w-4" /> Analysis
            </button>
          </div>

          {activeView === "sales" && (
            <>
          <GlassInput
            icon={<Search className="w-4 h-4" />}
            placeholder="Search product, customer, ID..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                "all",
                "completed",
                "voided",
                "refunded",
              ] as StatusFilter[]
            ).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs capitalize",
                  "border whitespace-nowrap transition",
                  status === value
                    ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                    : "bg-white/[0.04] text-gray-400 border-white/10"
                )}
              >
                {value}
              </button>
            ))}
          </div>

            </>
          )}

          {/* Quick date filters apply to both the list and analysis views. */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                { value: "all", label: "All time" },
                { value: "today", label: "Today" },
                { value: "7days", label: "7 days" },
                { value: "30days", label: "30 days" },
                { value: "yearly", label: "Yearly" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setDateRange(option.value);
                  setFrom("");
                  setTo("");
                }}
                aria-pressed={dateRange === option.value}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs",
                  "border whitespace-nowrap transition",
                  dateRange === option.value
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                    : "bg-white/[0.04] text-gray-400 border-white/10"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeView === "analysis" ? (
        <SalesAnalysisPage
          sales={analysisSales}
          loading={analysisLoading}
          error={analysisError}
          branchName={activeBranchName}
          onRetry={() => void loadAnalysis()}
        />
      ) : (
        <>
      {/* Summary */}

      <div className="px-4 pt-4">
        <GlassCard
          variant="accent"
          className="px-4 py-3 flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-xs text-gray-400">
              Showing
            </p>

            <p className="text-sm font-semibold">
              {filtered.length} sale
              {filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-400">
              Completed total
            </p>

            <p className="text-lg font-bold text-emerald-400">
              {formatNaira(pageTotal)}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Sales list */}

      <div className="px-4 pt-4 space-y-2.5">
        {loading && sales.length === 0 ? (
          <div className="py-20 text-center text-gray-500 text-sm">
            Loading sales…
          </div>
        ) : loadError && sales.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />

            <p className="text-sm text-gray-300">
              {loadError}
            </p>

            <GlassButton
              variant="secondary"
              onClick={() => void load()}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Try again
            </GlassButton>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-500">
            <GlassIcon size="lg" variant="primary">
              <ShoppingBag className="w-6 h-6" />
            </GlassIcon>

            <p className="mt-4 text-sm">
              No sales found
            </p>

            {search.trim() && (
              <button
                type="button"
                className="mt-3 text-xs text-teal-300"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {loadError && (
              <p className="text-xs text-amber-300 px-1">
                {loadError}
              </p>
            )}

            {filtered.map((sale) => (
              <button
                key={sale.id}
                type="button"
                onClick={() => {
                  setSelected(sale);
                  setRefundOpen(false);
                  setRefundError(null);
                  setRefundSuccess(null);
                }}
                className="w-full text-left"
                aria-label={`View sale ${sale.id}`}
              >
                <GlassCard
                  variant="default"
                  className="p-4 hover:bg-white/[0.06] transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold truncate">
                          {sale.productName || sale.productId}
                        </p>

                        <StatusPill status={sale.status} />
                      </div>

                      <p className="mt-1 text-xs text-gray-400">
                        {sale.quantity} ×{" "}
                        {formatNaira(getUnitAmount(sale))}
                        {sale.customerRef
                          ? ` · ${sale.customerRef}`
                          : ""}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-500">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-emerald-400">
                        {formatNaira(getSaleTotal(sale))}
                      </p>

                      <p className="text-[10px] text-gray-500 mt-0.5">
                        Profit {formatNaira(getSaleProfit(sale))}
                      </p>

                      <ChevronRight className="w-4 h-4 text-gray-500 ml-auto mt-2" />
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </>
        )}
      </div>

        </>
      )}

      {/* Sale details */}

      <GlassSheet
        open={!!selectedSale}
        onClose={closeDetails}
        title={
          refundOpen
            ? "Return / refund"
            : "Sale details"
        }
        subtitle={
          selectedSale
            ? formatDate(selectedSale.createdAt)
            : undefined
        }
        size="md"
        className="w-full sm:max-w-xl lg:max-w-2xl xl:max-w-3xl"
      >
        {selectedSale && (
          <div className="space-y-5">

            {!refundOpen ? (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-gray-400">
                    Status
                  </span>

                  <StatusPill status={selectedSale.status} />
                </div>

                {refundSuccess && (
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3">
                    <p className="text-sm text-emerald-300">
                      <Check className="w-4 h-4 inline mr-2" />
                      {refundSuccess}
                    </p>
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  <Row
                    label="Product"
                    value={
                      selectedSale.productName ||
                      selectedSale.productId
                    }
                  />

                  <Row
                    label="Quantity"
                    value={String(selectedSale.quantity)}
                  />

                  <Row
                    label="Sale total"
                    value={formatNaira(
                      getSaleTotal(selectedSale)
                    )}
                  />

                  <Row
                    label="Cost"
                    value={formatNaira(
                      getSaleCost(selectedSale)
                    )}
                  />

                  <Row
                    label="Profit"
                    value={formatNaira(
                      getSaleProfit(selectedSale)
                    )}
                  />

                  {selectedSale.paymentMethod && (
                    <Row
                      label="Payment"
                      value={selectedSale.paymentMethod}
                    />
                  )}

                  {selectedSale.customerRef && (
                    <Row
                      label="Customer"
                      value={selectedSale.customerRef}
                    />
                  )}

                  <Row
                    label="Sale ID"
                    value={selectedSale.id}
                    mono
                  />

                  {selectedSale.mode && (
                    <Row
                      label="Mode"
                      value={selectedSale.mode}
                    />
                  )}

                  <Row
                    label="Sale branch ID"
                    value={
                      (selectedSale as SaleWithBranch).branchId ||
                      "Not recorded"
                    }
                    mono
                  />
                </div>

                {/* Actions */}

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Sale actions
                  </p>

                  <button
                    type="button"
                    onClick={openReceiptPreview}
                    className="w-full flex items-center gap-3 rounded-2xl border border-blue-400/20 bg-blue-500/[0.05] p-3.5 text-left hover:bg-blue-500/[0.09] transition"
                  >
                    <div className="rounded-xl bg-blue-500/10 p-2">
                      <Printer className="w-4 h-4 text-blue-300" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-blue-100">
                        Preview / print receipt
                      </p>

                      <p className="text-xs text-gray-400 mt-0.5">
                        Review business, branch, receipt, sale, and employee details.
                      </p>
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void copySaleId()}
                    className="w-full flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 text-left hover:bg-white/[0.06] transition"
                  >
                    <div className="rounded-xl bg-white/[0.06] p-2">
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {copied
                          ? "Sale ID copied"
                          : "Copy sale reference"}
                      </p>

                      <p className="text-xs text-gray-500 mt-0.5">
                        Copy the transaction ID for support or reconciliation.
                      </p>
                    </div>
                  </button>

                  {canRefund && (
                    <button
                      type="button"
                      onClick={openRefundForm}
                      className="w-full flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-3.5 text-left hover:bg-amber-500/[0.10] transition"
                    >
                      <div className="rounded-xl bg-amber-500/10 p-2">
                        <RotateCcw className="w-4 h-4 text-amber-300" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-amber-200">
                          Return items / issue refund
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          Record returned quantity and initiate the refund event.
                        </p>
                      </div>

                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </button>
                  )}

                  {selectedSale.status === "refunded" && (
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.06] p-3">
                      <p className="text-sm text-amber-200">
                        <PackageCheck className="w-4 h-4 inline mr-2" />
                        This sale is marked as refunded.
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Review the event history and refund records for the amount and quantity returned.
                      </p>
                    </div>
                  )}

                  {selectedSale.status === "voided" && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-3">
                      <p className="text-sm text-red-300">
                        This sale has been voided and cannot be refunded from this screen.
                      </p>
                    </div>
                  )}

                  {!canRefund &&
                    selectedSale.status !== "refunded" &&
                    selectedSale.status !== "voided" && (
                      <p className="text-xs text-gray-500">
                        Refund actions are unavailable for this sale status.
                      </p>
                    )}
                </div>
              </>
            ) : (
              <>
                {/* Refund form */}

                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-amber-500/10 p-2">
                      <RotateCcw className="w-5 h-5 text-amber-300" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-amber-100">
                        Return items and reverse the sale
                      </p>

                      <p className="mt-1 text-xs leading-relaxed text-gray-400">
                        This records a refund against the original sale. The refund command must update the relevant local projections and synchronize through your event pipeline.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Field label="Product">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm">
                      {selectedSale.productName ||
                        selectedSale.productId}
                    </div>
                  </Field>

                  <Field
                    label={`Quantity to return (1–${availableQuantity})`}
                  >
                    <div className="relative overflow-hidden rounded-[26px] border border-blue-400/20 bg-black/20 transition-all focus-within:border-blue-400/50">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-medium text-blue-300">
                        #
                      </span>

                      <GlassInput
                        value={refundForm.quantity}
                        onChange={(event) => {
                          const value = event.target.value;

                          if (
                            value === "" ||
                            /^\d+$/.test(value)
                          ) {
                            setRefundQuantity(value);
                          }
                        }}
                        placeholder="0"
                        inputMode="numeric"
                        autoComplete="off"
                        disabled={isRefunding}
                        className="w-full border-0 bg-transparent pl-14 pr-5 py-5 text-2xl text-white"
                        aria-label="Quantity to return"
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between px-1">
                      <p className="text-[11px] text-gray-600">
                        Units being returned
                      </p>

                      {validRefundQuantity && (
                        <p className="text-[11px] font-medium text-blue-400/70">
                          {refundQuantity.toLocaleString()} of{" "}
                          {availableQuantity.toLocaleString()} units
                        </p>
                      )}
                    </div>

                    {refundForm.quantity !== "" &&
                      !validRefundQuantity && (
                        <p className="mt-1 px-1 text-xs text-red-400">
                          Enter a whole quantity between 1 and{" "}
                          {availableQuantity}.
                        </p>
                      )}
                  </Field>

                  <Field label="Reason for return">
                    <textarea
                      value={refundForm.reason}
                      onChange={(event) =>
                        setRefundReason(event.target.value)
                      }
                      disabled={isRefunding}
                      maxLength={500}
                      rows={3}
                      placeholder="e.g. Damaged item, incorrect product, customer return..."
                      className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-teal-500 disabled:opacity-50"
                    />

                    <p className="mt-1 text-right text-[10px] text-gray-500">
                      {refundForm.reason.length}/500
                    </p>
                  </Field>
                </div>

                {/* Refund preview */}

                <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 space-y-3">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Reversal preview
                  </p>

                  <Row
                    label="Items being returned"
                    value={`${validRefundQuantity ? refundQuantity : 0} of ${availableQuantity}`}
                  />

                  <Row
                    label="Estimated refund"
                    value={formatNaira(estimatedRefund)}
                  />

                  <Row
                    label="Estimated cost reversal"
                    value={formatNaira(estimatedCostReversal)}
                  />

                  <div className="flex items-start gap-2 pt-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />

                    <p className="text-xs text-gray-400 leading-relaxed">
                      This preview allocates the current sale total proportionally by quantity. Discounts, taxes, and payment fees may require your domain service to calculate the authoritative refund amount.
                    </p>
                  </div>
                </div>

                {refundError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-300"
                  >
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    {refundError}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
                  <GlassButton
                    variant="secondary"
                    className="flex-1"
                    disabled={isRefunding}
                    onClick={() => {
                      setRefundOpen(false);
                      setRefundError(null);
                    }}
                  >
                    Cancel
                  </GlassButton>

                  <GlassButton
                    variant="primary"
                    className="flex-1"
                    disabled={
                      isRefunding ||
                      !validRefundQuantity ||
                      !refundForm.reason.trim() ||
                      estimatedRefund <= 0
                    }
                    onClick={() => void submitRefund()}
                    icon={
                      isRefunding ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Banknote className="w-4 h-4" />
                      )
                    }
                  >
                    {isRefunding
                      ? "Processing return..."
                      : "Confirm refund"}
                  </GlassButton>
                </div>
              </>
            )}
          </div>
        )}
      </GlassSheet>

      {/* ===================================================
          RECEIPT PREVIEW
      =================================================== */}

      <GlassSheet
        open={
          receiptOpen &&
          !!selectedSale &&
          !!receiptDetails
        }
        onClose={() => setReceiptOpen(false)}
        title="Receipt preview"
        subtitle="Review the details before printing"
        size="md"
        className="w-full sm:max-w-xl lg:max-w-2xl"
        footer={
          <div className="flex gap-2 w-full">
            <GlassButton
              variant="secondary"
              className="flex-1"
              onClick={() => setReceiptOpen(false)}
            >
              Back
            </GlassButton>

            <GlassButton
              variant="primary"
              className="flex-1"
              disabled={
                !business ||
                !receiptDetails ||
                receiptDetails.businessName ===
                  "Business name not available"
              }
              onClick={printReceipt}
              icon={<Printer className="w-4 h-4" />}
            >
              Print receipt
            </GlassButton>
          </div>
        }
      >
        {selectedSale && receiptDetails && (
          <div className="space-y-4">

            {receiptError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/[0.06] p-3 text-sm text-red-300"
              >
                <AlertTriangle className="mr-2 inline h-4 w-4" />
                {receiptError}
              </div>
            )}

            {/* Actual receipt */}

            <div className="rounded-2xl border border-white/10 bg-white p-5 text-neutral-900 shadow-xl">

              {/* Business and branch information */}

              <div className="text-center border-b border-dashed border-neutral-300 pb-4">
                <Building2 className="w-6 h-6 mx-auto mb-2 text-neutral-500" />

                <h2 className="text-lg font-bold break-words">
                  {receiptDetails.businessName}
                </h2>

                {receiptDetails.businessAddress && (
                  <p className="mt-1 text-xs text-neutral-600">
                    {receiptDetails.businessAddress}
                  </p>
                )}

                <div className="mt-3 border-t border-dashed border-neutral-200 pt-3">
                  <p className="text-sm font-semibold">
                    {receiptDetails.branchName}
                  </p>

                  {receiptDetails.branchAddress && (
                    <p className="mt-1 text-xs text-neutral-600">
                      {receiptDetails.branchAddress}
                    </p>
                  )}

                  {receiptDetails.branchPhone && (
                    <p className="mt-1 text-xs text-neutral-600">
                      Tel: {receiptDetails.branchPhone}
                    </p>
                  )}

                  {receiptDetails.branchId && (
                    <p className="mt-1 text-[10px] font-mono text-neutral-400">
                      Branch ID: {receiptDetails.branchId}
                    </p>
                  )}
                </div>

                <p className="mt-3 text-xs font-bold tracking-[0.2em]">
                  SALES RECEIPT
                </p>
              </div>

              {/* Transaction information */}

              <div className="space-y-2 py-4 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">
                    Receipt number
                  </span>

                  <span className="font-mono text-right break-all">
                    {receiptDetails.receiptNumber}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">
                    Date
                  </span>

                  <span className="text-right">
                    {formatDate(selectedSale.createdAt)}
                  </span>
                </div>

                <div className="flex justify-between gap-3">
                  <span className="text-neutral-500">
                    Employee
                  </span>

                  <span className="text-right">
                    {receiptDetails.employeeName}
                  </span>
                </div>

                {receiptDetails.employeeId && (
                  <div className="flex justify-between gap-3">
                    <span className="text-neutral-500">
                      Employee ID
                    </span>

                    <span className="font-mono text-right break-all">
                      {receiptDetails.employeeId}
                    </span>
                  </div>
                )}

                {selectedSale.customerRef && (
                  <div className="flex justify-between gap-3">
                    <span className="text-neutral-500">
                      Customer
                    </span>

                    <span className="text-right break-all">
                      {selectedSale.customerRef}
                    </span>
                  </div>
                )}

                {selectedSale.paymentMethod && (
                  <div className="flex justify-between gap-3">
                    <span className="text-neutral-500">
                      Payment
                    </span>

                    <span className="text-right">
                      {selectedSale.paymentMethod}
                    </span>
                  </div>
                )}
              </div>

              {/* Purchased item */}

              <div className="border-y border-dashed border-neutral-300 py-3">
                <div className="flex justify-between gap-3 text-xs font-semibold">
                  <span>Item</span>
                  <span>Amount</span>
                </div>

                <div className="mt-3 flex justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-semibold break-words">
                      {selectedSale.productName ||
                        selectedSale.productId}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {selectedSale.quantity} ×{" "}
                      {formatNaira(
                        getUnitAmount(selectedSale)
                      )}
                    </p>
                  </div>

                  <p className="font-semibold whitespace-nowrap">
                    {formatNaira(
                      getSaleTotal(selectedSale)
                    )}
                  </p>
                </div>
              </div>

              {/* Total */}

              <div className="flex justify-between gap-3 pt-4 text-base font-bold">
                <span>Total</span>

                <span>
                  {formatNaira(
                    getSaleTotal(selectedSale)
                  )}
                </span>
              </div>

              <p className="mt-5 text-center text-xs text-neutral-500">
                Thank you for your business.
              </p>

              <p className="mt-1 text-center font-mono text-[10px] text-neutral-400 break-all">
                Sale reference: {selectedSale.id}
              </p>
            </div>

            {/* Missing information warnings */}

            {(
              receiptDetails.businessName ===
                "Business name not available" ||
              receiptDetails.branchName ===
                "Branch details not available" ||
              receiptDetails.employeeName ===
                "Employee details not available"
            ) && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs leading-relaxed text-amber-200">
                <AlertTriangle className="mr-2 inline h-4 w-4" />

                {receiptDetails.branchName ===
                "Branch details not available"
                  ? "The branch recorded on this sale could not be found in the current business branch collection. Verify that the sale has the correct branchId and that the branch belongs to this business."
                  : "Some business or employee details are unavailable. Verify the corresponding live-query records and sale employee information."}
              </div>
            )}
          </div>
        )}
      </GlassSheet>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <GlassSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        className="w-full sm:max-w-xl lg:max-w-2xl xl:max-w-3xl"
        footer={
          <div className="flex gap-2 w-full">
            <GlassButton
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setFrom("");
                setTo("");
                setStatus("all");
                setDateRange("all");
              }}
            >
              Reset
            </GlassButton>

            <GlassButton
              variant="primary"
              className="flex-1"
              onClick={() => {
                setFilterOpen(false);
                void load();
              }}
            >
              Apply
            </GlassButton>
          </div>
        }
      >
        <div className="space-y-4">
          <Field label="From">
            <input
              type="date"
              value={from ? from.slice(0, 10) : ""}
              onChange={(event) => {
                const value = event.target.value;

                setDateRange("all");
                setFrom(
                  value
                    ? new Date(
                        `${value}T00:00:00`
                      ).toISOString()
                    : ""
                );
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-teal-500"
            />
          </Field>

          <Field label="To">
            <input
              type="date"
              value={to ? to.slice(0, 10) : ""}
              onChange={(event) => {
                const value = event.target.value;

                setDateRange("all");
                setTo(
                  value
                    ? new Date(
                        `${value}T23:59:59.999`
                      ).toISOString()
                    : ""
                );
              }}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-teal-500"
            />
          </Field>
        </div>
      </GlassSheet>
    </div>
  );
}
