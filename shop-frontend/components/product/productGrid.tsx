"use client";

import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { createProduct } from "@/services/productService";
import {
  ProductType,
  ProductStockMode,
} from "@/types/types";

type Props = {
  onClose: () => void;
};

export function AddProductDrawer({ onClose }: Props) {
  const addProduct = useInventoryStore((s) => s.addProduct);

  const [loading, setLoading] = useState(false);
  const [advanced, setAdvanced] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sellingPrice: "",
    costPrice: "",
    quantity: "1",
    categoryId: "",
    brandId: "",
    type: "OTHER" as ProductType,
    stockMode: "LIVE" as ProductStockMode,
  });

  // ---------------------------
  // VALIDATION
  // ---------------------------
  function validate() {
    if (!form.name.trim()) {
      throw new Error("Product name required");
    }

    if (!form.sellingPrice) {
      throw new Error("Selling price required");
    }

    if (Number(form.sellingPrice) <= 0) {
      throw new Error("Invalid selling price");
    }

    if (Number(form.quantity) < 0) {
      throw new Error("Invalid quantity");
    }
  }

  // ---------------------------
  // SAVE
  // ---------------------------
  const handleSave = async () => {
    try {
      setLoading(true);

      validate();

      const product = {
        id: crypto.randomUUID(),
        name: form.name,
        sellingPrice: Math.round(Number(form.sellingPrice) * 100),
        costPrice: Math.round(Number(form.costPrice || 0) * 100),
        quantity: Number(form.quantity),

        businessId: "b1",
        branchId: "br1",

        categoryId: form.categoryId || "default",
        brandId: form.brandId || "default",

        type: form.type,
        stockMode: form.stockMode,

        isActive: true,
        isDeleted: false,

        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      // 🔥 OPTIMISTIC UI
      addProduct(product);

      // 🔥 BACKGROUND WRITE
      await createProduct(product);

      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="fixed inset-0 bg-black/40 flex justify-end z-50">
      <div className="w-[360px] bg-white h-full p-4 flex flex-col">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Add Product</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* FORM */}
        <div className="space-y-3 flex-1 overflow-y-auto">
          {/* NAME */}
          <input
            placeholder="Product name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
            className="input"
          />

          {/* PRICE */}
          <input
            type="number"
            placeholder="Selling price (₦)"
            value={form.sellingPrice}
            onChange={(e) =>
              setForm({ ...form, sellingPrice: e.target.value })
            }
            className="input"
          />

          {/* QTY */}
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
            className="input"
          />

          {/* 🔽 ADVANCED TOGGLE */}
          <button
            onClick={() => setAdvanced(!advanced)}
            className="text-sm text-blue-600"
          >
            {advanced ? "Hide advanced" : "Show advanced"}
          </button>

          {/* ADVANCED */}
          {advanced && (
            <>
              <input
                type="number"
                placeholder="Cost price (₦)"
                value={form.costPrice}
                onChange={(e) =>
                  setForm({ ...form, costPrice: e.target.value })
                }
                className="input"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as ProductType,
                  })
                }
                className="input"
              >
                <option value="OTHER">Other</option>
                <option value="PHONE">Phone</option>
                <option value="ACCESSORY">Accessory</option>
                <option value="SERVICE">Service</option>
              </select>

              <select
                value={form.stockMode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stockMode:
                      e.target.value as ProductStockMode,
                  })
                }
                className="input"
              >
                <option value="LIVE">Live Stock</option>
                <option value="OPENING">Opening Stock</option>
              </select>
            </>
          )}
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white py-3 rounded-xl mt-3 active:scale-95"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </div>
  );
}