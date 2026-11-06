
import {
  useMemo,
  useState,
  useCallback,
} from "react";

import {
  Package,
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  AlertTriangle,
  CircleDollarSign,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Boxes,
  ChartNoAxesCombined,
  Target,
  Filter,
  X,
  ChevronRight,
  RefreshCw,
  Info,
} from "lucide-react";

import type { LiveProduct } from "../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";
import { cn } from "../../lib/utils";

/* ============================================================
   CONTRACTS
   ============================================================ */

type SortDirection = "asc" | "desc";

type AnalysisSort =
  | "capital"
  | "quantity"
  | "products"
  | "stockouts"
  | "name";

interface StockAnalysisPageProps {
  /**
   * Products belonging to the selected branch.
   *
   * The parent is responsible for fetching branch-scoped
   * products and passing them into this component.
   */
  products: LiveProduct[];

  branchName?: string;

  loading?: boolean;

  /**
   * Optional callback for opening a product's management page.
   */
  onProductSelect?: (product: LiveProduct) => void;
}

interface CategoryAnalysis {
  name: string;

  productCount: number;

  totalQuantity: number;

  stockValue: number;

  retailValue: number;

  potentialProfit: number;

  capitalShare: number;

  zeroStockCount: number;

  lowStockCount: number;

  healthyStockCount: number;

  averageUnitCost: number;

  averageUnitPrice: number;
}

interface ProductAnalysis {
  product: LiveProduct;

  category: string;

  quantity: number;

  costPrice: number;

  sellingPrice: number;

  stockValue: number;

  retailValue: number;

  potentialProfit: number;

  stockStatus: "OUT" | "LOW" | "HEALTHY";
}

/* ============================================================
   CONSTANTS
   ============================================================ */

const CATEGORY_COLORS = [
  "#2DD4BF",
  "#60A5FA",
  "#A78BFA",
  "#FBBF24",
  "#F472B6",
  "#FB923C",
  "#34D399",
  "#818CF8",
  "#22D3EE",
  "#F87171",
];

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-NG", {
  maximumFractionDigits: 2,
});

function formatNaira(value: number): string {
  return currencyFormatter.format(
    Number.isFinite(value) ? value : 0,
  );
}

function formatNumber(value: number): string {
  return numberFormatter.format(
    Number.isFinite(value) ? value : 0,
  );
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function safeNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, value)
    : 0;
}

function getCategory(product: LiveProduct): string {
  return product.category?.trim() || "Uncategorized";
}

/* ============================================================
   PRIMITIVE COMPONENTS
   ============================================================ */

/**
 * Metric card.
 *
 * Uses the existing GlassCard and GlassIcon primitives.
 */
function MetricCard({
  title,
  value,
  description,
  icon,
  iconVariant = "primary",
  accent = "teal",
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconVariant?: "primary" | "success" | "warning" | "danger";
  accent?: "teal" | "blue" | "purple" | "amber";
}) {
  const accentClasses = {
    teal: "text-teal-300",
    blue: "text-blue-300",
    purple: "text-purple-300",
    amber: "text-amber-300",
  };

  return (
    <GlassCard
      variant="default"
      className="
        relative min-w-0 overflow-hidden
        border-white/[0.08] bg-white/[0.035]
        p-4 transition-colors
        hover:border-white/[0.13]
        sm:p-5
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
            {title}
          </p>

          <p
            className={cn(
              "mt-3 break-words text-xl font-bold tracking-tight tabular-nums sm:text-2xl",
              accentClasses[accent],
            )}
          >
            {value}
          </p>

          <p className="mt-2 text-[11px] leading-4 text-white/40">
            {description}
          </p>
        </div>

        <GlassIcon size="md" variant={iconVariant}>
          {icon}
        </GlassIcon>
      </div>
    </GlassCard>
  );
}

/**
 * Section header used throughout the page.
 */
function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-[11px] leading-5 text-white/40">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

/* ============================================================
   CAPITAL ALLOCATION DONUT
   ============================================================ */

