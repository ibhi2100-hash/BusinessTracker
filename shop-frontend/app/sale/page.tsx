// pages/inventory.tsx
"use client";

import { useEffect, useState } from "react";
import { useInventoryStore } from "../stores/inventoryStore";
import CategoryCard from "../components/CategoryCard";
import BrandDropdown from "../components/BrandDropdown";
import ProductCard from "../components/ProductCard";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  brand: { id: string; name: string };
}

export default function InventoryPage({ context }: { context: "sell" | "admin" }) {
  const { categories, brands, products, selectedCategory, selectedBrand, setBrands, setProducts } =
    useInventoryStore();

  const [loading, setLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        useInventoryStore.getState().setCategories(data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchCategories();
  }, []);

  // Fetch brands when category changes
  useEffect(() => {
    if (!selectedCategory) return setBrands([]), setProducts([]);

    async function fetchBrands() {
      const res = await fetch(`/api/brands?categoryId=${selectedCategory.id}`);
      const data = await res.json();
      setBrands(data);
      setProducts([]); // reset products when category changes
    }

    fetchBrands();
  }, [selectedCategory]);

  // Fetch products when brand changes
  useEffect(() => {
    if (!selectedBrand) return setProducts([]);

    async function fetchProducts() {
      const res = await fetch(`/api/products?brandId=${selectedBrand.id}`);
      const data = await res.json();
      setProducts(data);
    }

    fetchProducts();
  }, [selectedBrand]);

  // Handlers
  const handleSell = async (productId: string, quantity: number) => {
    // Implement sell logic
    console.log("Selling", productId, quantity);
  };

  const handleEdit = (product: Product) => {
    console.log("Edit product", product);
  };

  const handleDelete = (productId: string) => {
    console.log("Delete product", productId);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{context === "sell" ? "Sell Products" : "Inventory"}</h1>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {categories.map((c) => (
          <CategoryCard key={c.id} category={c} />
        ))}
      </div>

      {selectedCategory && <BrandDropdown />}

      <div className="grid grid-cols-3 gap-4 mt-4">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            context={context}
            onSell={handleSell}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
