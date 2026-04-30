"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@/types/types";
import { Package, Tag, DollarSign } from "lucide-react";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Product | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    price: number;
    cost: number;
    quantity: number;
  }) => void;
}

export default function ProductSheet({
  open,
  mode,
  initialData,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
  });

  const costRef = useRef<HTMLInputElement>(null);
  const sellingRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);

  // 🔥 hydrate form when editing
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        costPrice: String(initialData.cost),
        sellingPrice: String(initialData.price),
        quantity: String(initialData.quantity),
      });
    } else {
      setForm({
        name: "",
        costPrice: "",
        sellingPrice: "",
        quantity: "",
      });
    }
  }, [mode, initialData]);

  if (!open) return null;

  const isValid =
    form.name.trim().length > 0 &&
    form.sellingPrice !== "" &&
    Number(form.sellingPrice) > 0 &&
    form.quantity !== "" &&
    Number(form.quantity) > 0;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (!form.sellingPrice) return;
    if (Number(form.quantity) <= 0) return;
    if(!isValid) return;

    onSubmit({
      name: form.name,
      price: Number(form.sellingPrice),
      cost: Number(form.costPrice || 0),
      quantity: Number(form.quantity),
    });

    resetForm()
  };
  const resetForm = () => {
  setForm({
    name: "",
    costPrice: "",
    sellingPrice: "",
    quantity: "",
  });
};

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-3xl p-5 pb-8 animate-slideUp shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          {mode === "edit" ? "Edit Product" : "Add Product"}
        </h2>

        <div className="flex flex-col gap-3">
          {/* NAME */}
          <input
            autoFocus
            placeholder="Product name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") costRef.current?.focus();
            }}
            className="border rounded-xl px-3 py-3"
          />

          {/* PRICES */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <DollarSign className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
              <input
                ref={costRef}
                type="number"
                placeholder="Cost"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: e.target.value })
                }
                className="border rounded-xl px-8 py-3 w-full"
              />
            </div>

            <div className="relative">
              <Tag className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
              <input
                ref={sellingRef}
                type="number"
                placeholder="Selling"
                value={form.sellingPrice}
                onChange={(e) =>
                  setForm({ ...form, sellingPrice: e.target.value })
                }
                className="border rounded-xl px-8 py-3 w-full"
              />
            </div>
          </div>

          {/* QUANTITY */}
          <div className="relative">
            <Package className="absolute left-2 top-3 w-4 h-4 text-gray-400" />
            <input
              ref={qtyRef}
              type="number"
              placeholder="Quantity"
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: e.target.value })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="border rounded-xl px-8 py-3 w-full"
            />
          </div>

          {/* SUBMIT */}
          <button
            disabled={!isValid || loading}
            onClick={handleSubmit}
            className="mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold active:scale-95 transition"
          >
            {loading
              ? "Saving..."
              : mode === "edit"
              ? "Update Product"
              : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
}