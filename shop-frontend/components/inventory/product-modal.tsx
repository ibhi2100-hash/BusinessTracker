// components/inventory/ProductModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Product, useInventoryStore } from "../../store/inventoryStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: any) => void; // will be mapped to ProductDto
  product?: Product; // for editing
}

export default function ProductModal({ isOpen, onClose, onSave, product }: Props) {
  const {
    categories,
    brands,
    selectedCategory,
    selectedBrand,
    setSelectedCategory,
    setSelectedBrand,
    setBrands
  } = useInventoryStore();

  const [form, setForm] = useState<Partial<Product>>({});
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const [newBrandName, setNewBrandName] = useState<string | null>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);

  // Load product for editing
  useEffect(() => {
    if (product) {
      setForm(product);
      if (product.brand) setSelectedBrand(product.brand);
      const cat = categories.find(c => c.id === product.brand?.categoryId);
      if (cat) setSelectedCategory(cat);
      setNewCategoryName(null);
      setNewBrandName(null);
    } else {
      setForm({});
      setSelectedCategory(undefined);
      setSelectedBrand(undefined);
      setNewCategoryName(null);
      setNewBrandName(null);
      setCategoryImage(null);
    }
  }, [product, categories]);

  // Fetch brands when category changes
  useEffect(() => {
    if (!selectedCategory) return setBrands([]);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/brands?categoryId=${selectedCategory.id}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => setBrands(data))
      .catch(console.error);
  }, [selectedCategory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: ["price", "quantity", "sellingPrice", "costPrice"].includes(name) ? Number(value) : value }));
  };

  const handleCategoryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCategoryImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.sellingPrice || !form.quantity) {
      return alert("Name, selling price, and quantity are required");
    }

    const categoryPayload = selectedCategory?.id
      ? { categoryId: selectedCategory.id }
      : newCategoryName
      ? { categoryName: newCategoryName, imageUrl: categoryImage || undefined }
      : null;

    const brandPayload = selectedBrand?.id
      ? { brandId: selectedBrand.id }
      : newBrandName
      ? { brandName: newBrandName }
      : null;

    if (!categoryPayload || !brandPayload) {
      return alert("Category and brand are required");
    }

    const payload = {
      ...form,
      type: form.type,
      quantity: form.quantity,
      sellingPrice: form.sellingPrice,
      costPrice: form.costPrice,
      model: form.model,
      stockMode: form.stockMode || "OPENING",
      condition: form.condition,
      imei: form.imei,
      ...categoryPayload,
      ...brandPayload
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex justify-center items-center z-50">
      {/* Modal Content with Glass Effect */}
      <div className="bg-white/80 backdrop-blur-md rounded-lg w-96 p-6 max-h-[90vh] overflow-y-auto shadow-lg border border-white/20">
        <h2 className="text-xl font-bold mb-4">{product ? "Edit Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          {/* Product Type */}
          <select
            name="type"
            value={form.type || ""}
            onChange={handleChange}
            className="border p-2 rounded w-full mb-1"
          >
            <option value="">Select Product Type</option>
            <option value="ACCESSORY">ACCESSORY</option>
            <option value="PHONE">PHONE</option>
            <option value="SERVICE">SERVICE</option>
            <option value="OTHER">OTHER</option>
          </select>

          {/* Product Info */}
          <input type="text" name="name" placeholder="Product Name" value={form.name || ""} onChange={handleChange} className="border p-2 rounded" />
          <input type="number" name="sellingPrice" placeholder="Selling Price" value={form.sellingPrice ?? ""} onChange={handleChange} className="border p-2 rounded" />
          <input type="number" name="costPrice" placeholder="Cost Price" value={form.costPrice ?? ""} onChange={handleChange} className="border p-2 rounded" />
          <input type="number" name="quantity" placeholder="Quantity" value={form.quantity ?? ""} onChange={handleChange} className="border p-2 rounded" />
          <input type="text" name="model" placeholder="Model" value={form.model || ""} onChange={handleChange} className="border p-2 rounded" />
          <input type="text" name="imei" placeholder="IMEI" value={form.imei || ""} onChange={handleChange} className="border p-2 rounded" />
          <input type="text" name="condition" placeholder="Condition" value={form.condition || ""} onChange={handleChange} className="border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} className="border p-2 rounded" />

          {/* Category Dropdown */}
          <select
            value={selectedCategory?.id || (newCategoryName ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedCategory(undefined);
                setNewCategoryName("");
              } else {
                const cat = categories.find(c => c.id === e.target.value);
                setSelectedCategory(cat);
                setNewCategoryName(null);
              }
            }}
            className="border p-2 rounded w-full mb-1"
          >
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="new">+ Add New Category</option>
          </select>

          {newCategoryName !== null && (
            <>
              <input type="text" placeholder="Enter new category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="border p-2 rounded w-full mb-1" />
              <input type="file" accept="image/*" onChange={handleCategoryImageChange} className="mb-1" />
              {categoryImage && <img src={categoryImage} alt="Preview" className="w-16 h-16 object-cover mb-2 rounded" />}
            </>
          )}

          {/* Brand Dropdown */}
          <select
            value={selectedBrand?.id || (newBrandName ? "new" : "")}
            onChange={(e) => {
              if (e.target.value === "new") {
                setSelectedBrand(undefined);
                setNewBrandName("");
              } else {
                const brand = brands.find(b => b.id === e.target.value);
                setSelectedBrand(brand);
                setNewBrandName(null);
              }
            }}
            className="border p-2 rounded w-full mb-1"
          >
            <option value="">Select Brand</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            <option value="new">+ Add New Brand</option>
          </select>

          {newBrandName !== null && (
            <input type="text" placeholder="Enter new brand name" value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} className="border p-2 rounded w-full mb-1" />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{product ? "Update" : "Add"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
