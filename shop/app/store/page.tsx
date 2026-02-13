"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import jwt from "jsonwebtoken";
import { Plus, Search, Box, X } from "lucide-react";

/* ---------------- TYPES ---------------- */

type Category = {
  _id: string;
  name: string;
};

type Brand = {
  _id: string;
  name: string;
};

type ItemCategoryCard = {
  _id: string;
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
};

/* ---------------- COMPONENT ---------------- */

export default function InventoryPage() {
  /* ---------------- AUTH ---------------- */
  const [role, setRole] = useState<"admin" | "staff" | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) return;

    try {
      const decoded: any = jwt.decode(token);
      setRole(decoded?.role ?? null);
    } catch {
      setRole(null);
    }
  }, []);

  /* ---------------- DASHBOARD DATA ---------------- */
  const [categories, setCategories] = useState<ItemCategoryCard[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);

  /* ---------------- FORM STATE ---------------- */
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [model, setModel] = useState("");
  const [stock, setStock] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [description, setDescription] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [brandName, setBrandName] = useState("");

  const [search, setSearch] = useState("");

  /* ---------------- FETCH DASHBOARD CATEGORIES ---------------- */
  async function fetchDashboardCategories() {
    const res = await fetch("/api/items/categories-with-stock");
    if (!res.ok) return;

    const data = await res.json();
    setCategories(Array.isArray(data.categories) ? data.categories : []);
  }

  async function fetchAllCategories() {
    const res = await fetch("/api/items/categories");
    if (!res.ok) return;

    const data = await res.json();
    setAllCategories(Array.isArray(data) ? data : []);
  }

  /* ---------------- FETCH BRANDS FOR SELECTED CATEGORY ---------------- */
  useEffect(() => {
    if (!categoryId || categoryId === "new") {
      setFilteredBrands([]);
      return;
    }

    fetch(`/api/items/brands?categoryId=${categoryId}`)
      .then((res) => res.json())
      .then((data) => setFilteredBrands(Array.isArray(data) ? data : []));
  }, [categoryId]);

  /* ---------------- INITIAL DATA LOAD ---------------- */
  useEffect(() => {
    fetchDashboardCategories();
    fetchAllCategories();

    const interval = setInterval(fetchDashboardCategories, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (role !== "admin") return;

    setLoading(true);

    const token = document.cookie
      .split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    const formData = new FormData();
    formData.append("name", name);
    formData.append("type", type);
    formData.append("model", model);
    formData.append("stock", stock);
    formData.append("costPrice", costPrice);
    formData.append("sellingPrice", sellingPrice);
    formData.append("description", description);

    if (categoryId && categoryId !== "new") formData.append("categoryId", categoryId);
    if (categoryId === "new") formData.append("categoryName", categoryName);

    if (brandId && brandId !== "new") formData.append("brandId", brandId);
    if (brandId === "new") formData.append("brandName", brandName);

    if (image) formData.append("image", image);

    const res = await fetch("/api/items", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    resetForm();
    fetchDashboardCategories();
    fetchAllCategories();
  }

  function resetForm() {
    setShowModal(false);
    setImage(null);
    setPreview(null);

    setName("");
    setType("");
    setModel("");
    setStock("");
    setCostPrice("");
    setSellingPrice("");
    setDescription("");

    setCategoryId("");
    setCategoryName("");
    setBrandId("");
    setBrandName("");
  }

  useEffect(() => {
    setBrandId("");
    setBrandName("");
  }, [categoryId]);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Box size={24} /> Inventory
        </h1>
        {role === "admin" && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-1"
          >
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-2 top-2 text-gray-400" />
        <input
          className="border p-2 pl-8 w-full rounded"
          placeholder="Search item..."
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/store/${cat.name.toLowerCase()}`}
            className="bg-white rounded-xl shadow hover:scale-105 transition overflow-hidden"
          >
            <div className="h-32 flex items-center justify-center bg-gray-50">
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="h-full object-contain"
              />
            </div>
            {cat.hasOutOfStock && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full animate-pulse" />
            )}
            <div className="p-4 font-bold">{cat.name}</div>
          </Link>
        ))}
      </div>

      {/* Modal */}
      {showModal && role === "admin" && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[420px]">
            <h2 className="text-xl font-bold mb-4 flex gap-2">
              <Plus size={18} /> Add New Item
            </h2>

            <form onSubmit={handleAdd} className="grid grid-cols-2 gap-3">
              {/* Name + Type */}
              <input
                className="border p-2 rounded"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                placeholder="Type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              />

              {/* Category */}
              <select
                aria-label="categories"
                className="border p-2 rounded"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {allCategories.map((c) => (
                  <option key={`cat-${c._id}`} value={c._id}>
                    {c.name}
                  </option>
                ))}
                <option value="new">+ Add new</option>
              </select>
              {categoryId === "new" && (
                <input
                  className="border p-2 rounded"
                  placeholder="New category"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              )}

              {/* Brand */}
              <select
                aria-label="Brand"
                className="border p-2 rounded"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
              >
                <option value="">Select brand</option>
                {filteredBrands.map((b) => (
                  <option key={`brand-${b._id}`} value={b._id}>
                    {b.name}
                  </option>
                ))}
                <option value="new">+ Add new</option>
              </select>
              {brandId === "new" && (
                <input
                  className="border p-2 rounded"
                  placeholder="New brand"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              )}

              {/* Model + Stock + Prices */}
              <input
                className="border p-2 rounded"
                placeholder="Model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Cost Price"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
              <input
                className="border p-2 rounded"
                type="number"
                placeholder="Selling Price"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
              />

              {/* Description */}
              <textarea
                className="border p-2 rounded col-span-2"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              {/* Buttons */}
              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="border px-3 py-1 rounded flex items-center gap-1"
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  {loading ? "Adding..." : "Add Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
