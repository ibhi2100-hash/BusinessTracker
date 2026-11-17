
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Minus,
  Boxes,
  Warehouse,
  TrendingUp,
} from "lucide-react";

import { toast } from "sonner";

import { GlassCard } from "../../components/ui/GlassCard";
import { GlassIcon } from "../../components/ui/GlassIcon";
import { GlassButton } from "../../components/ui/GlassButton";
import { GlassInput } from "../../components/ui/GlassInput";

import { useBusinessContext } from "../../Biztru/context/BusinessContext";
import { useApplication } from "../../Biztru/services/ApplicationService/ApplicationContext";

import { inventoryKey } from "../../Biztru/utils/keygenerator";

/* ============================================================
   TYPES
   ============================================================ */

export type CatalogueProduct = {
  id: string;
  businessId: string;
  branchId?: string | null;
  name: string;
  price: number;
  costPrice: number;
  category?: string | null;
  sku?: string | null;
  barcode?: string | null;
  imageUrl?: string | null;
  description?: string | null;
  reorderLevel?: number;
  isActive: boolean;
};

type SelectedProduct = {
  product: CatalogueProduct;
  quantity: number;
};

type QuantityDrafts = Record<string, string>;

/* ============================================================
   FORMATTING
   ============================================================ */

function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(value);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;

  return Math.max(1, Math.floor(value));
}

/* ============================================================
   PAGE
   ============================================================ */

