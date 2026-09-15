"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Package,
  Tag,
  DollarSign,
} from "lucide-react";

import { GlassSheet } from "@/components/ui/GlassSheet";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";

import { LiveProduct } from "@/src/offline/sqlite/businessDatabase/repositories/SQLiteProjectionRepository/SQLiteProductRepository";

interface Props {
  open: boolean;
  mode: "create" | "edit" | "manage";
  initialData?: LiveProduct | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: number;
    cost: number;
    quantity: number;
  }) => void;
}

type FormState = {
  name: string;
  costPrice: string;
  sellingPrice: string;
  quantity: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  costPrice: "",
  sellingPrice: "",
  quantity: "",
};

export default function ProductSheet({
  open,
  mode,
  initialData,
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
   * ==========================================================
   * HYDRATE FORM
   * ==========================================================
   */

  useEffect(() => {
    if (
      mode === "edit" &&
      initialData
    ) {
      setForm({
        name: initialData.name ?? "",
        costPrice: formatNumber(
          initialData.costPrice
        ),
        sellingPrice: formatNumber(
          initialData.price
        ),
        quantity: "",
      });

      return;
    }

    setForm(EMPTY_FORM);
  }, [mode, initialData]);

  /*
   * ==========================================================
   * NUMERIC INPUT
   * ==========================================================
   */

  const handleNumericChange = (
    field:
      | "costPrice"
      | "sellingPrice"
      | "quantity",
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
    (
      mode !== "create" ||
      hasQuantity
    );

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

  const handleSubmit = () => {
    if (loading) {
      return;
    }

    if (!isValid) {
      return;
    }

    onSubmit({
      name: form.name.trim(),
      price: sellingPrice,
      cost,
      quantity,
    });

    resetForm();
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
        mode === "edit"
          ? "Edit Product"
          : "Add Product"
      }
      subtitle={
        mode === "edit"
          ? "Update product information"
          : "Add a product to your inventory"
      }
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
              shadow-[0_0_0_1px_rgba(245,158,11,0.04),0_20px_60px_rgba(245,158,11,0.06)]
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
              shadow-[0_0_0_1px_rgba(16,185,129,0.05),0_24px_70px_rgba(16,185,129,0.07)]
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
                  border-white/[0.06]
                  bg-white/[0.025]
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
                shadow-[0_0_0_1px_rgba(59,130,246,0.04),0_20px_60px_rgba(59,130,246,0.06)]
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
                border-white/[0.06]
                bg-white/[0.02]
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
              : mode === "edit"
                ? "Save Changes"
                : "Save Product"}
          </GlassButton>
        </div>

      </div>
    </GlassSheet>
  );
}