function CapitalAllocationChart({
  categories,
  totalCapital,
}: {
  categories: CategoryAnalysis[];
  totalCapital: number;
}) {
  const [hoveredCategory, setHoveredCategory] =
    useState<string | null>(null);

  const chartCategories = useMemo(
    () =>
      categories
        .filter((category) => category.stockValue > 0)
        .sort((a, b) => b.stockValue - a.stockValue),
    [categories],
  );

  const segments = useMemo(() => {
    let accumulated = 0;

    return chartCategories.map((category, index) => {
      const percentage =
        totalCapital > 0
          ? (category.stockValue / totalCapital) * 100
          : 0;

      const segment = {
        ...category,
        percentage,
        start: accumulated,
        end: accumulated + percentage,
        color:
          CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };

      accumulated += percentage;

      return segment;
    });
  }, [chartCategories, totalCapital]);

  const activeCategory = segments.find(
    (item) => item.name === hoveredCategory,
  );

  return (
    <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="flex justify-center">
        <div
          className="relative h-[230px] w-[230px] rounded-full"
          role="img"
          aria-label="Inventory capital allocation by category"
          style={{
            background:
              totalCapital > 0 && segments.length > 0
                ? `conic-gradient(${segments
                    .map(
                      (segment) =>
                        `${segment.color} ${segment.start}% ${segment.end}%`,
                    )
                    .join(", ")})`
                : "rgba(255,255,255,0.07)",
          }}
        >
          <div className="absolute inset-[27px] flex flex-col items-center justify-center rounded-full border border-white/[0.06] bg-[#101014] text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/40">
              Total capital
            </p>

            <p className="mt-2 max-w-[160px] break-words text-xl font-bold text-white">
              {formatNaira(
                activeCategory?.stockValue ?? totalCapital,
              )}
            </p>

            <p className="mt-1 text-[10px] text-white/35">
              {activeCategory
                ? activeCategory.name
                : "Inventory at cost"}
            </p>
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        {segments.length === 0 ? (
          <div className="py-8 text-center text-xs text-white/40">
            No inventory capital to allocate yet.
          </div>
        ) : (
          segments.map((segment) => (
            <button
              key={segment.name}
              type="button"
              onMouseEnter={() =>
                setHoveredCategory(segment.name)
              }
              onMouseLeave={() =>
                setHoveredCategory(null)
              }
              onFocus={() =>
                setHoveredCategory(segment.name)
              }
              onBlur={() =>
                setHoveredCategory(null)
              }
              className="
                flex w-full items-center gap-3 rounded-xl
                p-2 text-left transition
                hover:bg-white/[0.045]
                focus-visible:outline-none
                focus-visible:ring-1 focus-visible:ring-teal-300/50
              "
            >
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-white/80">
                  {segment.name}
                </span>

                <span className="mt-0.5 block text-[10px] text-white/35">
                  {segment.productCount} products
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-xs font-semibold tabular-nums text-white">
                  {formatPercentage(segment.percentage)}
                </span>

                <span className="mt-0.5 block text-[10px] tabular-nums text-white/40">
                  {formatNaira(segment.stockValue)}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/* ============================================================
   CATEGORY CAPITAL BARS
   ============================================================ */

function CategoryCapitalBars({
  categories,
  onSelect,
}: {
  categories: CategoryAnalysis[];
  onSelect: (category: string) => void;
}) {
  const sorted = categories
    .filter((item) => item.stockValue > 0)
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 7);

  const maximum = Math.max(
    ...sorted.map((item) => item.stockValue),
    1,
  );

  if (sorted.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-white/40">
        No category valuation data available.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {sorted.map((category, index) => {
        const width =
          (category.stockValue / maximum) * 100;

        return (
          <button
            key={category.name}
            type="button"
            onClick={() => onSelect(category.name)}
            className="w-full text-left"
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-[10px] text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="truncate text-xs font-medium text-white/80">
                  {category.name}
                </span>
              </div>

              <span className="shrink-0 text-xs font-semibold tabular-nums text-white">
                {formatNaira(category.stockValue)}
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${width}%`,
                  backgroundColor:
                    CATEGORY_COLORS[
                      index % CATEGORY_COLORS.length
                    ],
                }}
              />
            </div>

            <div className="mt-1.5 flex justify-between text-[10px] text-white/35">
              <span>{category.productCount} products</span>
              <span>{formatPercentage(category.capitalShare)}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================
   CATEGORY INVESTMENT TABLE
   ============================================================ */

function CategoryAnalysisTable({
  categories,
  onSelect,
}: {
  categories: CategoryAnalysis[];
  onSelect: (category: string) => void;
}) {
  const sorted = [...categories].sort(
    (a, b) => b.stockValue - a.stockValue,
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {[
              "Category",
              "Products",
              "Stock units",
              "Capital at cost",
              "Capital share",
              "Potential retail",
              "Stock alerts",
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-white/35"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {sorted.map((category, index) => (
            <tr
              key={category.name}
              className="
                border-b border-white/[0.045]
                transition hover:bg-white/[0.025]
                last:border-0
              "
            >
              <td className="px-4 py-4">
                <button
                  type="button"
                  onClick={() => onSelect(category.name)}
                  className="flex items-center gap-2 text-left"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[
                          index % CATEGORY_COLORS.length
                        ],
                    }}
                  />

                  <span className="max-w-[180px] truncate text-xs font-semibold text-white/85">
                    {category.name}
                  </span>

                  <ChevronRight className="h-3 w-3 shrink-0 text-white/25" />
                </button>
              </td>

              <td className="px-4 py-4 text-xs tabular-nums text-white/65">
                {formatNumber(category.productCount)}
              </td>

              <td className="px-4 py-4 text-xs tabular-nums text-white/65">
                {formatNumber(category.totalQuantity)}
              </td>

              <td className="px-4 py-4 text-xs font-semibold tabular-nums text-teal-300">
                {formatNaira(category.stockValue)}
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs tabular-nums text-white/70">
                    {formatPercentage(category.capitalShare)}
                  </span>
                </div>
              </td>

              <td className="px-4 py-4 text-xs tabular-nums text-white/65">
                {formatNaira(category.retailValue)}
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  {category.zeroStockCount > 0 && (
                    <span className="rounded-lg border border-red-400/15 bg-red-400/[0.08] px-2 py-1 text-[10px] font-semibold text-red-300">
                      {category.zeroStockCount} out
                    </span>
                  )}

                  {category.lowStockCount > 0 && (
                    <span className="rounded-lg border border-amber-400/15 bg-amber-400/[0.08] px-2 py-1 text-[10px] font-semibold text-amber-300">
                      {category.lowStockCount} low
                    </span>
                  )}

                  {category.zeroStockCount === 0 &&
                    category.lowStockCount === 0 && (
                      <span className="text-[10px] text-emerald-300/70">
                        Healthy
                      </span>
                    )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="py-12 text-center text-xs text-white/40">
          No category data available.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PRODUCT ANALYSIS TABLE
   ============================================================ */

function ProductAnalysisTable({
  products,
  onSelect,
}: {
  products: ProductAnalysis[];
  onSelect?: (product: LiveProduct) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] border-collapse text-left">
        <thead>
          <tr className="border-b border-white/[0.08]">
            {[
              "Product",
              "Category",
              "Quantity",
              "Unit cost",
              "Unit price",
              "Stock value",
              "Status",
            ].map((heading) => (
              <th
                key={heading}
                className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-white/35"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {products.map((item) => (
            <tr
              key={item.product.id}
              className="
                border-b border-white/[0.045]
                transition hover:bg-white/[0.025]
                last:border-0
              "
            >
              <td className="px-4 py-3.5">
                <button
                  type="button"
                  disabled={!onSelect}
                  onClick={() => onSelect?.(item.product)}
                  className="text-left disabled:cursor-default"
                >
                  <span className="block max-w-[190px] truncate text-xs font-semibold text-white/85">
                    {item.product.name}
                  </span>

                  <span className="mt-1 block text-[10px] text-white/35">
                    {item.product.sku || "No SKU"}
                  </span>
                </button>
              </td>

              <td className="px-4 py-3.5 text-xs text-white/50">
                {item.category}
              </td>

              <td className="px-4 py-3.5 text-xs tabular-nums text-white/70">
                {formatNumber(item.quantity)}
              </td>

              <td className="px-4 py-3.5 text-xs tabular-nums text-white/55">
                {formatNaira(item.costPrice)}
              </td>

              <td className="px-4 py-3.5 text-xs tabular-nums text-white/55">
                {formatNaira(item.sellingPrice)}
              </td>

              <td className="px-4 py-3.5 text-xs font-semibold tabular-nums text-teal-300">
                {formatNaira(item.stockValue)}
              </td>

              <td className="px-4 py-3.5">
                {item.stockStatus === "OUT" ? (
                  <span className="rounded-lg border border-red-400/15 bg-red-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-red-300">
                    Out of stock
                  </span>
                ) : item.stockStatus === "LOW" ? (
                  <span className="rounded-lg border border-amber-400/15 bg-amber-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-amber-300">
                    Low stock
                  </span>
                ) : (
                  <span className="rounded-lg border border-emerald-400/15 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                    Healthy
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {products.length === 0 && (
        <div className="py-12 text-center text-xs text-white/40">
          No products match your selection.
        </div>
      )}
    </div>
  );
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function StockAnalysisPage({
  products,
  branchName = "Active branch",
  loading = false,
  onProductSelect,
}: StockAnalysisPageProps) {
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [productSort, setProductSort] =
    useState<AnalysisSort>("capital");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const [showStockAlertsOnly, setShowStockAlertsOnly] =
    useState(false);

  /* ==========================================================
     PRODUCT NORMALIZATION
     ========================================================== */

  const productAnalysis = useMemo<ProductAnalysis[]>(() => {
    return products.map((product) => {
      const quantity = safeNumber(product.quantity);

      const costPrice = safeNumber(product.costPrice);

      const sellingPrice = safeNumber(product.price);

      const reorderLevel =
        product.reorderLevel == null
          ? null
          : safeNumber(product.reorderLevel);

      const stockStatus: ProductAnalysis["stockStatus"] =
        quantity === 0
          ? "OUT"
          : reorderLevel !== null &&
              quantity <= reorderLevel
            ? "LOW"
            : "HEALTHY";

      const stockValue = quantity * costPrice;

      const retailValue = quantity * sellingPrice;

      return {
        product,
        category: getCategory(product),
        quantity,
        costPrice,
        sellingPrice,
        stockValue,
        retailValue,
        potentialProfit: retailValue - stockValue,
        stockStatus,
      };
    });
  }, [products]);

  /* ==========================================================
     BRANCH-WIDE METRICS
     ========================================================== */

  const metrics = useMemo(() => {
    const totalProducts = productAnalysis.length;

    const totalQuantity = productAnalysis.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const totalCapital = productAnalysis.reduce(
      (sum, item) => sum + item.stockValue,
      0,
    );

    const totalRetailValue = productAnalysis.reduce(
      (sum, item) => sum + item.retailValue,
      0,
    );

    const totalPotentialProfit =
      totalRetailValue - totalCapital;

    const zeroStockProducts = productAnalysis.filter(
      (item) => item.stockStatus === "OUT",
    ).length;

    const lowStockProducts = productAnalysis.filter(
      (item) => item.stockStatus === "LOW",
    ).length;

    const healthyProducts = productAnalysis.filter(
      (item) => item.stockStatus === "HEALTHY",
    ).length;

    const capitalExposure =
      totalRetailValue > 0
        ? (totalPotentialProfit / totalRetailValue) * 100
        : 0;

    return {
      totalProducts,
      totalQuantity,
      totalCapital,
      totalRetailValue,
      totalPotentialProfit,
      zeroStockProducts,
      lowStockProducts,
      healthyProducts,
      capitalExposure,
    };
  }, [productAnalysis]);

  /* ==========================================================
     CATEGORY AGGREGATION
     ========================================================== */

  const categories = useMemo<CategoryAnalysis[]>(() => {
    const grouped = new Map<
      string,
      {
        products: ProductAnalysis[];
      }
    >();

    for (const item of productAnalysis) {
      const existing = grouped.get(item.category);

      if (existing) {
        existing.products.push(item);
      } else {
        grouped.set(item.category, {
          products: [item],
        });
      }
    }

    return Array.from(grouped.entries())
      .map(([name, group]) => {
        const items = group.products;

        const productCount = items.length;

        const totalQuantity = items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        const stockValue = items.reduce(
          (sum, item) => sum + item.stockValue,
          0,
        );

        const retailValue = items.reduce(
          (sum, item) => sum + item.retailValue,
          0,
        );

        const zeroStockCount = items.filter(
          (item) => item.stockStatus === "OUT",
        ).length;

        const lowStockCount = items.filter(
          (item) => item.stockStatus === "LOW",
        ).length;

        const healthyStockCount = items.filter(
          (item) => item.stockStatus === "HEALTHY",
        ).length;

        const capitalShare =
          metrics.totalCapital > 0
            ? (stockValue / metrics.totalCapital) * 100
            : 0;

        const potentialProfit = retailValue - stockValue;

        return {
          name,
          productCount,
          totalQuantity,
          stockValue,
          retailValue,
          potentialProfit,
          capitalShare,
          zeroStockCount,
          lowStockCount,
          healthyStockCount,
          averageUnitCost:
            productCount > 0
              ? items.reduce(
                  (sum, item) => sum + item.costPrice,
                  0,
                ) / productCount
              : 0,
          averageUnitPrice:
            productCount > 0
              ? items.reduce(
                  (sum, item) => sum + item.sellingPrice,
                  0,
                ) / productCount
              : 0,
        };
      })
      .sort((a, b) => b.stockValue - a.stockValue);
  }, [productAnalysis, metrics.totalCapital]);

  const topCapitalCategory = categories[0] ?? null;

  const categoriesWithStockouts = categories.filter(
    (item) => item.zeroStockCount > 0,
  );

  /* ==========================================================
     CATEGORY FILTERING
     ========================================================== */

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return productAnalysis.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.product.name.toLowerCase().includes(normalizedSearch) ||
        (item.product.sku ?? "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (item.product.barcode ?? "")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const matchesAlerts =
        !showStockAlertsOnly ||
        item.stockStatus !== "HEALTHY";

      return (
        matchesSearch &&
        matchesCategory &&
        matchesAlerts
      );
    });
  }, [
    productAnalysis,
    search,
    selectedCategory,
    showStockAlertsOnly,
  ]);

  /* ==========================================================
     PRODUCT SORTING
     ========================================================== */

  const sortedProducts = useMemo(() => {
    const result = [...filteredProducts];

    const multiplier =
      sortDirection === "asc" ? 1 : -1;

    result.sort((a, b) => {
      switch (productSort) {
        case "capital":
          return (a.stockValue - b.stockValue) * multiplier;

        case "quantity":
          return (a.quantity - b.quantity) * multiplier;

        case "products":
          return a.product.name.localeCompare(
            b.product.name,
          ) * multiplier;

        case "stockouts":
          return (
            (a.stockStatus === "OUT" ? 1 : 0) -
            (b.stockStatus === "OUT" ? 1 : 0)
          ) * multiplier;

        case "name":
          return a.product.name.localeCompare(
            b.product.name,
          ) * multiplier;

        default:
          return 0;
      }
    });

    return result;
  }, [
    filteredProducts,
    productSort,
    sortDirection,
  ]);

  /* ==========================================================
     CATEGORY SELECTION
     ========================================================== */

  const selectCategory = useCallback((name: string) => {
    setSelectedCategory(name);
    setSearch("");
    setShowStockAlertsOnly(false);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedCategory("All");
    setSearch("");
    setShowStockAlertsOnly(false);
  }, []);

  /* ==========================================================
     LOADING / EMPTY STATES
     ========================================================== */

  if (loading) {
    return (
      <div className="min-h-[400px] bg-[#09090b] px-4 py-20 text-center text-sm text-white/40">
        <RefreshCw className="mx-auto mb-3 h-5 w-5 animate-spin" />
        Analysing branch inventory...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-[#09090b] px-4 py-20 text-center text-white">
        <GlassIcon size="lg" variant="primary">
          <Boxes className="h-6 w-6" />
        </GlassIcon>

        <h2 className="mt-5 text-lg font-semibold">
          No inventory data
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-white/40">
          This branch does not have any products available
          for stock analysis yet.
        </p>
      </div>
    );
  }

  /* ==========================================================
     UI
     ========================================================== */

  return (
    <div className="min-h-screen bg-[#09090b] pb-12 text-white">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="
        border-b border-white/[0.08]
        bg-neutral-950/85 backdrop-blur-2xl
      ">
        <div className="
          mx-auto max-w-[1800px]
          space-y-4 px-4 py-5
          sm:px-6 sm:py-6
        ">
          <div className="flex items-center gap-3">
            <div className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-[16px] border border-teal-300/15
              bg-gradient-to-br from-teal-400/20 to-teal-600/5
            ">
              <ChartNoAxesCombined className="h-5 w-5 text-teal-300" />
            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Stock Analysis
              </h1>

              <p className="mt-1 truncate text-xs text-white/40">
                {branchName} · Capital allocation and inventory performance
              </p>
            </div>
          </div>

          <div className="
            flex flex-wrap items-center justify-between gap-3
            rounded-2xl border border-white/[0.07]
            bg-white/[0.025] px-3.5 py-3
          ">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-300" />

              <span className="text-xs text-white/65">
                Branch-level analysis
              </span>
            </div>

            <span className="text-[10px] text-white/35">
              {formatNumber(metrics.totalProducts)} products ·{" "}
              {formatNumber(categories.length)} categories
            </span>
          </div>
        </div>
      </header>

      <main className="
        mx-auto max-w-[1800px]
        space-y-6 px-3 py-5
        sm:space-y-7 sm:px-6 sm:py-7
      ">

        {/* ====================================================
            KEY METRICS
            ==================================================== */}

        <section className="space-y-3">
          <SectionHeader
            title="Inventory position"
            description="The financial position of your current branch stock."
          />

          <div className="
            grid grid-cols-1 gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          ">
            <MetricCard
              title="Capital invested"
              value={formatNaira(metrics.totalCapital)}
              description="Current stock quantity × unit cost"
              icon={<Wallet className="h-5 w-5" />}
              accent="teal"
            />

            <MetricCard
              title="Potential retail value"
              value={formatNaira(metrics.totalRetailValue)}
              description="Current stock quantity × selling price"
              icon={<CircleDollarSign className="h-5 w-5" />}
              accent="blue"
            />

            <MetricCard
              title="Potential gross profit"
              value={formatNaira(metrics.totalPotentialProfit)}
              description="Retail value less inventory cost"
              icon={<TrendingUp className="h-5 w-5" />}
              accent="purple"
            />

            <MetricCard
              title="Stock units"
              value={formatNumber(metrics.totalQuantity)}
              description={`${formatNumber(metrics.totalProducts)} distinct product records`}
              icon={<Package className="h-5 w-5" />}
              accent="amber"
            />
          </div>
        </section>

        {/* ====================================================
            STOCK HEALTH
            ==================================================== */}

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

          <button
            type="button"
            onClick={() => {
              setShowStockAlertsOnly(true);
              setSearch("");
              setSelectedCategory("All");
            }}
            className="text-left"
          >
            <GlassCard
              variant="default"
              className="
                border-red-400/15 bg-red-400/[0.035]
                p-4 transition hover:bg-red-400/[0.06]
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-red-300/65">
                  Out of stock
                </span>

                <AlertTriangle className="h-4 w-4 text-red-300" />
              </div>

              <p className="mt-3 text-2xl font-bold tabular-nums text-red-300">
                {metrics.zeroStockProducts}
              </p>

              <p className="mt-1 text-[10px] text-white/35">
                Products with zero available units
              </p>
            </GlassCard>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowStockAlertsOnly(true);
              setSearch("");
              setSelectedCategory("All");
            }}
            className="text-left"
          >
            <GlassCard
              variant="default"
              className="
                border-amber-400/15 bg-amber-400/[0.035]
                p-4 transition hover:bg-amber-400/[0.06]
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/65">
                  Low stock
                </span>

                <TrendingDown className="h-4 w-4 text-amber-300" />
              </div>

              <p className="mt-3 text-2xl font-bold tabular-nums text-amber-300">
                {metrics.lowStockProducts}
              </p>

              <p className="mt-1 text-[10px] text-white/35">
                At or below configured reorder level
              </p>
            </GlassCard>
          </button>

          <GlassCard
            variant="default"
            className="
              border-emerald-400/15 bg-emerald-400/[0.035]
              p-4
            "
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/65">
                Healthy stock
              </span>

              <Target className="h-4 w-4 text-emerald-300" />
            </div>

            <p className="mt-3 text-2xl font-bold tabular-nums text-emerald-300">
              {metrics.healthyProducts}
            </p>

            <p className="mt-1 text-[10px] text-white/35">
              Above configured reorder level
            </p>
          </GlassCard>
        </section>

        {/* ====================================================
            CAPITAL ALLOCATION
            ==================================================== */}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">

          <GlassCard
            variant="default"
            className="min-w-0 border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"
          >
            <div className="mb-6">
              <SectionHeader
                title="Capital allocation"
                description="Where your inventory capital is currently held."
              />
            </div>

            <CapitalAllocationChart
              categories={categories}
              totalCapital={metrics.totalCapital}
            />

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              <div className="flex justify-between gap-3 text-xs">
                <span className="text-white/40">
                  Categories holding capital
                </span>

                <span className="font-semibold tabular-nums text-white">
                  {categories.filter(
                    (item) => item.stockValue > 0,
                  ).length}
                </span>
              </div>
            </div>
          </GlassCard>

          <GlassCard
            variant="default"
            className="min-w-0 border-white/[0.08] bg-white/[0.025] p-4 sm:p-5"
          >
            <div className="mb-6">
              <SectionHeader
                title="Capital concentration"
                description="Categories ranked by inventory cost value."
              />
            </div>

            <CategoryCapitalBars
              categories={categories}
              onSelect={selectCategory}
            />

            <div className="mt-5 border-t border-white/[0.07] pt-4">
              {topCapitalCategory ? (
                <div className="flex items-start gap-3">
                  <GlassIcon size="sm" variant="primary">
                    <Wallet className="h-4 w-4" />
                  </GlassIcon>

                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-white/35">
                      Largest capital concentration
                    </p>

                    <p className="mt-1 text-sm font-semibold text-teal-300">
                      {topCapitalCategory.name}
                    </p>

                    <p className="mt-1 text-[10px] text-white/40">
                      {formatPercentage(
                        topCapitalCategory.capitalShare,
                      )}{" "}
                      of branch inventory capital
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/40">
                  No capital concentration data available.
                </p>
              )}
            </div>
          </GlassCard>
        </section>

        {/* ====================================================
            CAPITAL INVESTMENT INTERPRETATION
            ==================================================== */}

        <section className="space-y-3">
          <SectionHeader
            title="Capital investment signals"
            description="Use inventory concentration and stock availability to guide further investigation."
          />

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

            <GlassCard
              variant="default"
              className="
                border-teal-300/10 bg-teal-300/[0.025]
                p-4 sm:p-5
              "
            >
              <div className="flex items-start gap-3">
                <GlassIcon size="md" variant="primary">
                  <Wallet className="h-5 w-5" />
                </GlassIcon>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">
                    Capital concentration
                  </p>

                  {topCapitalCategory ? (
                    <>
                      <p className="mt-2 text-lg font-bold text-teal-300">
                        {topCapitalCategory.name}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/45">
                        This category holds{" "}
                        {formatNaira(
                          topCapitalCategory.stockValue,
                        )}{" "}
                        ({formatPercentage(
                          topCapitalCategory.capitalShare,
                        )}) of the branch's inventory capital.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-xs text-white/40">
                      No inventory capital has been recorded.
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>

            <GlassCard
              variant="default"
              className="
                border-amber-300/10 bg-amber-300/[0.025]
                p-4 sm:p-5
              "
            >
              <div className="flex items-start gap-3">
                <GlassIcon size="md" variant="warning">
                  <AlertTriangle className="h-5 w-5" />
                </GlassIcon>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-white">
                    Categories requiring restock investigation
                  </p>

                  <p className="mt-2 text-lg font-bold text-amber-300">
                    {categoriesWithStockouts.length}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/45">
                    Categories with products currently at zero
                    stock. Review their sales demand and supplier
                    costs before allocating additional capital.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard
            variant="default"
            className="border-white/[0.07] bg-white/[0.02] p-4"
          >
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-300" />

              <p className="text-[11px] leading-5 text-white/45">
                Capital concentration is not the same as investment
                performance. A category holding the most capital
                is not necessarily the most profitable, and a
                category with stockouts is not necessarily the
                best investment. Sales velocity, realized margins,
                demand and supplier lead times should also be
                considered before committing more capital.
              </p>
            </div>
          </GlassCard>
        </section>

        {/* ====================================================
            CATEGORY ANALYSIS TABLE
            ==================================================== */}

        <section className="space-y-3">
          <SectionHeader
            title="Category financial breakdown"
            description="Compare capital exposure, stock quantity and potential retail value."
          />

          <GlassCard
            variant="default"
            className="
              overflow-hidden border-white/[0.08]
              bg-white/[0.025]
            "
          >
            <CategoryAnalysisTable
              categories={categories}
              onSelect={selectCategory}
            />
          </GlassCard>
        </section>

        {/* ====================================================
            PRODUCT ANALYSIS
            ==================================================== */}

        <section className="space-y-3">

          <SectionHeader
            title="Product-level stock analysis"
            description="Inspect individual product capital exposure and stock health."
            action={
              <span className="shrink-0 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[10px] tabular-nums text-white/50">
                {sortedProducts.length} products
              </span>
            }
          />

          <GlassCard
            variant="default"
            className="overflow-hidden border-white/[0.08] bg-white/[0.025]"
          >

            {/* FILTERS */}

            <div className="
              flex flex-col gap-3
              border-b border-white/[0.07]
              p-3 sm:p-4
            ">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="
                  flex h-10 min-w-0 flex-1 items-center gap-2
                  rounded-xl border border-white/[0.08]
                  bg-white/[0.035] px-3
                  focus-within:border-teal-300/30
                ">
                  <Search className="h-4 w-4 shrink-0 text-white/35" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search products, SKU or barcode..."
                    className="
                      h-full min-w-0 flex-1 bg-transparent
                      text-xs text-white outline-none
                      placeholder:text-white/30
                    "
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-white/40" />
                    </button>
                  )}
                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="
                    h-10 min-w-0 rounded-xl
                    border border-white/[0.08]
                    bg-[#17171b] px-3
                    text-xs text-white/75 outline-none
                    focus:border-teal-300/30
                    sm:w-[190px]
                  "
                >
                  <option value="All">All categories</option>

                  {categories.map((category) => (
                    <option
                      key={category.name}
                      value={category.name}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setShowStockAlertsOnly(
                      (current) => !current,
                    )
                  }
                  aria-pressed={showStockAlertsOnly}
                  className={cn(
                    `
                      flex items-center gap-2 rounded-xl
                      border px-3 py-2 text-[10px]
                      font-medium transition
                    `,
                    showStockAlertsOnly
                      ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
                      : "border-white/[0.08] bg-white/[0.025] text-white/50 hover:bg-white/[0.06]",
                  )}
                >
                  <Filter className="h-3.5 w-3.5" />
                  Stock alerts only
                </button>

                <div className="flex items-center gap-2">
                  <select
                    value={productSort}
                    onChange={(event) =>
                      setProductSort(
                        event.target.value as AnalysisSort,
                      )
                    }
                    className="
                      h-8 rounded-lg border border-white/[0.08]
                      bg-[#17171b] px-2 text-[10px]
                      text-white/65 outline-none
                    "
                  >
                    <option value="capital">Sort by capital</option>
                    <option value="quantity">Sort by quantity</option>
                    <option value="name">Sort by name</option>
                    <option value="stockouts">Sort by stock status</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      setSortDirection((current) =>
                        current === "asc" ? "desc" : "asc",
                      )
                    }
                    aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-lg border border-white/[0.08]
                      bg-white/[0.025] text-white/55
                      transition hover:bg-white/[0.07]
                    "
                  >
                    {sortDirection === "asc" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {(selectedCategory !== "All" ||
                search ||
                showStockAlertsOnly) && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[10px] text-white/35">
                    Filters applied
                  </p>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[10px] font-semibold text-teal-300 hover:text-teal-200"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* TABLE */}

            <ProductAnalysisTable
              products={sortedProducts}
              onSelect={onProductSelect}
            />

          </GlassCard>
        </section>

        {/* ====================================================
            FOOTER
            ==================================================== */}

        <div className="
          flex flex-wrap items-center justify-between
          gap-2 border-t border-white/[0.06]
          pt-4
        ">
          <p className="text-[10px] text-white/30">
            Branch inventory snapshot · {branchName}
          </p>

          <p className="text-[10px] text-white/30">
            Valuation basis: current unit cost price
          </p>
        </div>

      </main>
    </div>
  );
}