export default function BranchProductAllocationPage() {
  const navigate = useNavigate();

  const { branchId } = useParams<{
    branchId: string;
  }>();

  const { businessId } = useBusinessContext();

  const app = useApplication();

  /* ==========================================================
     STATE
     ========================================================== */

  const [products, setProducts] = useState<CatalogueProduct[]>([]);

  const [selected, setSelected] = useState<
    Record<string, SelectedProduct>
  >({});

  // Raw input values allow users to temporarily clear the field.
  const [quantityDrafts, setQuantityDrafts] =
    useState<QuantityDrafts>({});

  const [completedIds, setCompletedIds] = useState<Set<string>>(
    () => new Set()
  );

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [branchName, setBranchName] = useState("");

  /* ==========================================================
     LOAD DATA
     ========================================================== */

  const loadData = useCallback(async () => {
    if (!businessId || !branchId) {
      setError("Business or branch information is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const branch = await app.branch.findBranch(branchId);

      if (!branch) {
        throw new Error("The requested branch could not be found.");
      }

      setBranchName(branch.name);

      const catalogue =
        await app.product.getBusinessProducts(businessId);

      // Defensive filtering: only active products belonging to
      // the current business should be available for allocation.
      const validProducts = (
        catalogue as CatalogueProduct[]
      ).filter(
        (product) =>
          product.businessId === businessId &&
          product.isActive
      );

      setProducts(validProducts);
    } catch (err) {
      const message = getErrorMessage(err);

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [app, businessId, branchId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* ==========================================================
     SEARCH
     ========================================================== */

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.barcode?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term)
      );
    });
  }, [products, search]);

  /* ==========================================================
     SELECTED PRODUCTS
     ========================================================== */

  const selectedProducts = useMemo(
    () => Object.values(selected),
    [selected]
  );

  const totalUnits = useMemo(
    () =>
      selectedProducts.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [selectedProducts]
  );

  const pendingProducts = useMemo(
    () =>
      selectedProducts.filter(
        (item) => !completedIds.has(item.product.id)
      ),
    [selectedProducts, completedIds]
  );

  /* ==========================================================
     PRODUCT SELECTION
     ========================================================== */

  const toggleProduct = (product: CatalogueProduct) => {
    if (completedIds.has(product.id) || submitting) return;

    setSelected((previous) => {
      const next = { ...previous };

      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = {
          product,
          quantity: 1,
        };
      }

      return next;
    });

    setQuantityDrafts((previous) => {
      const next = { ...previous };

      if (next[product.id] !== undefined) {
        delete next[product.id];
      } else {
        next[product.id] = "1";
      }

      return next;
    });
  };

  /* ==========================================================
     QUANTITY HELPERS
     ========================================================== */

  const getCurrentQuantity = (productId: string): number => {
    const current = selected[productId]?.quantity ?? 1;

    const draft = quantityDrafts[productId];

    if (draft === undefined || draft.trim() === "") {
      return current;
    }

    const parsed = Number(draft);

    if (!Number.isSafeInteger(parsed) || parsed < 1) {
      return current;
    }

    return parsed;
  };

  const commitQuantity = (
    productId: string,
    value: number
  ) => {
    if (
      !selected[productId] ||
      completedIds.has(productId) ||
      submitting
    ) {
      return;
    }

    const normalized = normalizeQuantity(value);

    setSelected((previous) => {
      const current = previous[productId];

      if (!current) return previous;

      return {
        ...previous,
        [productId]: {
          ...current,
          quantity: normalized,
        },
      };
    });

    setQuantityDrafts((previous) => ({
      ...previous,
      [productId]: String(normalized),
    }));
  };

  const handleQuantityInput = (
    productId: string,
    raw: string
  ) => {
    if (
      !selected[productId] ||
      completedIds.has(productId) ||
      submitting
    ) {
      return;
    }

    // Allow only whole-number input.
    if (raw !== "" && !/^\d+$/.test(raw)) {
      return;
    }

    setQuantityDrafts((previous) => ({
      ...previous,
      [productId]: raw,
    }));

    // Keep the actual selected quantity synchronized whenever
    // the user enters a valid positive whole number.
    if (raw !== "") {
      const parsed = Number(raw);

      if (
        Number.isSafeInteger(parsed) &&
        parsed >= 1
      ) {
        setSelected((previous) => {
          const current = previous[productId];

          if (!current) return previous;

          return {
            ...previous,
            [productId]: {
              ...current,
              quantity: parsed,
            },
          };
        });
      }
    }
  };

  const increaseQuantity = (productId: string) => {
    if (!selected[productId]) return;

    const current = getCurrentQuantity(productId);

    if (current >= Number.MAX_SAFE_INTEGER) return;

    commitQuantity(productId, current + 1);
  };

  const decreaseQuantity = (productId: string) => {
    if (!selected[productId]) return;

    const current = getCurrentQuantity(productId);

    if (current <= 1) return;

    commitQuantity(productId, current - 1);
  };

  const handleQuantityBlur = (productId: string) => {
    if (!selected[productId]) return;

    commitQuantity(
      productId,
      getCurrentQuantity(productId)
    );
  };

  const handleQuantityKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
    }
  };

  /* ==========================================================
     SUBMIT VALIDATION
     ========================================================== */

  const validateSubmission = (): boolean => {
    if (!businessId || !branchId) {
      toast.error("Business or branch information is missing.");
      return false;
    }

    if (pendingProducts.length === 0) {
      toast.info("There are no pending products to initialize.");
      return false;
    }

    for (const item of pendingProducts) {
      const { product, quantity } = item;

      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1
      ) {
        toast.error(
          `Enter a valid opening quantity for ${product.name}.`
        );

        return false;
      }

      if (
        !Number.isFinite(product.costPrice) ||
        product.costPrice < 0
      ) {
        toast.error(
          `Invalid cost price for ${product.name}.`
        );

        return false;
      }

      if (product.businessId !== businessId) {
        toast.error(
          `${product.name} does not belong to this business.`
        );

        return false;
      }
    }

    return true;
  };

  /* ==========================================================
     INITIALIZE BRANCH INVENTORY
     ========================================================== */

  const handleSubmit = async () => {
    if (submitting || !validateSubmission()) return;

    setSubmitting(true);
    setError("");

    const failures: string[] = [];

    let successfulCount = 0;

    try {
      // Sequential processing allows individual product results
      // to be tracked and failed products to be retried.
      for (const item of pendingProducts) {
        const { product, quantity } = item;

        try {
          const inventoryId = inventoryKey(
            product.id,
            branchId!
          );

          await app.inventory.createStock({
            id: inventoryId,
            productId: product.id,
            quantity,
            costPrice: product.costPrice,
            mode: "OPENING",
          });

          successfulCount++;

          setCompletedIds((previous) => {
            const next = new Set(previous);

            next.add(product.id);

            return next;
          });
        } catch (err) {
          failures.push(
            `${product.name}: ${getErrorMessage(err)}`
          );
        }
      }

      if (failures.length > 0) {
        const message =
          `${successfulCount} product(s) initialized successfully. ` +
          `${failures.length} product(s) failed.`;

        setError(
          `${message} Correct the failed products and retry.`
        );

        toast.error(message);

        return;
      }

      toast.success(
        `Successfully initialized ${successfulCount} product(s).`
      );

      navigate(
        `/owner/branches/${encodeURIComponent(branchId!)}/inventory`,
        { replace: true }
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ==========================================================
     INVALID ROUTE
     ========================================================== */

  if (!branchId) {
    return (
      <div className="min-h-screen bg-[#080d12] p-8 text-white">
        Invalid branch ID.
      </div>
    );
  }

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080d12] px-4 py-8 text-white sm:px-6 lg:px-8">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">

        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={() => navigate("/owner-dashboard")}
          disabled={submitting}
          className="mb-7 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white disabled:opacity-50"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </button>

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <GlassIcon size="lg" variant="primary">
              <Warehouse size={25} />
            </GlassIcon>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Initialize Branch Inventory
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Select products and enter their opening stock quantities.
              </p>

              <p className="mt-2 text-xs font-medium text-teal-400">
                {branchName || "Loading branch..."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-xs text-slate-400">
              Selected products
            </p>

            <p className="mt-1 text-xl font-semibold tabular-nums">
              {selectedProducts.length}
            </p>
          </div>
        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <GlassIcon size="md" variant="primary">
                <Package size={19} />
              </GlassIcon>

              <div>
                <p className="text-xs text-slate-400">
                  Available products
                </p>

                <p className="text-xl font-semibold">
                  {products.length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <GlassIcon size="md" variant="success">
                <Boxes size={19} />
              </GlassIcon>

              <div>
                <p className="text-xs text-slate-400">
                  Selected products
                </p>

                <p className="text-xl font-semibold">
                  {selectedProducts.length}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <GlassIcon size="md" variant="primary">
                <TrendingUp size={19} />
              </GlassIcon>

              <div>
                <p className="text-xs text-slate-400">
                  Total opening units
                </p>

                <p className="text-xl font-semibold tabular-nums">
                  {totalUnits.toLocaleString("en-NG")}
                </p>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* CATALOGUE */}

        <GlassCard variant="elevated" className="p-5 sm:p-7">

          {/* CATALOGUE HEADER */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Business product catalogue
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Choose the products this branch will carry.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <GlassInput
                value={search}
                onChange={(value) =>
                  setSearch(
                    typeof value === "string" ? value : ""
                  )
                }
                placeholder="Search products..."
                disabled={loading || submitting}
              />
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4"
            >
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0 text-red-400"
              />

              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          )}

          {/* LOADING */}

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-slate-400">
              <Loader2 className="animate-spin" size={20} />
              Loading business products...
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <Package
                size={38}
                className="mb-3 text-slate-500"
              />

              <p className="font-medium">
                No products found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add products to your business catalogue first.
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No products match your search.
            </div>
          ) : (

            /* PRODUCT LIST */

            <div className="space-y-3">

              {filteredProducts.map((product) => {
                const isSelected = Boolean(
                  selected[product.id]
                );

                const isCompleted = completedIds.has(
                  product.id
                );

                const quantity =
                  selected[product.id]?.quantity ?? 1;

                const quantityInput =
                  quantityDrafts[product.id] ??
                  String(quantity);

                const canDecrease = quantity > 1;

                const canIncrease =
                  quantity < Number.MAX_SAFE_INTEGER;

                return (
                  <div
                    key={product.id}
                    className={`
                      rounded-xl border p-4 transition-all duration-200
                      ${
                        isCompleted
                          ? "border-teal-500/30 bg-teal-500/[0.06]"
                          : isSelected
                            ? "border-teal-500/40 bg-teal-500/[0.05]"
                            : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                      }
                    `}
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                      {/* PRODUCT SELECTION */}

                      <button
                        type="button"
                        onClick={() => toggleProduct(product)}
                        disabled={
                          submitting || isCompleted
                        }
                        aria-pressed={
                          isSelected || isCompleted
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-not-allowed"
                      >

                        {/* CHECKBOX */}

                        <span
                          className={`
                            flex h-6 w-6 shrink-0 items-center justify-center
                            rounded-md border transition
                            ${
                              isCompleted
                                ? "border-teal-400 bg-teal-500 text-white"
                                : isSelected
                                  ? "border-teal-400 bg-teal-500/20 text-teal-300"
                                  : "border-white/20 text-transparent"
                            }
                          `}
                        >
                          <CheckCircle2 size={16} />
                        </span>

                        {/* IMAGE */}

                        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package
                              size={20}
                              className="text-slate-500"
                            />
                          )}
                        </span>

                        {/* PRODUCT DETAILS */}

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-white">
                            {product.name}
                          </span>

                          <span className="mt-1 block truncate text-xs text-slate-400">
                            {product.sku ||
                              product.category ||
                              "No SKU"}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            Cost: {formatMoney(product.costPrice)}
                          </span>
                        </span>
                      </button>

                      {/* QUANTITY CONTROLS */}

                      <div className="flex items-center justify-between gap-4 lg:justify-end">

                        {isCompleted ? (
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-teal-400">
                            <CheckCircle2 size={15} />
                            Initialized
                          </span>
                        ) : (
                          <div className="w-full space-y-2 sm:w-auto">

                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium text-slate-400">
                                Opening quantity
                              </span>

                              {isSelected && (
                                <span className="text-[10px] text-teal-400">
                                  {quantity.toLocaleString("en-NG")} units
                                </span>
                              )}
                            </div>

                            <div className={`
                              flex h-12 w-full items-center overflow-hidden
                              rounded-xl border bg-white/[0.04]
                              backdrop-blur-sm transition-colors
                              sm:w-48
                              ${
                                isSelected
                                  ? "border-teal-500/30"
                                  : "border-white/10"
                              }
                            `}>

                              {/* DECREASE */}

                              <button
                                type="button"
                                disabled={
                                  !isSelected ||
                                  submitting ||
                                  !canDecrease
                                }
                                onClick={() =>
                                  decreaseQuantity(product.id)
                                }
                                className="
                                  flex h-full w-12 shrink-0
                                  items-center justify-center
                                  text-slate-300 transition
                                  hover:bg-white/[0.08]
                                  active:scale-90
                                  disabled:opacity-30
                                "
                                aria-label={`Decrease ${product.name} quantity`}
                              >
                                <Minus size={16} />
                              </button>

                              {/* DIRECT INPUT */}

                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={
                                  isSelected
                                    ? quantityInput
                                    : "1"
                                }
                                disabled={
                                  !isSelected || submitting
                                }
                                onChange={(event) =>
                                  handleQuantityInput(
                                    product.id,
                                    event.target.value
                                  )
                                }
                                onBlur={() =>
                                  handleQuantityBlur(product.id)
                                }
                                onKeyDown={handleQuantityKeyDown}
                                className="
                                  h-full min-w-0 flex-1
                                  bg-transparent px-1
                                  text-center text-base
                                  font-bold text-white
                                  outline-none
                                  disabled:opacity-40
                                "
                                aria-label={`Opening quantity for ${product.name}`}
                              />

                              {/* INCREASE */}

                              <button
                                type="button"
                                disabled={
                                  !isSelected ||
                                  submitting ||
                                  !canIncrease
                                }
                                onClick={() =>
                                  increaseQuantity(product.id)
                                }
                                className="
                                  flex h-full w-12 shrink-0
                                  items-center justify-center
                                  text-slate-300 transition
                                  hover:bg-white/[0.08]
                                  active:scale-90
                                  disabled:opacity-30
                                "
                                aria-label={`Increase ${product.name} quantity`}
                              >
                                <Plus size={16} />
                              </button>

                            </div>

                            {!isSelected && (
                              <p className="text-[10px] text-slate-500">
                                Select product to enter quantity
                              </p>
                            )}

                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}

          {/* SUBMISSION FOOTER */}

          <div className="mt-7 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-medium text-white">
                {completedIds.size} of {selectedProducts.length} selected products initialized
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Only selected products will receive opening stock.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              <GlassButton
                variant="secondary"
                onClick={() =>
                  navigate("/owner-dashboard")
                }
                disabled={submitting}
              >
                Cancel
              </GlassButton>

              <GlassButton
                variant="primary"
                onClick={handleSubmit}
                disabled={
                  loading ||
                  submitting ||
                  selectedProducts.length === 0 ||
                  pendingProducts.length === 0
                }
                icon={
                  submitting ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={17} />
                  )
                }
              >
                {submitting
                  ? "Creating branch stock..."
                  : `Initialize ${pendingProducts.length} product(s)`}
              </GlassButton>

            </div>
          </div>

        </GlassCard>
      </div>
    </div>
  );
}
