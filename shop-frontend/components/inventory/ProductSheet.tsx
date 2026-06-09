"use client";

import { useEffect, useRef, useState } from "react";
import { Product } from "@business/shared-types";
import { Package, Tag, DollarSign } from "lucide-react";
import { GlassSheet } from "@/components/ui/GlassSheet";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassButton } from "@/components/ui/GlassButton";

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
        costPrice: String(initialData.costPrice),
        sellingPrice: String(initialData.price),
        quantity: String(form.quantity),
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
  <GlassSheet
      open={open}
      onClose={onClose}
      title={
        mode === "edit"
          ? "Edit Product"
          : "Add Product"
      }
      subtitle="Manage inventory items"
    >
  <div className="space-y-4">

    <GlassInput
      value={form.name}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          name: e.target.value,
        }))
      }
      icon={<Package size={18} />}
      placeholder="Product name"
    />

    <GlassInput
      type="number"
      value={form.costPrice}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          costPrice: e.target.value,
        }))
      }
      icon={<DollarSign size={18} />}
      placeholder="Cost price"
    />

    <GlassInput
      type="number"
      value={form.sellingPrice}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          sellingPrice: e.target.value,
        }))
      }
      icon={<Tag size={18} />}
      placeholder="Selling price"
    />

    <GlassInput
      type="number"
      value={form.quantity}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          quantity: e.target.value,
        }))
      }
      icon={<Package size={18} />}
      placeholder="Quantity"
    />

    <GlassButton
      className="w-full"
      onClick={handleSubmit}
      disabled={!isValid || loading}
    >
      Save Product
    </GlassButton>

  </div>
</GlassSheet>
  );
}