"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";

import { GlassSheet } from "../ui/GlassSheet";
import { GlassInput } from "../ui/GlassInput";
import { GlassButton } from "../ui/GlassButton";

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
  ) => void;
}

export default function TransferStockSheet({
  open,
  onClose,
  loading,
  product,
  branches,
  onSubmit,
}: Props) {
  const [branchId, setBranchId] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [note, setNote] =
    useState("");

  if (!open || !product) return null;

  const valid =
    branchId &&
    Number(quantity) > 0;

  const handleSubmit = () => {
    if (!valid) return;

    onSubmit(
      branchId,
      Number(quantity),
      note
    );

    setQuantity("");
    setNote("");
    setBranchId("");
  };

  return (
    <GlassSheet
      open={open}
      onClose={onClose}
      title="Transfer Stock"
      subtitle={product.name}
    >
      <div className="space-y-4">

        <select
          value={branchId}
          onChange={(e) =>
            setBranchId(e.target.value)
          }
          className="
            w-full
            rounded-2xl
            border
            border-white/20
            bg-transparent
            p-4
            backdrop-blur-xl
          "
        >
          <option value="">
            Select Branch
          </option>

          {branches.map((branch) => (
            <option
              key={branch.id}
              value={branch.id}
            >
              {branch.name}
            </option>
          ))}
        </select>

        <GlassInput
          type="number"
          value={quantity}
          onChange={(e) =>
            setQuantity(e.target.value)
          }
          placeholder="Transfer Quantity"
        />

        <GlassInput
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          placeholder="Transfer Note"
        />

        <GlassButton
          className="w-full"
          disabled={!valid || loading}
          onClick={handleSubmit}
        >
          <ArrowLeftRight size={18} />
          Transfer Stock
        </GlassButton>

      </div>
    </GlassSheet>
  );
}