"use client";

import { useState } from "react";
import { useInventoryStore } from "@/store/inventoryStore";
import { createProduct } from "@/services/productService";

export function AddProductDrawer({ onClose }) {
  const addProduct = useInventoryStore((s) => s.addProduct);

  const [form, setForm] = useState({
    name: "",
    sellingPrice: "",
    costPrice: "",
    quantity: "",
  });

  const handleSave = async () => {
    const product = {
      id: crypto.randomUUID(),
      name: form.name,
      sellingPrice: Number(form.sellingPrice) * 100,
      costPrice: Number(form.costPrice) * 100,
      quantity: Number(form.quantity),
      businessId: "b1",
      branchId: "br1",
      createdAt: Date.now(),
    };

    // 🔥 1. INSTANT UI UPDATE
    addProduct(product);

    // 🔥 2. BACKGROUND DB WRITE
    await createProduct(product);

    // 🔥 3. CLOSE DRAWER
    onClose();
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[320px] bg-white shadow-xl p-4">
      <h2 className="font-bold mb-4">Add Product</h2>

      <input
        placeholder="Name"
        className="input"
        onChange={(e) =>
          setForm({ ...form, name: e.target.value })
        }
      />

      <input
        placeholder="Selling Price"
        className="input"
        onChange={(e) =>
          setForm({ ...form, sellingPrice: e.target.value })
        }
      />

      <input
        placeholder="Cost Price"
        className="input"
        onChange={(e) =>
          setForm({ ...form, costPrice: e.target.value })
        }
      />

      <input
        placeholder="Quantity"
        className="input"
        onChange={(e) =>
          setForm({ ...form, quantity: e.target.value })
        }
      />

      <button
        onClick={handleSave}
        className="bg-black text-white w-full py-3 rounded-xl mt-4"
      >
        Save Product
      </button>
    </div>
  );
}