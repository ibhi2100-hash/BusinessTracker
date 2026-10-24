/**
 * ProductSheet.tsx
 *
 * Product create/edit sheet with:
 * - SKU and barcode metadata
 * - Camera-based barcode scanning (requires HTTPS or localhost and camera permission)
 * - Existing-category selection and inline creation of a new category
 * - Cost/selling price, initial stock, reorder level, description and image URL
 *
 * Install scanner dependency:
 *   npm install @zxing/browser
 *
 * Integration contract:
 * - `categories` should be the distinct categories already present in the business.
 * - `onSubmit` must persist every field in the local database/command layer.
 * - For edit mode, the caller must provide `initialData` and perform an update operation.
 */


import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Barcode,
  X,
  ChevronDown,
  Package,
} from "lucide-react";

import { GlassSheet } from "../../ui/GlassSheet"; 
import { GlassInput } from "../../ui/GlassInput"; 
import { GlassButton } from "../../ui/GlassButton";

import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import type { LiveProduct } from "../../../Biztru/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository"; 

export interface ProductFormData {
  name: string;
  price: number;
  cost: number;
  quantity: number;
  sku: string;
  barcode: string;
  category: string;
  description: string;
  imageUrl: string;
  reorderLevel: number;
}

interface Props {
  open: boolean;
  mode: "create" | "edit" | "manage";
  initialData?: LiveProduct | null;
  initialBarcode?: string;
  categories: string[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: ProductFormData) => void | Promise<void>;
}

type FormState = {
  name: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
  sku: string;
  barcode: string;
  category: string;
  newCategory: string;
  description: string;
  imageUrl: string;
  reorderLevel: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "",
  sku: "",
  barcode: "",
  category: "",
  newCategory: "",
  description: "",
  imageUrl: "",
  reorderLevel: "0",
};
export default function ProductSheet({
  open,
  mode,
  initialData,
  initialBarcode,
  categories,
  loading = false,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const costRef =
    useRef<HTMLInputElement>(null);

  const sellingRef =
    useRef<HTMLInputElement>(null);

  const quantityRef =
    useRef<HTMLInputElement>(null);


  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<IScannerControls | null>(null);

  /*
   * ==========================================================
   * NUMBER FORMATTING
   * ==========================================================
   *
   * Internally:
   *
   *     "250000"
   *
   * Displayed:
   *
   *     "250,000"
   *
   * This means commas never become part of the persisted
   * numeric value.
   */

  const formatNumber = (
    value: string | number | null | undefined
  ): string => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "";
    }

    const raw = String(value).replace(/,/g, "");

    if (!/^\d+$/.test(raw)) {
      return "";
    }

    return Number(raw).toLocaleString("en-NG");
  };

  const parseNumber = (
    value: string
  ): number => {
    const raw = value.replace(/,/g, "");

    if (!raw) {
      return 0;
    }

    const number = Number(raw);

    return Number.isFinite(number)
      ? number
      : 0;
  };

  /*
 * HYDRATE FORM
 *
 * Create mode:
 *   Prefill the barcode from inventory quick lookup.
 *
 * Edit mode:
 *   Populate all fields from the existing product.
 *
 * Reopening the sheet:
 *   Reinitialize the form for the current product/barcode.
 */
useEffect(() => {
  if (!open) return;

  if (mode === "edit" && initialData) {
    setForm({
      name: initialData.name ?? "",
      costPrice: formatNumber(initialData.costPrice),
      sellingPrice: formatNumber(initialData.price),
      quantity: formatNumber(initialData.quantity ?? 0),
      sku: initialData.sku ?? "",
      barcode: initialData.barcode ?? "",
      category: initialData.category ?? "",
      newCategory: "",
      description: initialData.description ?? "",
      imageUrl: initialData.imageUrl ?? "",
      reorderLevel: formatNumber(
        initialData.reorderLevel ?? 0,
      ),
    });

    return;
  }

  // New product: preserve the barcode that triggered creation.
  setForm({
    ...EMPTY_FORM,
    barcode: initialBarcode?.trim() ?? "",
  });
}, [open, mode, initialData, initialBarcode]);

