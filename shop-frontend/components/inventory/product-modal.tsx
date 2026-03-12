"use client";

import { useState, useEffect } from "react";
import { Product, useInventoryStore } from "../../store/inventoryStore";
import { addBrands, addCategories } from "@/offline/db/helpers";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void;
  product?: Product;
}

export default function ProductModal({ isOpen, onClose, onSave, product }: Props) {
  const {
    categories,
    brands,
    selectedCategoryId,
    selectedBrandId,
    setSelectedCategoryId,
    setSelectedBrandId,
  } = useInventoryStore();

  const [form, setForm] = useState<Partial<Product>>({});
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);

  // Load product for editing
  useEffect(() => {
    if (product) {
      setForm(product);
      if (product.brand) setSelectedBrandId(product.brand.id);
      const cat = categories.find((c) => c.id === product.brand?.categoryId);
      if (cat) setSelectedCategoryId(cat.id);
      setNewCategoryName(null);
      setNewBrandName(null);
    } else {
      setForm({});
      setSelectedCategoryId(undefined);
      setSelectedBrandId(undefined);
      setNewCategoryName(null);
      setNewBrandName(null);
      setCategoryImage(null);
    }
  }, [product, categories]);

  // Reset brand when category changes
  useEffect(() => {
    setSelectedBrandId(undefined);
  }, [selectedCategoryId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: ["sellingPrice", "costPrice", "quantity"].includes(name) ? Number(value) : value,
    }));
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCategoryImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.sellingPrice || !form.quantity) {
      return alert("Name, selling price, and quantity are required");
    }

    const categoryPayload = selectedCategoryId
      ? { categoryId: selectedCategoryId }
      : newCategoryName
      ? { categoryName: newCategoryName, imageUrl: categoryImage || undefined }
      : null;

    const brandPayload = selectedBrandId
      ? { brandId: selectedBrandId }
      : newBrandName
      ? { brandName: newBrandName }
      : null;

    if (!categoryPayload || !brandPayload) {
      return alert("Category and brand are required");
    }

    const payload = {
      ...form,
      stockMode: form.stockMode || "OPENING",
      ...categoryPayload,
      ...brandPayload,
    };

    if (newCategoryName) {
      await addCategories([{
        name: newCategoryName,
        imageUrl: categoryImage || undefined,
        timestamp: Date.now()
      }])
    }

    if (newBrandName) {
      await addBrands([{
        name: newBrandName,
        categoryId: selectedCategoryId || undefined,
        timestamp: Date.now()
      }])
    }

    onSave(payload);
  };

  if (!isOpen) return null;

  const isPhone = form.type === "PHONE";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-2">{product ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Product Type */}
          <select
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            className="border p-2 rounded-md w-full shadow-sm focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select Product Type</option>
            <option value="ACCESSORY">ACCESSORY</option>
            <option value="PHONE">PHONE</option>
            <option value="SERVICE">SERVICE</option>
            <option value="OTHER">OTHER</option>
          </select>

          {/* Product Info */}
          <input type="text" name="name" placeholder="Product Name" value={form.name || ""} onChange={handleChange} className="border p-2 rounded-md w-full shadow-sm" />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice ?? ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />
            <input type="number" name="costPrice" placeholder="Cost Price" value={form.costPrice ?? ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />
          </div>
          <input type="number" name="quantity" placeholder="Quantity" value={form.quantity ?? ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />
          <input type="text" name="model" placeholder="Model" value={form.model || ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />
          {isPhone && (
            <>
              <input type="text" name="imei" placeholder="IMEI" value={form.imei || ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />
              <input type="text" name="condition" placeholder="Condition" value={form.condition || ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />
            </>
          )}
          <textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} className="border p-2 rounded-md shadow-sm" />

          {/* Category */}
          <select
            value={selectedCategoryId || (newCategoryName ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedCategoryId(undefined);
                setNewCategoryName("");
              } else {
                const cat = categories.find((c) => c.id === e.target.value);
                setSelectedCategoryId(cat?.id);
                setNewCategoryName(null);
              }
            }}
            className="border p-2 rounded-md w-full shadow-sm"
          >
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="new">+ Add New Category</option>
          </select>

          {newCategoryName !== null && (
            <>
              <input type="text" placeholder="Enter new category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="border p-2 rounded-md w-full shadow-sm" />
              <input type="file" accept="image/*" onChange={handleCategoryImageChange} className="mb-1" />
              {categoryImage && <img src={categoryImage} alt="Preview" className="w-20 h-20 object-cover rounded mb-2" />}
            </>
          )}

          {/* Brand */}
          <select
            value={selectedBrandId || (newBrandName ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedBrandId(undefined);
                setNewBrandName("");
              } else {
                const brand = brands.find((b) => b.id === e.target.value);
                setSelectedBrandId(brand?.id);
                setNewBrandName(null);
              }
            }}
            className="border p-2 rounded-md w-full shadow-sm"
          >
            <option value="">Select Brand</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            <option value="new">+ Add New Brand</option>
          </select>

          {newBrandName !== null && (
            <input type="text" placeholder="Enter new brand name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="border p-2 rounded-md w-full shadow-sm" />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-100 transition">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">{product ? "Update" : "Add"}</button>
          </div>

        </form>
      </div>
    </div>
  );
}
