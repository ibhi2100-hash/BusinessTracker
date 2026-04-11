"use client";

import { useState, useEffect } from "react";
import { useInventoryStore } from "../../store/inventoryStore";
import { InventoryItem } from "@/types/types";

interface Props {
  isOpen: boolean;
  mode: "create" | "edit";
  onClose: () => void;
  onSave: (product: any) => Promise<void> | void;
  product?: InventoryItem;
}

export default function ProductModal({
  isOpen,
  mode,
  onClose,
  onSave,
  product,
}: Props) {
  const {
    categories,
    brands,
    selectedCategoryId,
    selectedBrandId,
    setSelectedCategoryId,
    setSelectedBrandId,
  } = useInventoryStore();

  const [form, setForm] = useState<Partial<InventoryItem>>({});
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // -----------------------------
  // INIT ON OPEN
  // -----------------------------
  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      setForm(product);

    if(product.brandId )setSelectedBrandId(product.brandId);
    if(product.categoryId) setSelectedCategoryId(product.categoryId );

    } else {
      setForm({});
      setSelectedCategoryId(undefined);
      setSelectedBrandId(undefined);
    }
      setNewCategoryName(null);
      setNewBrandName(null);
      setCategoryImage(null);
    
  }, [ product]);

  // -----------------------------
  // RESET BRAND ON CATEGORY CHANGE (create mode only)
  // -----------------------------
  useEffect(() => {
    if (!product) {
      setSelectedBrandId(undefined);
    }
  }, [selectedCategoryId, product, setSelectedBrandId]);

  // -----------------------------
  // INPUT HANDLER
  // -----------------------------
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: ["sellingPrice", "costPrice", "quantity"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));
  };

  // -----------------------------
  // IMAGE HANDLER
  // -----------------------------
  const handleCategoryImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCategoryImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      if (!form.name || form.sellingPrice === undefined || form.quantity === undefined) {
        throw new Error("Name, selling price, and quantity are required");
      }

      if (!selectedCategoryId && !newCategoryName) {
        throw new Error("Category is required");
      }

      if (!selectedBrandId && !newBrandName) {
        throw new Error("Brand is required");
      }

      const sellingPrice = Number(form.sellingPrice);
      const costPrice = Number(form.costPrice || 0);
      const quantity = Number(form.quantity);

      if ([sellingPrice, costPrice, quantity].some((v) => isNaN(v))) {
        throw new Error("Prices and quantity must be valid numbers");
      }

      const payload = {
        name: form.name,
        description: form.description,

        sellingPrice,
        costPrice,
        quantity,

        type: form.type,
        stockMode: form.stockMode || "OPENING",

        model: form.model,
        imei: form.imei,
        condition: form.condition,

        categoryId: selectedCategoryId || null,
        categoryName: newCategoryName || null,

        brandId: selectedBrandId || null,
        brandName: newBrandName || null,
      };

      await onSave(payload);
    } catch (err: any) {
      alert(err.message || "Failed to save product");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isPhone = form.type === "PHONE";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <select
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            className="border p-2 rounded-md w-full shadow-sm"
          >
            <option value="">Select Product Type</option>
            <option value="ACCESSORY">ACCESSORY</option>
            <option value="PHONE">PHONE</option>
            <option value="SERVICE">SERVICE</option>
            <option value="OTHER">OTHER</option>
          </select>

          <input
            name="name"
            placeholder="Product Name"
            value={form.name || ""}
            onChange={handleChange}
            className="border p-2 rounded-md"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              name="sellingPrice"
              placeholder="Selling Price"
              value={form.sellingPrice ?? ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />
            <input
              type="number"
              name="costPrice"
              placeholder="Cost Price"
              value={form.costPrice ?? ""}
              onChange={handleChange}
              className="border p-2 rounded-md"
            />
          </div>

          <input
            type="number"
            name="quantity"
            placeholder="Quantity"
            value={form.quantity ?? ""}
            onChange={handleChange}
            className="border p-2 rounded-md"
          />

          <input
            name="model"
            placeholder="Model"
            value={form.model || ""}
            onChange={handleChange}
            className="border p-2 rounded-md"
          />

          {isPhone && (
            <>
              <input
                name="imei"
                placeholder="IMEI"
                value={form.imei || ""}
                onChange={handleChange}
                className="border p-2 rounded-md"
              />
              <input
                name="condition"
                placeholder="Condition"
                value={form.condition || ""}
                onChange={handleChange}
                className="border p-2 rounded-md"
              />
            </>
          )}

          <textarea
            name="description"
            placeholder="Description"
            value={form.description || ""}
            onChange={handleChange}
            className="border p-2 rounded-md"
          />

          {/* CATEGORY */}
          <select
            value={selectedCategoryId || (newCategoryName ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedCategoryId(undefined);
                setNewCategoryName("");
              } else {
                setSelectedCategoryId(e.target.value);
                setNewCategoryName(null);
              }
            }}
            className="border p-2 rounded-md"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="new">+ Add New Category</option>
          </select>

          {newCategoryName !== null && (
            <>
              <input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category"
                className="border p-2 rounded-md"
              />
              <input type="file" onChange={handleCategoryImageChange} />
              {categoryImage && <img src={categoryImage} className="w-20 h-20" />}
            </>
          )}

          {/* BRAND */}
          <select
            value={selectedBrandId || (newBrandName ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedBrandId(undefined);
                setNewBrandName("");
              } else {
                setSelectedBrandId(e.target.value);
                setNewBrandName(null);
              }
            }}
            className="border p-2 rounded-md"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
            <option value="new">+ Add New Brand</option>
          </select>

          {newBrandName !== null && (
            <input
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="New brand"
              className="border p-2 rounded-md"
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              disabled= {submitting}
            >
              {product
                ? submitting
                  ? "Updating"
                  : "update"
                : submitting
                ? "Adding"
                : "add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}