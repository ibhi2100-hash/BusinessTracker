
import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  ArrowRight,
  Building2,
  Package,
  TrendingDown,
} from "lucide-react";

import { GlassSheet } from "../../ui/GlassSheet";
import { GlassInput } from "../../ui/GlassInput";
import { GlassButton } from "../../ui/GlassButton";

import {
  StockSheetNumberField,
  formatStockNumber,
  parseStockNumber,
  isValidStockQuantity,
} from "./StockSheetNumberField";

interface Branch {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  loading?: boolean;

  product: {
    id: string;
    name: string;
    quantity: number;
  } | null;

  branches: Branch[];

  onSubmit: (
    targetBranchId: string,
    quantity: number,
    note?: string
  ) => void | Promise<void>;
}

const SELECT_CLASS = `
  w-full
  appearance-none
  rounded-2xl
  border
  border-white/10
  bg-white/[0.035]
  px-4
  py-4
  pr-11
  text-sm
  text-white
  outline-none
  transition
  focus:border-teal-400/50
  focus:ring-1
  focus:ring-teal-400/20
  disabled:cursor-not-allowed
  disabled:opacity-50
`;

export default function TransferStockSheet({
  open,
  onClose,
  loading = false,
  product,
  branches,
  onSubmit,
}: Props) {
  const [branchId, setBranchId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const busy = loading || submitting;

  useEffect(() => {
    if (!open || !product) return;

    setBranchId("");
    setQuantity("");
    setNote("");
    setSubmitting(false);
  }, [open, product?.id]);

  if (!open || !product) return null;

  const currentStock = Number.isFinite(product.quantity)
    ? Math.max(0, product.quantity)
    : 0;

  const transferQuantity = parseStockNumber(quantity);

  const projectedStock =
    currentStock - transferQuantity;

  const selectedBranch = branches.find(
    (branch) => branch.id === branchId
  );

  const valid =
    Boolean(selectedBranch) &&
    isValidStockQuantity(transferQuantity) &&
    transferQuantity <= currentStock &&
    Number.isSafeInteger(projectedStock) &&
    projectedStock >= 0;

  const handleClose = () => {
    if (busy) return;

    setBranchId("");
    setQuantity("");
    setNote("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!valid || !selectedBranch || busy) return;

    setSubmitting(true);

    try {
      await onSubmit(
        selectedBranch.id,
        transferQuantity,
        note.trim() || undefined
      );

      setBranchId("");
      setQuantity("");
      setNote("");
    } catch {
      // Preserve form values if submission fails.
      // The parent handles displaying errors.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassSheet
      open={open}
      onClose={handleClose}
      title="Transfer Stock"
      subtitle={product.name}
      className="
        w-full
        sm:max-w-xl
        lg:max-w-2xl
        xl:max-w-3xl
      "
    >
      <div className="space-y-7 pb-4">

        {/* CURRENT INVENTORY */}

        <section className="
          rounded-[26px]
          border
          border-white/10
          bg-white/[0.025]
          p-5
          backdrop-blur-xl
        ">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500">
                Current stock
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {formatStockNumber(String(currentStock))}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Available inventory units
              </p>
            </div>

            <div className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-400/20
              bg-blue-400/10
              text-blue-300
            ">
              <Package size={25} />
            </div>

          </div>
        </section>

        {/* DESTINATION BRANCH */}

        <section className="space-y-2">
          <label className="
            block
            text-xs
            font-medium
            uppercase
            tracking-wider
            text-gray-500
          ">
            Destination branch
          </label>

          <div className="relative">
            <div className="
              pointer-events-none
              absolute
              left-4
              top-1/2
              z-10
              -translate-y-1/2
              text-teal-300
            ">
              <Building2 size={19} />
            </div>

            <select
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              disabled={busy || branches.length === 0}
              className={`${SELECT_CLASS} pl-12`}
              aria-label="Destination branch"
            >
              <option
                value=""
                className="bg-neutral-900"
              >
                Select destination branch
              </option>

              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                  className="bg-neutral-900"
                >
                  {branch.name}
                </option>
              ))}
            </select>

            <ArrowRight
              size={17}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-gray-500
              "
            />
          </div>

          {branches.length === 0 && (
            <p className="text-xs text-amber-300">
              No destination branches are available.
            </p>
          )}

        </section>

        {/* TRANSFER QUANTITY */}

        <StockSheetNumberField
          label="Transfer quantity"
          value={quantity}
          onChange={setQuantity}
          accent="blue"
          prefix="#"
          placeholder="0"
          helper="Units being moved to another branch"
          disabled={busy}
          ariaLabel="Transfer quantity"
        />

        {/* TRANSFER PREVIEW */}

        {transferQuantity > 0 && (
          <section className="
            space-y-4
            rounded-2xl
            border
            border-white/10
            bg-white/[0.025]
            p-4
          ">

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Transferring
              </span>

              <span className="text-sm font-semibold text-blue-300">
                {formatStockNumber(String(transferQuantity))} units
              </span>
            </div>

            {selectedBranch && (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Building2 size={16} className="text-teal-400" />

                  <span className="text-xs text-gray-500">
                    Destination
                  </span>
                </div>

                <span className="max-w-[65%] truncate text-sm font-medium text-white">
                  {selectedBranch.name}
                </span>
              </div>
            )}

            <div className="h-px bg-white/10" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={16} className="text-amber-400" />

                <span className="text-xs text-gray-400">
                  Remaining stock
                </span>
              </div>

              <span className={`
                text-xl
                font-bold
                ${
                  projectedStock < 0
                    ? "text-red-300"
                    : "text-white"
                }
              `}>
                {formatStockNumber(String(projectedStock))}
              </span>
            </div>

            {transferQuantity > currentStock && (
              <p className="text-xs text-red-300">
                Transfer quantity exceeds the available stock.
              </p>
            )}

          </section>
        )}

        {/* TRANSFER NOTE */}

        <section className="space-y-2">
          <label className="
            block
            text-xs
            font-medium
            uppercase
            tracking-wider
            text-gray-500
          ">
            Transfer note
          </label>

          <GlassInput
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Branch replenishment..."
            disabled={busy}
            autoComplete="off"
            className="h-14 rounded-2xl"
          />
        </section>

        {/* SUBMIT */}

        <GlassButton
          className="
            h-13
            w-full
            rounded-2xl
            font-semibold
            shadow-[0_8px_30px_rgba(255,255,255,0.06)]
            transition
            active:scale-[0.98]
          "
          disabled={!valid || busy}
          onClick={handleSubmit}
        >
          {busy ? (
            "Transferring Stock..."
          ) : (
            <>
              <ArrowLeftRight size={18} />
              Transfer Stock
            </>
          )}
        </GlassButton>

      </div>
    </GlassSheet>
  );
}
