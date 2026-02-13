"use client";

import { useEffect, useState } from "react";

type InventoryItem = {
  _id: string;
  name: string;
  category: string;
  brand: string;
  model?: string;
  stock: number;
  costPrice: number;
  sellingPrice: number;
};

type Option = {
  _id: string;
  name: string;
};

type PurchaseFormItem = {
  name: string;
  categoryId: string;
  brandId: string;
  newCategory?: string;
  newBrand?: string;
  model?: string;
  purchaseQty: number;
  costPrice: number;
  sellingPrice: number;
};

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [netCash, setNetCash] = useState(0);

  const [formList, setFormList] = useState<PurchaseFormItem[]>([
    {
      name: "",
      categoryId: "",
      brandId: "",
      model: "",
      purchaseQty: 0,
      costPrice: 0,
      sellingPrice: 0,
    },
  ]);

  /* -------------------- LOAD DATA -------------------- */

  async function loadItems() {
    const res = await fetch("/api/items", { credentials: "include" });
    const data = await res.json();
    setItems(Array.isArray(data) ? data : data.items || []);
  }

  async function loadMeta() {
    const [cRes, bRes] = await Promise.all([
      fetch("/api/meta/categories"),
      fetch("/api/meta/brands"),
    ]);

    setCategories(await cRes.json());
    setBrands(await bRes.json());
  }

  async function fetchNetCash() {
    const res = await fetch("/api/admin/stats", { cache: "no-store" });
    const data = await res.json();
    setNetCash(data.balance || 0);
  }

  useEffect(() => {
    loadItems();
    loadMeta();
    fetchNetCash();
  }, []);

  /* -------------------- FORM HANDLING -------------------- */

  function handleChange(
    index: number,
    field: keyof PurchaseFormItem,
    value: any
  ) {
    const updated = [...formList];
    updated[index] = { ...updated[index], [field]: value };
    setFormList(updated);
  }

  function addFormRow() {
    setFormList([
      ...formList,
      {
        name: "",
        categoryId: "",
        brandId: "",
        model: "",
        purchaseQty: 0,
        costPrice: 0,
        sellingPrice: 0,
      },
    ]);
  }

  function removeFormRow(index: number) {
    setFormList(formList.filter((_, i) => i !== index));
  }

  /* -------------------- SUBMIT -------------------- */

  async function submitPurchase() {
    const payload = formList.map((f) => ({
      ...f,
      category:
        f.categoryId === "new" ? f.newCategory : f.categoryId,
      brand: f.brandId === "new" ? f.newBrand : f.brandId,
    }));

    const res = await fetch("/api/inventory/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      return alert(err.error || "Failed");
    }

    alert("Stock updated!");
    setFormList([formList[0]]);
    loadItems();
    loadMeta();
    fetchNetCash();
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      {/* Net Cash */}
      <div className="p-4 bg-yellow-100 rounded-xl font-semibold">
        Net Cash: <span className="text-green-600">₦{netCash.toLocaleString()}</span>
      </div>

      {/* Purchase Form */}
      <div className="bg-white rounded-2xl p-6 shadow space-y-6">
        <h2 className="text-xl font-semibold">Add / Update Stock</h2>

        {formList.map((form, index) => (
          <div key={index} className="grid gap-3 border-b pb-4">
            {/* Item Name */}
          <div className="flex flex-col gap-1">
            <label
              htmlFor={`name-${index}`}
              className="text-sm font-medium text-gray-700"
            >
              Item Name
            </label>

            <input
              id={`name-${index}`}
              name="name"
              className="p-3 border rounded-xl"
              value={form.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
            />
          </div>

            {/* Category */}
            <label className="text-sm font-medium">Category</label>
            <select
              aria-label="categories"
              className="p-3 border rounded-xl"
              value={form.categoryId}
              onChange={(e) => handleChange(index, "categoryId", e.target.value)}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
              <option value="new">+ Add new category</option>
            </select>

            {form.categoryId === "new" && (
              <input
                className="p-3 border rounded-xl"
                placeholder="New category name"
                onChange={(e) =>
                  handleChange(index, "newCategory", e.target.value)
                }
              />
            )}

            {/* Brand */}
            <label className="text-sm font-medium">Brand</label>
            <select
              aria-label="brands"
              className="p-3 border rounded-xl"
              value={form.brandId}
              onChange={(e) => handleChange(index, "brandId", e.target.value)}
            >
              <option value="">Select brand</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
              <option value="new">+ Add new brand</option>
            </select>

            {form.brandId === "new" && (
              <input
                className="p-3 border rounded-xl"
                placeholder="New brand name"
                onChange={(e) =>
                  handleChange(index, "newBrand", e.target.value)
                }
              />
            )}

            {/* Numbers */}
            <input
              type="number"
              className="p-3 border rounded-xl"
              placeholder="Quantity"
              value={form.purchaseQty}
              onChange={(e) =>
                handleChange(index, "purchaseQty", Number(e.target.value))
              }
            />
            <input
              type="number"
              className="p-3 border rounded-xl"
              placeholder="Cost Price"
              value={form.costPrice}
              onChange={(e) =>
                handleChange(index, "costPrice", Number(e.target.value))
              }
            />
            <input
              type="number"
              className="p-3 border rounded-xl"
              placeholder="Selling Price"
              value={form.sellingPrice}
              onChange={(e) =>
                handleChange(index, "sellingPrice", Number(e.target.value))
              }
            />

            <button
              onClick={() => removeFormRow(index)}
              className="text-red-600 text-sm self-start"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="flex gap-4">
          <button
            onClick={addFormRow}
            className="bg-gray-200 p-3 rounded-xl"
          >
            Add Another Item
          </button>
          <button
            onClick={submitPurchase}
            className="bg-black text-white p-3 rounded-xl"
          >
            Submit Purchase
          </button>
        </div>
      </div>
    </div>
  );
}