useEffect(() => {
  if (!scanning || !open) return;

  let cancelled = false;
  const reader = new BrowserMultiFormatReader();

  const startScanner = async () => {
    try {
      const videoElement = videoRef.current;

      if (!videoElement) {
        if (!cancelled) {
          setScannerError("Camera preview is unavailable. Close the scanner and try again.");
        }
        return;
      }

      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoElement,
        (result) => {
          if (cancelled || !result) return;

          const barcode = result.getText();

          setForm((previous) => ({
            ...previous,
            barcode,
          }));

          setScanning(false);
        }
      );

      if (cancelled) {
        controls.stop();
        return;
      }

      scannerControlsRef.current = controls;
    } catch {
      if (!cancelled) {
        setScannerError(
          "Unable to start the camera. Check camera permission or enter the barcode manually."
        );
      }
    }
  };

  void startScanner();

  return () => {
    cancelled = true;
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
  };
}, [scanning, open]);
  /*
   * ==========================================================
   * NUMERIC INPUT
   * ==========================================================
   */

  const metadataInputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 " +
  "px-3.5 py-3 text-sm text-white outline-none " +
  "placeholder:text-gray-500 focus:border-teal-400/50";

const updateField = (
  field: keyof FormState,
  value: string
) => {
  setForm((previous) => ({
    ...previous,
    [field]: value,
  }));
};

  const handleNumericChange = (
   field:
  | "costPrice"
  | "sellingPrice"
  | "quantity"
  | "reorderLevel",
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const value =
      event.target.value
        .replace(/,/g, "")
        .replace(/\D/g, "");

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /*
   * ==========================================================
   * DERIVED VALUES
   * ==========================================================
   */

  const cost =
    parseNumber(form.costPrice);

  const sellingPrice =
    parseNumber(form.sellingPrice);

  const quantity =
    parseNumber(form.quantity);

  const unitMargin =
    sellingPrice - cost;

  const marginPercentage =
    sellingPrice > 0
      ? (unitMargin / sellingPrice) * 100
      : 0;

  /*
   * ==========================================================
   * VALIDATION
   * ==========================================================
   */

  const hasName =
    form.name.trim().length > 0;

  const hasSellingPrice =
    sellingPrice > 0;

  const hasQuantity =
    quantity > 0;

  const isValid =
    hasName &&
    hasSellingPrice &&
    (mode !== "create" || hasQuantity) &&
    (form.category !== "__new__" || form.newCategory.trim().length > 0);

  /*
   * ==========================================================
   * RESET
   * ==========================================================
   */

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });
  };

  /*
   * ==========================================================
   * CLOSE
   * ==========================================================
   */

  const handleClose = () => {
    if (loading) {
      return;
    }

    resetForm();
    onClose();
  };

  /*
   * ==========================================================
   * SUBMIT
   * ==========================================================
   */

  const handleSubmit = async () => {
  if (loading || !isValid) return;

  const category =
    form.category === "__new__"
      ? form.newCategory.trim()
      : form.category.trim();

  try {
    await onSubmit({
      name: form.name.trim(),
      price: sellingPrice,
      cost: parseNumber(form.costPrice),
      quantity: parseNumber(form.quantity),
      sku: form.sku.trim(),
      barcode: form.barcode.trim(),
      category,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim(),
      reorderLevel: parseNumber(form.reorderLevel),
    });

    // Only reset after the submission succeeds.
    // If the parent throws, preserve the entered fields.
    resetForm();
  } catch (error) {
    // The parent handles displaying the error.
    // Keep the user's form data intact.
  }
};
  /*
   * ==========================================================
   * SHARED LARGE NUMERIC INPUT STYLE
   * ==========================================================
   */

  const numericInputClass = `
    h-24
    w-full
    border-0
    bg-transparent
    pl-14
    pr-5
    text-right
    text-4xl
    font-bold
    leading-none
    tracking-[-0.04em]
    text-white
    shadow-none
    outline-none
    placeholder:text-gray-700
    focus:border-0
    focus:ring-0
    sm:h-28
    sm:pl-16
    sm:pr-6
    sm:text-5xl
  `;

  /*
   * ==========================================================
   * RENDER
   * ==========================================================
   */

  if (!open) {
    return null;
  }

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title={
        mode !== "create" && initialData
          ? "Edit Product"
          : "Add Product"
      }
      subtitle={
        mode !== "create" && initialData
          ? "Update product information"
          : "Add a product to your inventory"
      }
      className="
        w-full
        sm:max-w-xl
        lg:max-w-2xl
        xl:max-w-3xl
      "
    >
      <div className="space-y-7 pb-4">

        {/* ==================================================
            PRODUCT IDENTITY
            ================================================== */}

        <section className="space-y-2">
          <label
            className="
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Product
          </label>

          <GlassInput
            value={form.name}
            onChange={(event) =>
              setForm((previous) => ({
                ...previous,
                name: event.target.value,
              }))
            }
            icon={<Package size={18} />}
            placeholder="e.g. USB-C Charger 20W"
            disabled={loading}
            className="h-13 rounded-2xl"
            autoComplete="off"
          />
        </section>

                
        {/* SKU */}
        <section className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            SKU / Product code
          </label>
          <input
            className={metadataInputClass}
            value={form.sku}
            onChange={(e) => updateField("sku", e.target.value)}
            placeholder="e.g. CHG-USB-001"
            disabled={loading}
          />
        </section>

        {/* BARCODE */}
        <section className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Barcode
          </label>

          <div className="flex gap-2">
            <input
              className={metadataInputClass}
              value={form.barcode}
              onChange={(e) => updateField("barcode", e.target.value)}
              placeholder="Scan or enter barcode"
              disabled={loading}
            />

            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setScannerError("");
                setScanning(true);
              }}
              aria-label="Scan product barcode"
              className="flex shrink-0 items-center justify-center rounded-xl border border-teal-400/20 bg-teal-400/10 px-4 text-teal-300 hover:bg-teal-400/20"
            >
              <Barcode size={21} />
            </button>
          </div>

          {scanning && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-black/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  Scan a product barcode
                </span>
                <button
                  type="button"
                  onClick={() => setScanning(false)}
                  aria-label="Close barcode scanner"
                  className="text-gray-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <video
                ref={videoRef}
                muted
                playsInline
                className="max-h-72 w-full rounded-xl bg-black object-contain"
              />

              <p className="text-xs text-gray-500">
                Point the camera at the product's barcode.
              </p>

              {scannerError && (
                <p role="alert" className="text-sm text-red-300">
                  {scannerError}
                </p>
              )}
            </div>
          )}
        </section>

        {/* CATEGORY */}
        <section className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Category
          </label>

          <div className="relative">
            <select
              className={`${metadataInputClass} appearance-none pr-10`}
              value={form.category}
              onChange={(e) => {
                updateField("category", e.target.value);
                updateField("newCategory", "");
              }}
              disabled={loading}
            >
              <option value="" className="bg-neutral-900">
                Select a category
              </option>

              {[...new Set([
                ...categories,
                ...(form.category && form.category !== "__new__"
                  ? [form.category]
                  : []),
              ])].map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-neutral-900"
                >
                  {category}
                </option>
              ))}

              <option value="__new__" className="bg-neutral-900">
                + Add new category
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
          </div>

          {form.category === "__new__" && (
            <input
              autoFocus
              className={metadataInputClass}
              value={form.newCategory}
              onChange={(e) =>
                updateField("newCategory", e.target.value)
              }
              placeholder="Enter new category"
              disabled={loading}
            />
          )}
        </section>

        {/* DESCRIPTION */}
        <section className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Description
          </label>

          <textarea
            className={`${metadataInputClass} min-h-24 resize-y`}
            value={form.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
            placeholder="Product specifications, model, condition..."
            disabled={loading}
          />
        </section>

        {/* IMAGE URL */}
        <section className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Product image URL
          </label>

          <input
            type="url"
            className={metadataInputClass}
            value={form.imageUrl}
            onChange={(e) => updateField("imageUrl", e.target.value)}
            placeholder="https://..."
            disabled={loading}
          />
        </section>

        {/* REORDER LEVEL */}
        <section className="space-y-2">
          <label className="text-xs uppercase tracking-wider text-gray-500">
            Low-stock alert quantity
          </label>

          <input
            inputMode="numeric"
            className={metadataInputClass}
            value={formatNumber(form.reorderLevel)}
            onChange={(e) =>
              handleNumericChange("reorderLevel", e)
            }
            placeholder="0"
            disabled={loading}
          />

          <p className="text-xs text-gray-500">
            Alert when available stock reaches this level.
          </p>
        </section>


        {/* ==================================================
            COST PRICE
            ================================================== */}

        <section>
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Cost price
          </label>

          <div
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-amber-400/20
              bg-black/20
              shadow-inner
              shadow-linear
              transition-all
              duration-200
              focus-within:border-amber-400/50
              focus-within:shadow-[0_0_0_1px_rgba(245,158,11,0.10),0_20px_70px_rgba(245,158,11,0.10)]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-amber-300/30
              "
            />

            <span
              className="
                absolute
                left-5
                top-1/2
                z-10
                -translate-y-1/2
                text-3xl
                font-medium
                text-amber-300
                sm:text-4xl
              "
            >
              ₦
            </span>

            <GlassInput
              ref={costRef}
              value={formatNumber(form.costPrice)}
              onChange={(event) =>
                handleNumericChange(
                  "costPrice",
                  event
                )
              }
              placeholder="0"
              inputMode="numeric"
              autoComplete="off"
              disabled={loading}
              className={numericInputClass}
              aria-label="Cost price"
            />
          </div>

          <div
            className="
              mt-2
              flex
              items-center
              justify-between
              px-1
            "
          >
            <p className="text-[11px] text-gray-600">
              Purchase cost per unit
            </p>

            {cost > 0 && (
              <p className="text-[11px] font-medium text-amber-400/70">
                ₦{formatNumber(cost)}
              </p>
            )}
          </div>
        </section>

        {/* ==================================================
            SELLING PRICE
            ================================================== */}

        <section>
          <label
            className="
              mb-2
              block
              text-xs
              font-medium
              uppercase
              tracking-wider
              text-gray-500
            "
          >
            Selling price
          </label>

          <div
            className="
              relative
              overflow-hidden
              rounded-[26px]
              border
              border-emerald-400/25
              bg-black/20
              shadow-inner
              shadow-linear
              transition-all
              duration-200
              focus-within:border-emerald-400/60
              focus-within:shadow-[0_0_0_1px_rgba(16,185,129,0.13),0_24px_80px_rgba(16,185,129,0.12)]
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-px
                bg-emerald-300/40
              "
            />

            <span
              className="
                absolute
                left-5
                top-1/2
                z-10
                -translate-y-1/2
                text-3xl
                font-medium
                text-emerald-300
                sm:text-4xl
              "
            >
              ₦
            </span>

            <GlassInput
              ref={sellingRef}
              value={formatNumber(
                form.sellingPrice
              )}
              onChange={(event) =>
                handleNumericChange(
                  "sellingPrice",
                  event
                )
              }
              placeholder="0"
              inputMode="numeric"
              autoComplete="off"
              disabled={loading}
              className={numericInputClass}
              aria-label="Selling price"
            />
          </div>

          <div
            className="
              mt-2
              flex
              items-center
              justify-between
              px-1
            "
          >
            <p className="text-[11px] text-gray-600">
              Customer price per unit
            </p>

            {sellingPrice > 0 && (
              <p className="text-[11px] font-medium text-emerald-400/70">
                ₦{formatNumber(sellingPrice)}
              </p>
            )}
          </div>

          {/* ================================================
              UNIT ECONOMICS
              ================================================ */}

          {sellingPrice > 0 &&
            cost > 0 && (
              <div
                className="
                  mt-3
                  rounded-2xl
                  border
                  border-white/6
                  bg-white/2.5
                  px-4
                  py-3
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Unit margin
                  </span>

                  <span
                    className={`
                      text-sm
                      font-semibold
                      ${
                        unitMargin >= 0
                          ? "text-emerald-300"
                          : "text-red-300"
                      }
                    `}
                  >
                    ₦
                    {formatNumber(
                      Math.abs(unitMargin)
                    )}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Gross margin
                  </span>

                  <span
                    className={`
                      text-xs
                      font-medium
                      ${
                        marginPercentage >= 0
                          ? "text-emerald-400/70"
                          : "text-red-400/70"
                      }
                    `}
                  >
                    {marginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
        </section>

        {/* ==================================================
            INITIAL QUANTITY
            ================================================== */}

        {mode === "create" && (
          <section>
            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                uppercase
                tracking-wider
                text-gray-500
              "
            >
              Initial quantity
            </label>

            <div
              className="
                relative
                overflow-hidden
                rounded-[26px]
                border
                border-blue-400/20
                bg-black/20
                shadow-inner
                shadow-linear
                transition-all
                duration-200
                focus-within:border-blue-400/50
                focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.10),0_20px_70px_rgba(59,130,246,0.10)]
              "
            >
              <div
                className="
                  pointer-events-none
                  absolute
                  inset-x-0
                  top-0
                  h-px
                  bg-blue-300/30
                "
              />

              <span
                className="
                  absolute
                  left-5
                  top-1/2
                  z-10
                  -translate-y-1/2
                  text-2xl
                  font-medium
                  text-blue-300
                  sm:text-3xl
                "
              >
                #
              </span>

              <GlassInput
                ref={quantityRef}
                value={formatNumber(
                  form.quantity
                )}
                onChange={(event) =>
                  handleNumericChange(
                    "quantity",
                    event
                  )
                }
                placeholder="0"
                inputMode="numeric"
                autoComplete="off"
                disabled={loading}
                className={numericInputClass}
                aria-label="Initial quantity"
              />
            </div>

            <div
              className="
                mt-2
                flex
                items-center
                justify-between
                px-1
              "
            >
              <p className="text-[11px] text-gray-600">
                Units entering inventory
              </p>

              {quantity > 0 && (
                <p className="text-[11px] font-medium text-blue-400/70">
                  {formatNumber(quantity)} units
                </p>
              )}
            </div>
          </section>
        )}

        {/* ==================================================
            CREATE VALUE PREVIEW
            ================================================== */}

        {mode === "create" &&
          cost > 0 &&
          quantity > 0 && (
            <div
              className="
                rounded-2xl
                border
                border-white/6
                bg-white/2
                px-4
                py-3
              "
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Initial inventory cost
                </span>

                <span className="text-sm font-semibold text-gray-200">
                  ₦
                  {formatNumber(
                    cost * quantity
                  )}
                </span>
              </div>

              {sellingPrice > 0 && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Potential sales value
                  </span>

                  <span className="text-xs font-medium text-gray-400">
                    ₦
                    {formatNumber(
                      sellingPrice *
                        quantity
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

        {/* ==================================================
            SAVE ACTION
            ================================================== */}

        <div className="pt-1">
          <GlassButton
            className="
              h-13
              w-full
              rounded-2xl
              font-semibold
              shadow-[0_8px_30px_rgba(255,255,255,0.06)]
              transition
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
            onClick={handleSubmit}
            disabled={!isValid || loading}
          >
            {loading
              ? "Saving..."
              : mode !== "create" && initialData
                ? "Save Changes"
                : "Save Product"}
          </GlassButton>
        </div>

      </div>
    </GlassSheet>
  );
}